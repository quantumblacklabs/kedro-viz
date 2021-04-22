import { createSelector } from 'reselect';
import { getPipelineNodeIDs, getPipelineModularPipelineIDs } from './pipeline';
import { arrayToObject } from '../utils';

const getNodeModularPipelines = (state) => state.node.modularPipelines;
const getModularPipelineIDs = (state) => state.modularPipeline.ids;
const getModularPipelineName = (state) => state.modularPipeline.name;
const getModularPipelineEnabled = (state) => state.modularPipeline.enabled;
const getModularPipelineContracted = (state) =>
  state.modularPipeline.contracted;
const getNodeIDs = (state) => state.node.ids;
const getNodeName = (state) => state.node.name;
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
 * by examining the edges of their childen
 */
export const getModularPipelineEdges = createSelector(
  [
    getModularPipelineIDs,
    getModularPipelineChildren,
    getEdgeIDs,
    getEdgeSources,
    getEdgeTargets,
  ],
  (
    modularPipelineIDs,
    modularPipelineChildren,
    edgeIDs,
    edgeSources,
    edgeTargets
  ) => {
    // List of new edges generated from modular pipelines:
    const edges = {
      ids: [],
      sources: {},
      targets: {},
      // @TODO remove these later if unused:
      // The corresponding modular pipeline for an edge ID:
      modPip: {},
      // List of edge IDs for each modular pipeline:
      modPipEdges: {},
    };

    const addNewEdge = (source, target, modPipID) => {
      const id = [source, target].join('|');
      edges.ids.push(id);
      edges.sources[id] = source;
      edges.targets[id] = target;
      edges.modPip[id] = modPipID;
      edges.modPipEdges[modPipID].push(id);
    };
    modularPipelineIDs.forEach((modPipID) => {
      edges.modPipEdges[modPipID] = [];
      const modPipNodes = modularPipelineChildren[modPipID];
      edgeIDs.forEach((edgeID) => {
        const source = edgeSources[edgeID];
        const target = edgeTargets[edgeID];
        if (modPipNodes[target] && !modPipNodes[source]) {
          // input edge
          addNewEdge(source, modPipID, modPipID);
        } else if (modPipNodes[source] && !modPipNodes[target]) {
          // output edge
          addNewEdge(modPipID, target, modPipID);
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
    ids: edgeIDs.concat(modPipEdges.ids),
    sources: { ...edgeSources, ...modPipEdges.sources },
    targets: { ...edgeTargets, ...modPipEdges.targets },
  })
);