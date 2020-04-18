# Copyright 2020 QuantumBlack Visual Analytics Limited
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
# OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
# NONINFRINGEMENT. IN NO EVENT WILL THE LICENSOR OR OTHER CONTRIBUTORS
# BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN
# ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF, OR IN
# CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#
# The QuantumBlack Visual Analytics Limited ("QuantumBlack") name and logo
# (either separately or in combination, "QuantumBlack Trademarks") are
# trademarks of QuantumBlack. The License does not grant you any right or
# license to the QuantumBlack Trademarks. You may not use the QuantumBlack
# Trademarks or any confusingly similar mark as a trademark for your product,
#     or use the QuantumBlack Trademarks in any other manner that might cause
# confusion in the marketplace, including but not limited to in advertising,
# on websites, or on software.
#
# See the License for the specific language governing permissions and
# limitations under the License.

""" Kedro-Viz plugin and webserver """

import hashlib
import json
import logging
import multiprocessing
import socket
import webbrowser
from collections import defaultdict
from contextlib import closing
from pathlib import Path
from typing import Dict, List, Any, Set

import click
import kedro
import requests
from flask import Flask, jsonify, send_from_directory
from IPython.core.display import HTML, display
from kedro.cli import get_project_context  # pylint: disable=ungrouped-imports
from kedro.cli.utils import KedroCliError  # pylint: disable=ungrouped-imports
from semver import match

from kedro_viz.utils import wait_for
from toposort import toposort_flatten

_VIZ_PROCESSES = {}  # type: Dict[int, multiprocessing.Process]

data = None  # pylint: disable=invalid-name

app = Flask(  # pylint: disable=invalid-name
    __name__, static_folder=str(Path(__file__).parent.absolute() / "html" / "static")
)

ERROR_PROJECT_ROOT = (
    "Could not find a Kedro project root. You can run `kedro viz` by either providing "
    "`--load-file` flag with a filepath to a JSON pipeline representation, "
    "or if the current working directory is the root of a Kedro project."
)

ERROR_PIPELINE_FLAG_NOT_SUPPORTED = (
    "`--pipeline` flag was provided, but it is not supported "
    "in Kedro version {}".format(kedro.__version__)
)


@app.route("/")
@app.route("/<path:subpath>")
def root(subpath="index.html"):
    """Serve the non static html and js etc"""
    return send_from_directory(
        str(Path(__file__).parent.absolute() / "html"), subpath, cache_timeout=0
    )


def _hash(value):
    return hashlib.sha1(value.encode("UTF-8")).hexdigest()[:8]


def _check_viz_up(port):
    url = "http://127.0.0.1:{}/".format(port)
    try:
        response = requests.get(url)
    except requests.ConnectionError:
        return False

    return response.status_code == 200


# pylint: disable=unused-argument
def run_viz(port=None, line=None) -> None:
    """
    Line magic function to start kedro viz. It calls a kedro viz in a process and display it in
    the Jupyter notebook environment.

    Args:
        port: TCP port that viz will listen to. Defaults to 4141.
        line: line required by line magic interface.

    """
    port = port or 4141  # Default argument doesn't work in Jupyter line magic
    port = _allocate_port(start_at=port)

    if port in _VIZ_PROCESSES and _VIZ_PROCESSES[port].is_alive():
        _VIZ_PROCESSES[port].terminate()

    viz_process = multiprocessing.Process(
        target=_call_viz, daemon=True, kwargs={"port": port}
    )
    viz_process.start()
    _VIZ_PROCESSES[port] = viz_process

    wait_for(func=_check_viz_up, port=port)

    wrapper = """
            <html lang="en"><head></head><body style="width:100; height:100;">
            <iframe src="http://127.0.0.1:{}/" height=500 width="100%"></iframe>
            </body></html>""".format(
        port
    )
    display(HTML(wrapper))


def _allocate_port(start_at: int, end_at: int = 65535) -> int:
    acceptable_ports = range(start_at, end_at + 1)

    viz_ports = _VIZ_PROCESSES.keys() & set(acceptable_ports)
    if viz_ports:  # reuse one of already allocated ports
        return sorted(viz_ports)[0]

    socket.setdefaulttimeout(2.0)  # seconds
    for port in acceptable_ports:  # iterate through all acceptable ports
        with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
            if sock.connect_ex(("127.0.0.1", port)) != 0:  # port is available
                return port

    raise ValueError(
        "Cannot allocate an open TCP port for Kedro-Viz in a range "
        "from {} to {}".format(start_at, end_at)
    )


def _load_from_file(load_file: str) -> dict:
    global data  # pylint: disable=global-statement,invalid-name
    data = json.loads(Path(load_file).read_text())
    for key in ["nodes", "edges", "tags"]:
        if key not in data:
            raise KedroCliError(
                "Invalid file, top level key '{}' not found.".format(key)
            )
    return data


