import { createSelector } from 'reselect';
import { getPipelineNodeIDs, getPipelineModularPipelineIDs } from './pipeline';
import { arrayToObject } from '../utils';

const getModularPipelineIDs = (state) => state.modularPipeline.ids;
const getModularPipelineName = (state) => state.modularPipeline.name;
const getModularPipelineEnabled = (state) => state.modularPipeline.enabled;
const getModularPipelineContracted = (state) =>
  state.modularPipeline.contracted;
const getNodeIDs = (state) => state.node.ids;
const getNodeName = (state) => state.node.name;
const getNodeType = (state) => state.node.type;
const getNodeModularPipelines = (state) => state.node.modularPipelines;
const getEdge = (state) => state.edge;
const getEdgeIDs = (state) => state.edge.ids;
const getEdgeSources = (state) => state.edge.sources;
const getEdgeTargets = (state) => state.edge.targets;

/**
 * Get the total and enabled number of modular pipelines
 */
export const getModularPipelineCount = createSelector(
  [getPipelineModularPipelineIDs, getModularPipelineEnabled],
  (modularPipelineIDs, modularPipelineEnabled) => ({
    total: modularPipelineIDs.length,
    enabled: modularPipelineIDs.filter((id) => modularPipelineEnabled[id])
      .length,
  })
);

/**
 * List all the child nodes in each modular pipeline
 */
export const getModularPipelineChildren = createSelector(
  [getModularPipelineIDs, getNodeIDs, getNodeModularPipelines],
  (modularPipelineIDs, nodeIDs, nodeModularPipelines) => {
    const modPipNodes = arrayToObject(modularPipelineIDs, () => ({}));
    nodeIDs.forEach((nodeID) => {
      nodeModularPipelines[nodeID]?.forEach((modPipID) => {
        if (!modPipNodes[modPipID]) {
          modPipNodes[modPipID] = {};
        }
        modPipNodes[modPipID][nodeID] = true;
      });
    });
    return modPipNodes;
  }
);

/**
 * List all the parent modular pipelines for a given modular pipeline.
 * This assumes that IDs of modular pipelines contain their full path with
 * dot separators, e.g. foo.bar.baz is the child of foo.bar and foo.
 */
export const getModularPipelineParents = createSelector(
  [getModularPipelineIDs],
  (modularPipelineIDs) =>
    arrayToObject(modularPipelineIDs, (modPipID) =>
      modPipID
        .split('.')
        .map((part, i, parts) => parts.slice(0, i).join('.'))
        .slice(1)
    )
);

/**
 * Set disabled status if the node is specifically hidden,
 * and/or via a tag/view/type/modularPipeline
 */
export const getModularPipelineParentsContracted = createSelector(
  [
    getModularPipelineIDs,
    getModularPipelineParents,
    getModularPipelineContracted,
  ],
  (modularPipelineIDs, modularPipelineParents, modularPipelineContracted) =>
    arrayToObject(modularPipelineIDs, (modPipID) =>
      modularPipelineParents[modPipID].some(
        (id) => modularPipelineContracted[id]
      )
    )
);

/**
 * Get a list of input/output edges of modular pipeline pseudo-nodes
 * by examining the edges of their childen, and also create transitive edges
 * between collapsed modular pipelines
 */
export const getModularPipelineEdges = createSelector(
  [
    getModularPipelineIDs,
    getModularPipelineChildren,
    getNodeModularPipelines,
    getEdgeIDs,
    getEdgeSources,
    getEdgeTargets,
  ],
  (
    modularPipelineIDs,
    modularPipelineChildren,
    nodeModularPipelines,
    edgeIDs,
    edgeSources,
    edgeTargets
  ) => {
    // List of new edges generated from modular pipelines:
    const edges = {
      ids: {},
      sources: {},
      targets: {},
    };

    // Add a new edge to the list, if it doesn't already exist
    const addNewEdge = (source, target) => {
      const id = [source, target].join('|');
      edges.ids[id] = true;
      edges.sources[id] = source;
      edges.targets[id] = target;
    };

    for (const modPipID of modularPipelineIDs) {
      const children = modularPipelineChildren[modPipID];

      for (const edgeID of edgeIDs) {
        const source = edgeSources[edgeID];
        const target = edgeTargets[edgeID];
        const isInputEdge = children[target] && !children[source];
        const isOutputEdge = children[source] && !children[target];

        if (isInputEdge) {
          addNewEdge(source, modPipID);
          // If source has modular pipeline parents, link to those too:
          nodeModularPipelines[source].forEach((parent) => {
            addNewEdge(parent, modPipID);
          });
        } else if (isOutputEdge) {
          addNewEdge(modPipID, target);
          // If target has modular pipeline parents, link to those too:
          nodeModularPipelines[target].forEach((parent) => {
            addNewEdge(modPipID, parent);
          });
        }
      }
    }
    return edges;
  }
);

