# Copyright 2021 QuantumBlack Visual Analytics Limited
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
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
# or use the QuantumBlack Trademarks in any other manner that might cause
# confusion in the marketplace, including but not limited to in advertising,
# on websites, or on software.
#
# See the License for the specific language governing permissions and
# limitations under the License.
# pylint: disable=protected-access
from pathlib import Path
from textwrap import dedent

import pytest
from kedro.extras.datasets.pandas import CSVDataSet
from kedro.io import MemoryDataSet
from kedro.pipeline.node import node

from kedro_viz.models.graph import (
    DataNode,
    GraphNode,
    ModularPipeline,
    ParametersNode,
    RegisteredPipeline,
    TaskNode,
    TaskNodeMetadata,
    DataNodeMetadata,
    ParametersNodeMetadata,
)


def identity(x):
    return x


class TestGraphNodeCreation:
    @pytest.mark.parametrize(
        "namespace,expected_modular_pipelines",
        [
            (None, []),
            (
                "uk.data_science.model_training",
                ["uk", "uk.data_science", "uk.data_science.model_training",],
            ),
        ],
    )
    def test_create_task_node(self, namespace, expected_modular_pipelines):
        kedro_node = node(
            identity,
            inputs="x",
            outputs="y",
            name="identity_node",
            tags={"tag"},
            namespace=namespace,
        )
        task_node = GraphNode.create_task_node(kedro_node)
        assert isinstance(task_node, TaskNode)
        assert task_node.kedro_obj is kedro_node
        assert task_node.id == GraphNode._hash(str(kedro_node))
        assert task_node.name == "Identity Node"
        assert task_node.full_name == "identity_node"
        assert task_node.tags == {"tag"}
        assert task_node.pipelines == []
        assert task_node.modular_pipelines == expected_modular_pipelines

    @pytest.mark.parametrize(
        "dataset_name,pretty_name,expected_modular_pipelines",
        [
            ("dataset", "Dataset", []),
            (
                "uk.data_science.model_training.dataset",
                "Uk.data Science.model Training.dataset",
                ["uk", "uk.data_science", "uk.data_science.model_training",],
            ),
        ],
    )
    def test_create_data_node(
        self, dataset_name, pretty_name, expected_modular_pipelines
    ):
        kedro_dataset = CSVDataSet(filepath="foo.csv")
        data_node = GraphNode.create_data_node(
            full_name=dataset_name, layer="raw", tags=set(), dataset=kedro_dataset,
        )
        assert isinstance(data_node, DataNode)
        assert data_node.kedro_obj is kedro_dataset
        assert data_node.id == GraphNode._hash(dataset_name)
        assert data_node.name == pretty_name
        assert data_node.layer == "raw"
        assert data_node.tags == set()
        assert data_node.pipelines == []
        assert data_node.modular_pipelines == expected_modular_pipelines

    def test_create_parameters_all_parameters(self):
        parameters_dataset = MemoryDataSet(
            data={"test_split_ratio": 0.3, "num_epochs": 1000}
        )
        parameters_node = GraphNode.create_parameters_node(
            full_name="parameters", layer=None, tags={}, parameters=parameters_dataset
        )
        assert isinstance(parameters_node, ParametersNode)
        assert parameters_node.kedro_obj is parameters_dataset
        assert parameters_node.id == GraphNode._hash("parameters")
        assert parameters_node.is_all_parameters()
        assert not parameters_node.is_single_parameter()
        assert parameters_node.parameter_value == {
            "test_split_ratio": 0.3,
            "num_epochs": 1000,
        }
        assert parameters_node.modular_pipelines == []

    @pytest.mark.parametrize(
        "dataset_name,expected_modular_pipelines",
        [
            ("params:test_split_ratio", []),
            (
                "params:uk.data_science.model_training.test_split_ratio",
                ["uk", "uk.data_science", "uk.data_science.model_training"],
            ),
        ],
    )
    def test_create_parameters_node_single_parameter(
        self, dataset_name, expected_modular_pipelines
    ):
        parameters_dataset = MemoryDataSet(data=0.3)
        parameters_node = GraphNode.create_parameters_node(
            full_name=dataset_name, layer=None, tags={}, parameters=parameters_dataset
        )
        assert isinstance(parameters_node, ParametersNode)
        assert parameters_node.kedro_obj is parameters_dataset
        assert not parameters_node.is_all_parameters()
        assert parameters_node.is_single_parameter()
        assert parameters_node.parameter_value == 0.3
        assert parameters_node.modular_pipelines == expected_modular_pipelines


