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
const getNodeModularPipelines = (state) => state.node.modularPipelines;
const getEdgeIDs = (state) => state.edge.ids;
const getEdgeSources = (state) => state.edge.sources;
const getEdgeTargets = (state) => state.edge.targets;

/**
 * Retrieve the formatted list of modular pipeline filters
 */
export const getModularPipelineData = createSelector(
  [
    getModularPipelineIDs,
    getModularPipelineName,
    getModularPipelineEnabled,
    getModularPipelineContracted,
  ],
  (
    modularPipelineIDs,
    modularPipelineName,
    modularPipelineEnabled,
    modularPipelineContracted
  ) =>
    modularPipelineIDs
      .slice()
      .sort()
      .map((id) => ({
        id,
        name: modularPipelineName[id],
        contracted: Boolean(modularPipelineContracted[id]),
        enabled: Boolean(modularPipelineEnabled[id]),
      }))
);

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
 * Create an object listing all the nodes in each modular pipeline
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
 * Get a list of input/output edges of visible modular pipeline pseudo-nodes
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

    const addNewEdge = (source, target) => {
      const id = [source, target].join('|');
      edges.ids[id] = true;
      edges.sources[id] = source;
      edges.targets[id] = target;
    };
    modularPipelineIDs.forEach((modPipID) => {
      const modPipNodes = modularPipelineChildren[modPipID];
      edgeIDs.forEach((edgeID) => {
        const source = edgeSources[edgeID];
        const target = edgeTargets[edgeID];
        if (modPipNodes[target] && !modPipNodes[source]) {
          // input edge
          addNewEdge(source, modPipID);
          // if source has mod pip parents, link to those as well
          nodeModularPipelines[source].forEach((parent) => {
            addNewEdge(parent, modPipID);
          });
        } else if (modPipNodes[source] && !modPipNodes[target]) {
          // output edge
          addNewEdge(modPipID, target);
          // if target has mod pip parents, link to those as well
          nodeModularPipelines[target].forEach((parent) => {
            addNewEdge(modPipID, parent);
          });
        }
      });
    });
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
 * Get the IDs of all edges and generated modular pipeline edges,
 * with their sources and targets, combined before filtering
 */
export const getAllEdges = createSelector(
  [getEdgeIDs, getEdgeSources, getEdgeTargets, getModularPipelineEdges],
  (edgeIDs, edgeSources, edgeTargets, modPipEdges) => ({
    ids: edgeIDs.concat(Object.keys(modPipEdges.ids)),
    sources: { ...edgeSources, ...modPipEdges.sources },
    targets: { ...edgeTargets, ...modPipEdges.targets },
  })
);