/**
 * Get the IDs of all nodes and modular pipelines combined before filtering
 */
export const getAllNodeIDs = createSelector(
  [getPipelineNodeIDs, getPipelineModularPipelineIDs],
  (nodeIDs, modularPipelineIDs) => nodeIDs.concat(modularPipelineIDs)
);

/**
 * Get the names of all nodes and modular pipelines combined before filtering
 */
export const getAllNodeNames = createSelector(
  [getNodeName, getModularPipelineName],
  (nodeName, modularPipelineName) => ({
    ...modularPipelineName,
    ...nodeName,
  })
);

/**
 * Get the types of all nodes and modular pipelines combined before filtering
 */
export const getAllNodeTypes = createSelector(
  [getNodeType, getModularPipelineIDs],
  (nodeType, modularPipelineIDs) => ({
    ...arrayToObject(modularPipelineIDs, () => 'pipeline'),
    ...nodeType,
  })
);

/**
 * Get the IDs of all edges and generated modular pipeline edges,
 * with their sources and targets, combined before filtering
 */
export const getAllEdges = createSelector(
  [getEdge, getModularPipelineEdges],
  (edge, modPipEdge) => ({
    ids: edge.ids.concat(Object.keys(modPipEdge.ids)),
    sources: { ...edge.sources, ...modPipEdge.sources },
    targets: { ...edge.targets, ...modPipEdge.targets },
  })
);

const intersection = (array1, array2) =>
  array1.filter((d) => array2.indexOf(d) !== -1);

/**
 * Determine whether a modular pipeline is both a parent and child of node(s)
 * that are not included as part of the MP. This would cause a circular
 * dependency error, so we need to prevent these MPs from being collapsed.
 */
export const getUncollapsibleModularPipelines = createSelector(
  [
    (state) => state.edge,
    getPipelineNodeIDs,
    getNodeModularPipelines,
    getAllNodeNames,
  ],
  (edge, nodeIDs, nodeModPips, nodeName) => {
    const modularPipelineIsCircular = {};
    /**
     * Recursively walk through the graph, to determine whether
     * a modular pipeline links back to itself.
     * @param {Array} path The route that has been explored so far
     */
    const walkGraphEdges = (path) => {
      edge.ids.forEach((edgeID) => {
        const source = path[path.length - 1];
        // Filter to only edges where the source node is the previous target
        if (edge.sources[edgeID] !== source.id) {
          return;
        }
        const id = edge.targets[edgeID];
        const target = { id, name: nodeName[id], modPips: nodeModPips[id] };
        const originIntersection = intersection(
          path[0].modPips,
          target.modPips
        );
        if (path.length === 1 && originIntersection.length) {
          return;
        }
        if (originIntersection.length) {
          originIntersection.forEach((modPipID) => {
            modularPipelineIsCircular[modPipID] = true;
          });
        } else {
          walkGraphEdges(path.concat(target));
        }
      });
    };
    // Walk the graph from every modular pipeline
    nodeIDs.forEach((nodeID) => {
      walkGraphEdges([
        {
          id: nodeID,
          name: nodeName[nodeID],
          modPips: nodeModPips[nodeID],
        },
      ]);
    });

    return modularPipelineIsCircular;
  }
);

/**
 * Retrieve the formatted list of modular pipeline filters
 */
export const getModularPipelineData = createSelector(
  [
    getModularPipelineIDs,
    getModularPipelineName,
    getModularPipelineEnabled,
    getModularPipelineContracted,
    getModularPipelineParentsContracted,
    getUncollapsibleModularPipelines,
  ],
  (
    modularPipelineIDs,
    modularPipelineName,
    modularPipelineEnabled,
    modularPipelineContracted,
    modularPipelineParentsContracted,
    modularPipelineUncollapsible
  ) =>
    modularPipelineIDs
      .slice()
      .sort()
      .map((id) => ({
        id,
        name: modularPipelineName[id],
        contracted: Boolean(
          modularPipelineParentsContracted[id] || modularPipelineContracted[id]
        ),
        disabled: Boolean(modularPipelineParentsContracted[id]),
        uncollapsible: Boolean(modularPipelineUncollapsible[id]),
        enabled: Boolean(modularPipelineEnabled[id]),
      }))
);
