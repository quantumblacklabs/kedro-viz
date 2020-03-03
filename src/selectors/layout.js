import { createSelector } from 'reselect';
import dagre from 'dagre';
import { getNodeActive, getVisibleNodes } from './nodes';
import { getVisibleEdges } from './edges';

const getRanker = state => state.ranker;
const getNodeType = state => state.node.type;
const getChartSize = state => state.chartSize;

/**
 * Calculate chart layout with Dagre.js.
 * This is an extremely expensive operation so we want it to run as infrequently
 * as possible, and keep it separate from other properties (like node.active)
 * which don't affect layout.
 */
export const getGraph = createSelector(
  [getVisibleNodes, getVisibleEdges, getRanker],
  (nodes, edges, ranker) => {
    const graph = new dagre.graphlib.Graph().setGraph({
      ranker,
      marginx: 40,
      marginy: 40
    });

    nodes.forEach(node => {
      graph.setNode(node.id, node);
    });

    edges.forEach(edge => {
      graph.setEdge(edge.source, edge.target, edge);
    });

    // Run Dagre layout to calculate X/Y positioning
    dagre.layout(graph);

    return graph;
  }
);

/**
 * Reformat node data for use on the chart,
 * and recombine with other data that doesn't affect layout
 */
export const getLayoutNodes = createSelector(
  [getGraph, getNodeType, getNodeActive],
  (graph, nodeType, nodeActive) =>
    graph.nodes().map(nodeID => {
      const node = graph.node(nodeID);
      return Object.assign({}, node, {
        type: nodeType[nodeID],
        order: node.x + node.y * 9999,
        active: nodeActive[nodeID]
      });
    })
);

/**
 * Reformat edge data for use on the chart
 */
export const getLayoutEdges = createSelector(
  [getGraph],
  graph => graph.edges().map(edge => Object.assign({}, graph.edge(edge)))
);

/**
 * Get width, height and margin of graph
 */
export const getGraphSize = createSelector(
  [getGraph],
  graph => graph.graph()
);

/**
 * Get chart zoom translation/scale,
 * by comparing native graph width/height to container width/height
 */
export const getZoomPosition = createSelector(
  [getGraphSize, getChartSize],
  (graph, container) => {
    const validDimensions = [
      container.width,
      container.height,
      graph.width,
      graph.height
    ].every(n => !isNaN(n) && Number.isFinite(n));

    if (validDimensions) {
      const scale = Math.min(
        container.width / graph.width,
        container.height / graph.height
      );
      return {
        scale,
        translateX: container.width / 2 - (graph.width * scale) / 2,
        translateY: container.height / 2 - (graph.height * scale) / 2
      };
    }
    return {
      scale: 1,
      translateX: 0,
      translateY: 0
    };
  }
);

/**
 * Get band positions
 */
export const getBands = createSelector(
  [getLayoutNodes],
  nodes => {
    const max = Math.pow(2, 25);

    const bandY = {};
    nodes.forEach(node => {
      if (!bandY[node.rank]) {
        bandY[node.rank] = node.y;
      }
    });

    return Object.keys(bandY).map((rank, i) => {
      const neighbourY = bandY[i - 1] || bandY[i + 1];
      const height = Math.abs(bandY[i] - neighbourY);

      return {
        rank,
        x: max / -2,
        y: bandY[i] - height / 2,
        width: max,
        height
      };
    });
  }
);