def _get_pipeline_from_context(context, pipeline_name):
    if match(kedro.__version__, ">=0.15.2"):
        return context._get_pipeline(  # pylint: disable=protected-access
            name=pipeline_name
        )
    # Kedro 0.15.0 or 0.15.1
    if pipeline_name:
        raise KedroCliError(ERROR_PIPELINE_FLAG_NOT_SUPPORTED)
    return context.pipeline


def _get_pipeline_catalog_from_kedro14(env):
    try:
        pipeline = get_project_context("create_pipeline")()
        get_config = get_project_context("get_config")
        conf = get_config(str(Path.cwd()), env)
        create_catalog = get_project_context("create_catalog")
        catalog = create_catalog(config=conf)
        return pipeline, catalog
    except (ImportError, KeyError):
        raise KedroCliError(ERROR_PROJECT_ROOT)


def _sort_layers(
    nodes: Dict[str, Dict],
    node_dependencies: Dict[str, Set[str]],
) -> List[str]:
    """Given a DAG represented by a dictionary of nodes, some of which have a `layer` attribute,
    along with their dependencies, return the list of all layers sorted according to
    the nodes' topological order, i.e. a layer should appear before another layer in the list
    if its node is a dependency of the other layer's node, directly or indirectly.

    For example, given the following graph:
        node1(layer=a) -> node2 -> node4 -> node6(layer=d)
                            |                   ^
                            v                   |
                          node3(layer=b) -> node5(layer=c)
    The layers ordering should be: [a, b, c, d]

    The algorithm is as follows:
        * For every node, find all layers that depends on it in a depth-first search (dfs).
        * While traversing, build up a dictionary of {node_id -> set(layers)} for the node
        that has already been visited.
        * Turn the final {node_id -> layers} into a {layer -> set(layers)} to represent the layers'
        dependencies, in which the key is a layer and the values are the parents of that layer.
        * Feed this layer dependencies dictionary to ``toposort`` and return the sorted values.
        * Raise ValueError if tha layers cannot be sorted topologically (i.e. there is a cycle
        among the layers)

    Args:
        nodes: A dictionary of {node_id -> node} represents the nodes in the graph.
            A node's schema is:
                {
                    "type": str,
                    "id": str,
                    "name": str,
                    "layer": Optional[str]
                    ...
                }
        node_dependencies: A dictionary of {node_id -> set(child_node_ids)}
            represents the direct dependencies between nodes in the graph.

    Returns:
        The list of layers sorted based on topological order.

    Raises:
        CircularDependencyError: When the layers have cyclic dependencies.
    """
    node_layers = {}  # map node_id to the layers that depend on it

    def find_dependent_layers(node_id: str) -> Set[str]:
        """For the given node_id, find all layers that depend on it in a depth-first manner.
        Build up the node_layers dependency dictionary while traversing so each node is visited
        only once.
        """
        if node_id in node_layers:
            return node_layers[node_id]

        node_layers[node_id] = set()
        for child_node_id in node_dependencies[node_id]:
            child_node = nodes[child_node_id]

            # add the direct layer's of the child node as a dependent layer of the current node
            child_node_layer = child_node.get("layer")
            if child_node_layer is not None:
                node_layers[node_id].add(child_node_layer)

            # add the dependent layers of the child node as dependent layers of the current node
            node_layers[node_id].update(find_dependent_layers(child_node_id))

        return node_layers[node_id]

    # populate node_layers dependencies
    for node_id in nodes:
        find_dependent_layers(node_id)

    # compute the layer dependencies dictionary based on the node_layers dependencies,
    # represented as {layer -> set(parent_layers)}
    layer_dependencies = defaultdict(set)
    for node_id, dependent_layers in node_layers.items():
        node_layer = nodes[node_id].get("layer")

        # add the node's layer as a parent layer for all dependent layers
        if node_layer is not None:
            for layer in dependent_layers:
                layer_dependencies[layer].add(node_layer)

    # toposort the layer_dependencies to find the layer order.
    # Note that for string, toposort_flatten will default to alphabetical order for tie-break.
    return toposort_flatten(layer_dependencies)


