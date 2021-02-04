import { graph as worker, preventWorkerQueues } from '../utils/worker';
import { toggleGraph } from './index';
import { largeNodeAmount } from '../config';

export const TOGGLE_GRAPH_LOADING = 'TOGGLE_GRAPH_LOADING';

/**
 * Toggle whether to display the loading spinner
 * @param {boolean} loading
 */
export function toggleLoading(loading) {
  return {
    type: TOGGLE_GRAPH_LOADING,
    loading
  };
}

export const UPDATE_GRAPH_LAYOUT = 'UPDATE_GRAPH_LAYOUT';

/**
 * Update the graph layout object
 * @param {Object} graph
 */
export function updateGraph(graph) {
  return {
    type: UPDATE_GRAPH_LAYOUT,
    graph
  };
}

export const TOGGLE_DISPLAY_LARGE_GRAPH = 'TOGGLE_DISPLAY_LARGE_GRAPH';

/**
 * resets the disaplyLargeGraph setting to enable large graphs to load
 * @param {boolean} isLargeGraph
 */
export function toggleDisplayLargeGraph(displayLargeGraph) {
  return {
    type: TOGGLE_DISPLAY_LARGE_GRAPH,
    displayLargeGraph
  };
}

export const TOGGLE_IS_LARGE = 'TOGGLE_IS_LARGE';

/**
 * sets the isLarge field so wrapper is aware that the selected combination is large
 * @param {boolean} isLarge
 */
export function toggleIsLarge(isLarge) {
  return {
    type: TOGGLE_IS_LARGE,
    isLarge
  };
}

export const UPDATE_NODE_COUNT = 'UPDATE_NODE_COUNT';

/**
 * updates the amount of nodes for large pipeline warning page
 * @param {integer} nodeCount
 */
export function updateNodeCount(nodeCount) {
  return {
    type: UPDATE_NODE_COUNT,
    nodeCount
  };
}

/**
 * Choose which layout engine to use based on the oldgraph flag
 * @param {Object} instance Worker parent instance
 * @param {Object} state A subset of main state
 * @return {function} Promise function
 */
const chooseLayout = (instance, state) =>
  state.oldgraph ? instance.graphDagre(state) : instance.graphNew(state);

// Prepare new layout worker
const layoutWorker = preventWorkerQueues(worker, chooseLayout);

/**
 * Formula to determine if the pipeline is large
 */
const isLarge = (largeNodeAmount, nodesNo, edgesNo) => {
  return nodesNo + 1.5 * edgesNo > largeNodeAmount ? true : false;
};

/**
 * Async action to calculate graph layout in a web worker
 * whiled displaying a loading spinner
 * @param {Object} graphState A subset of main state
 * @return {function} A promise that resolves when the calcuation is done
 */
export function calculateGraph(graphState, customLargeLimit) {
  if (!graphState) {
    return updateGraph(graphState);
  }
  return async function(dispatch) {
    const { nodes, edges, displayLargeGraph } = graphState;

    const largeLimit = customLargeLimit || largeNodeAmount;

    if (
      isLarge(largeLimit, nodes.length, edges.length) === true &&
      displayLargeGraph === false
    ) {
      dispatch(toggleIsLarge(true));
      dispatch(updateNodeCount(nodes.length));
    } else {
      dispatch(toggleIsLarge(false));
      dispatch(toggleLoading(true));
      const graph = await layoutWorker(graphState);
      dispatch(toggleGraph(true));
      dispatch(toggleLoading(false));
      return dispatch(updateGraph(graph));
    }
  };
}