class TestGraphNodePipelines:
    def test_registered_pipeline_pretty_name(self):
        pipeline = RegisteredPipeline("__default__")
        assert pipeline.name == "Default"

    def test_modular_pipeline_pretty_name(self):
        pipeline = ModularPipeline("data_engineering")
        assert pipeline.name == "Data Engineering"

    def test_add_node_to_pipeline(self):
        default_pipeline = RegisteredPipeline("__default__")
        another_pipeline = RegisteredPipeline("testing")
        kedro_dataset = CSVDataSet(filepath="foo.csv")
        data_node = GraphNode.create_data_node(
            full_name="dataset", layer="raw", tags=set(), dataset=kedro_dataset,
        )
        assert data_node.pipelines == []
        data_node.add_pipeline(default_pipeline)
        assert data_node.belong_to_pipeline(default_pipeline)
        assert not data_node.belong_to_pipeline(another_pipeline)


class TestGraphNodeMetadata:
    @pytest.mark.parametrize(
        "dataset,have_metadata", [(MemoryDataSet(data=1), True), (None, False)]
    )
    def test_node_have_metadata(self, dataset, have_metadata):
        data_node = GraphNode.create_data_node(
            "test_dataset", layer=None, tags=set(), dataset=dataset
        )
        assert data_node.have_metadata() == have_metadata

    def test_task_node_metadata(self):
        kedro_node = node(
            identity,
            inputs="x",
            outputs="y",
            name="identity_node",
            tags={"tag"},
            namespace="namespace",
        )
        task_node = GraphNode.create_task_node(kedro_node)
        task_node_metadata = TaskNodeMetadata(task_node=task_node)
        assert task_node_metadata.code == dedent(
            """\
            def identity(x):
                return x
            """
        )
        assert task_node_metadata.filepath == str(
            Path(__file__).relative_to(Path.cwd().parent).expanduser()
        )
        assert task_node_metadata.parameters == {}

    def test_data_node_metadata(self):
        dataset = CSVDataSet(filepath="/tmp/dataset.csv")
        data_node = GraphNode.create_data_node(
            full_name="dataset", layer="raw", tags=set(), dataset=dataset,
        )
        data_node_metadata = DataNodeMetadata(data_node=data_node)
        assert (
            data_node_metadata.type
            == f"kedro.extras.datasets.pandas.csv_dataset.CSVDataSet"
        )
        assert data_node_metadata.filepath == "/tmp/dataset.csv"

    def test_parameters_metadata_all_parameters(self):
        parameters = {"test_split_ratio": 0.3, "num_epochs": 1000}
        parameters_dataset = MemoryDataSet(data=parameters)
        parameters_node = GraphNode.create_parameters_node(
            full_name="parameters", layer=None, tags={}, parameters=parameters_dataset
        )
        parameters_node_metadata = ParametersNodeMetadata(parameters_node)
        assert parameters_node_metadata.parameters == parameters

    def test_parameters_metadata_single_parameter(self):
        parameters_dataset = MemoryDataSet(data=0.3)
        parameters_node = GraphNode.create_parameters_node(
            full_name="params:test_split_ratio",
            layer=None,
            tags={},
            parameters=parameters_dataset,
        )
        parameters_node_metadata = ParametersNodeMetadata(parameters_node)
        assert parameters_node_metadata.parameters == {"test_split_ratio": 0.3}