# pylint: disable=too-many-locals
def format_pipeline_data(pipeline, catalog):
    """
    Format pipeline and catalog data from Kedro for kedro-viz

    Args:
        pipeline: Kedro pipeline object
        catalog:  Kedro catalog object
    """

    def pretty_name(name):
        name = name.replace("-", " ").replace("_", " ")
        parts = [n[0].upper() + n[1:] for n in name.split()]
        return " ".join(parts)

    # keep tracking of node_id -> node data in the graph
    nodes = {}
    # keep track of node_id -> set(child_node_ids) for layers sorting
    node_dependencies = defaultdict(set)
    # keep track of edges in the graph: [{source_node_id -> target_node_id}]
    edges = []
    # keep_track of {data_set_namespace -> set(tags)}
    namespace_tags = defaultdict(set)
    # keep track of {data_set_namespace -> layer it belongs to}
    namespace_to_layer = {}
    all_tags = set()

    data_set_to_layer_map = {
        ds_name: getattr(ds_obj, "_layer", None)
        for ds_name, ds_obj in catalog._data_sets.items()  # pylint: disable=protected-access
    }

    for node in pipeline.nodes:
        task_id = _hash(str(node))
        all_tags.update(node.tags)
        nodes[task_id] = {
            "type": "task",
            "id": task_id,
            "name": getattr(node, "short_name", node.name),
            "full_name": getattr(node, "_func_name", str(node)),
            "tags": sorted(node.tags),
        }

        for data_set in node.inputs:
            namespace = data_set.split("@")[0]
            namespace_id = _hash(namespace)
            namespace_to_layer[namespace] = data_set_to_layer_map.get(data_set)
            edges.append({"source": namespace_id, "target": task_id})
            namespace_tags[namespace].update(node.tags)
            node_dependencies[namespace_id].add(task_id)

        for data_set in node.outputs:
            namespace = data_set.split("@")[0]
            namespace_id = _hash(namespace)
            namespace_to_layer[namespace] = data_set_to_layer_map.get(data_set)
            edges.append({"source": task_id, "target": namespace_id})
            namespace_tags[namespace].update(node.tags)
            node_dependencies[task_id].add(namespace_id)

    for namespace, tags in sorted(namespace_tags.items()):
        is_param = bool("param" in namespace.lower())
        node_id = _hash(namespace)
        nodes[node_id] = {
            "type": "parameters" if is_param else "data",
            "id": node_id,
            "name": pretty_name(namespace),
            "full_name": namespace,
            "tags": sorted(tags),
            "layer": namespace_to_layer[namespace],
        }

    tags = []
    for tag in sorted(all_tags):
        tags.append({"id": tag, "name": pretty_name(tag)})

    return {
        "nodes": list(sorted(nodes.values(), key=lambda n: n["name"])),
        "edges": edges,
        "tags": tags,
        "layers": _sort_layers(nodes, node_dependencies)
    }


@app.route("/api/nodes.json")
def nodes_json():
    """Serve the pipeline data."""
    return jsonify(data)


@click.group(name="Kedro-Viz")
def commands():
    """Visualize the pipeline using kedroviz."""


# pylint: disable=too-many-arguments
@commands.command(context_settings=dict(help_option_names=["-h", "--help"]))
@click.option(
    "--host",
    default="127.0.0.1",
    help="Host that viz will listen to. Defaults to 127.0.0.1.",
)
@click.option(
    "--port",
    default=4141,
    type=int,
    help="TCP port that viz will listen to. Defaults to 4141.",
)
@click.option(
    "--browser/--no-browser",
    default=True,
    help="Whether to open viz interface in the default browser or not. "
    "Browser will only be opened if host is localhost. Defaults to True.",
)
@click.option(
    "--load-file",
    default=None,
    type=click.Path(exists=True, dir_okay=False),
    help="Path to load the pipeline JSON file",
)
@click.option(
    "--save-file",
    default=None,
    type=click.Path(dir_okay=False, writable=True),
    help="Path to save the pipeline JSON file",
)
@click.option(
    "--pipeline",
    type=str,
    default=None,
    help="Name of the modular pipeline to visualize. "
    "If not set, the default pipeline is visualized",
)
@click.option(
    "--env",
    "-e",
    type=str,
    default=None,
    multiple=False,
    envvar="KEDRO_ENV",
    help="Kedro configuration environment. If not specified, "
    "catalog config in `local` will be used",
)
def viz(host, port, browser, load_file, save_file, pipeline, env):
    """Visualize the pipeline using kedroviz."""
    try:
        _call_viz(host, port, browser, load_file, save_file, pipeline, env)
    except KedroCliError:
        raise
    except Exception as ex:
        raise KedroCliError(str(ex))


# pylint: disable=too-many-arguments
def _call_viz(
    host=None,
    port=None,
    browser=None,
    load_file=None,
    save_file=None,
    pipeline_name=None,
    env=None,
):
    global data  # pylint: disable=global-statement,invalid-name

    if load_file:
        # Remove all handlers for root logger
        root_logger = logging.getLogger()
        root_logger.handlers = []

        data = _load_from_file(load_file)
    else:
        if match(kedro.__version__, ">=0.15.0"):
            # pylint: disable=import-outside-toplevel
            from kedro.context import KedroContextError

            try:
                context = get_project_context("context", env=env)
                pipeline = _get_pipeline_from_context(context, pipeline_name)
            except KedroContextError:
                raise KedroCliError(ERROR_PROJECT_ROOT)
            catalog = context.catalog

        else:
            # Kedro 0.14.*
            if pipeline_name:
                raise KedroCliError(ERROR_PIPELINE_FLAG_NOT_SUPPORTED)
            pipeline, catalog = _get_pipeline_catalog_from_kedro14(env)

        data = format_pipeline_data(pipeline, catalog)

    if save_file:
        Path(save_file).write_text(json.dumps(data, indent=4, sort_keys=True))
    else:
        is_localhost = host in ("127.0.0.1", "localhost", "0.0.0.0")
        if browser and is_localhost:
            webbrowser.open_new("http://{}:{:d}/".format(host, port))
        app.run(host=host, port=port)
