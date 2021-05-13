import cloneDeep from 'lodash.clonedeep';
import { arrayToObject } from '../utils';

/**
 * Check whether data is in expected format
 * @param {Object} data - The parsed data input
 * @return {Boolean} True if valid for formatting
 */
const validateInput = (data) => {
  if (!data) {
    throw new Error('No data provided to Kedro-Viz');
  }
  if (data === 'json') {
    // Data is still loading
    return false;
  }
  if (!Array.isArray(data.edges) || !Array.isArray(data.nodes)) {
    if (typeof jest === 'undefined') {
      console.error('Invalid Kedro-Viz data:', data);
    }
    throw new Error(
      'Invalid Kedro-Viz data input. Please ensure that your pipeline data includes arrays of nodes and edges'
    );
  }
  return true;
};

/**
 * Get unique, reproducible ID for each edge, based on its nodes
 * @param {Object} source - Name and type of the source node
 * @param {Object} target - Name and type of the target node
 */
const createEdgeID = (source, target) => [source, target].join('|');

/**
 * Add a new pipeline
 * @param {string} pipeline.id - Unique ID
 * @param {string} pipeline.name - Pipeline name
 */
const addPipeline = (state) => (pipeline) => {
  const { id } = pipeline;
  if (state.pipeline.name[id]) {
    return;
  }
  state.pipeline.ids.push(id);
  state.pipeline.name[id] = pipeline.name;
};

/**
 * Update the value of the active pipeline and main pipeline
 * @param {object} data Raw input
 * @param {object} newState.pipeline State pipeline output
 * @returns
 */
const setActivePipeline = (data, { pipeline }) => {
  if (pipeline.ids.length) {
    // Set to specified value, or the first in the list as fallback
    pipeline.main = data.selected_pipeline || pipeline.ids[0];
    // Set main as active if it's not already set, or
    // if the active pipeline from localStorage isn't recognised:
    if (!pipeline.active || !pipeline.ids.includes(pipeline.active)) {
      pipeline.active = pipeline.main;
    }
  }
  return pipeline;
};

/**
 * Add a new modular pipeline
 * @param {string} modularPipeline.id - Unique namespace of the modular pipeline
 * @param {string} modularPipeline.name - modular pipeline name
 */
const addModularPipeline = (state) => (modularPipeline) => {
  const { id, name } = modularPipeline;
  if (state.modularPipeline.name[id]) {
    return;
  }
  state.modularPipeline.ids.push(id);
  state.modularPipeline.name[id] = name;
};

/**
 * Add a new node if it doesn't already exist
 * @param {string} name - Default node name
 * @param {string} type - 'data' or 'task'
 * @param {Array} tags - List of associated tags
 */
const addNode = (state) => (node) => {
  const { id } = node;
  if (state.node.name[id]) {
    return;
  }
  state.node.ids.push(id);
  state.node.name[id] = node.name;
  state.node.fullName[id] = node.full_name || node.name;
  state.node.type[id] = node.type;
  state.node.layer[id] = node.layer;
  state.node.pipelines[id] = node.pipelines
    ? arrayToObject(node.pipelines, () => true)
    : {};
  state.node.tags[id] = node.tags || [];
  // supports for metadata in case it exists on initial load
  state.node.code[id] = node.code;
  state.node.parameters[id] = node.parameters;
  state.node.filepath[id] = node.filepath;
  state.node.datasetType[id] = node.datasetType;
  state.node.modularPipelines[id] = node.modular_pipelines || [];
};

/**
 * Create a new link between two nodes and add it to the edges array
 * @param {Object} source - Parent node
 * @param {Object} target - Child node
 */
const addEdge = (state) => ({ source, target }) => {
  const id = createEdgeID(source, target);
  if (state.edge.sources[id]) {
    return;
  }
  state.edge.ids.push(id);
  state.edge.sources[id] = source;
  state.edge.targets[id] = target;
};

/**
 * Add a new Tag if it doesn't already exist
 * @param {Object} tag - Tag object
 */
const addTag = (state) => (tag) => {
  const { id } = tag;
  if (state.tag.name[id]) {
    return;
  }
  state.tag.ids.push(id);
  state.tag.name[id] = tag.name;
};

/**
 * Add a new Layer if it doesn't already exist
 * @param {string} layer - Layer ID
 */
const addLayer = (state) => (layer) => {
  // Use layer name as both layer ID and name
  if (state.layer.name[layer]) {
    return;
  }
  state.layer.ids.push(layer);
  state.layer.name[layer] = layer;
};

/**
 * Convert the pipeline data into a normalized state object
 * @param {Object} data Raw unformatted data input
 * @return {Object} Formatted, normalized state
 */
const normalizeData = (state, data) => {
  const newState = cloneDeep(state);

  if (data === 'json') {
    newState.dataSource = 'json';
  } else if (data.source) {
    newState.dataSource = data.source;
  }

  if (!validateInput(data)) {
    return newState;
  }

  data.nodes.forEach(addNode(newState));
  data.edges.forEach(addEdge(newState));
  if (data.pipelines) {
    data.pipelines.forEach(addPipeline(newState));
    newState.pipeline = setActivePipeline(data, newState);
  }
  if (data.modular_pipelines) {
    data.modular_pipelines.forEach(addModularPipeline(newState));
  }
  if (data.tags) {
    data.tags.forEach(addTag(newState));
  }
  if (data.layers) {
    data.layers.forEach(addLayer(newState));
  }

  return newState;
};

export default normalizeData;
