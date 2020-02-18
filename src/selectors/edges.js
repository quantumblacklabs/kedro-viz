import { createSelector } from 'reselect';
import { arrayToObject } from '../utils';
import { getNodeDisabled } from './nodes';

const getNodeIDs = state => state.node.ids;
const getEdgeIDs = state => state.edge.ids;
const getEdgeSources = state => state.edge.sources;
const getEdgeTargets = state => state.edge.targets;

/**
 * Determine whether an edge should be disabled based on their source/target nodes
 */
export const getEdgeDisabled = createSelector(
  [getEdgeIDs, getNodeDisabled, getEdgeSources, getEdgeTargets],
  (edgeIDs, nodeDisabled, edgeSources, edgeTargets) =>
    arrayToObject(edgeIDs, edgeID => {
      const source = edgeSources[edgeID];
      const target = edgeTargets[edgeID];
      return Boolean(nodeDisabled[source] || nodeDisabled[target]);
    })
);

/**
 * Create a new transitive edge from the first and last edge in the path
 * @param {string} target Node ID for the new edge
 * @param {string} source Node ID for the new edge
 * @param {object} transitiveEdges Store of existing edges
 */
export const addNewEdge = (source, target, { edgeIDs, sources, targets }) => {
  const id = [source, target].join('|');
  if (!edgeIDs.includes(id)) {
    edgeIDs.push(id);
    sources[id] = source;
    targets[id] = target;
  }
};

/**
 * Create new edges to connect nodes which have a disabled node (or nodes)
 * in between them
 */
export const getTransitiveEdges = createSelector(
  [getNodeIDs, getEdgeIDs, getNodeDisabled, getEdgeSources, getEdgeTargets],
  (nodeIDs, edgeIDs, nodeDisabled, edgeSources, edgeTargets) => {
    const transitiveEdges = {
      edgeIDs: [],
      sources: {},
      targets: {}
    };

    /**
     * Recursively walk through the graph, stepping over disabled nodes,
     * generating a list of nodes visited so far, and create transitive edges
     * for each path that visits disabled nodes between enabled nodes.
     * @param {Array} path The route that has been explored so far
     */
    const walkGraphEdges = path => {
      edgeIDs.forEach(edgeID => {
        const source = path[path.length - 1];
        // Filter to only edges where the source node is the previous target
        if (edgeSources[edgeID] !== source) {
          return;
        }
        const target = edgeTargets[edgeID];
        if (nodeDisabled[target]) {
          // If target node is disabled then keep walking the graph
          walkGraphEdges(path.concat(target));
        } else if (path.length > 1) {
          // Else only create a new edge if there would be 3 or more nodes in the path
          addNewEdge(path[0], target, transitiveEdges);
        }
      });
    };

    // Examine the children of every enabled node. The walk only needs
    // to be run in a single direction (i.e. top down), because links
    // that end in a terminus can never be transitive.
    nodeIDs.forEach(nodeID => {
      if (!nodeDisabled[nodeID]) {
        walkGraphEdges([nodeID]);
      }
    });

    return transitiveEdges;
  }
);

/**
 * Get only the visible edges (plus transitive edges),
 * and return them formatted as an array of objects
 */
export const getVisibleEdges = createSelector(
  [
    getEdgeIDs,
    getEdgeDisabled,
    getEdgeSources,
    getEdgeTargets,
    getTransitiveEdges
  ],
  (edgeIDs, edgeDisabled, edgeSources, edgeTargets, transitiveEdges) =>
    edgeIDs
      .filter(id => !edgeDisabled[id])
      .concat(transitiveEdges.edgeIDs)
      .map(id => ({
        id,
        source: edgeSources[id] || transitiveEdges.sources[id],
        target: edgeTargets[id] || transitiveEdges.targets[id]
      }))
);
