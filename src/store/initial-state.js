import deepmerge from 'deepmerge';
import { loadState } from './helpers';
import normalizeData from './normalize-data';
import { getFlagsFromUrl, Flags } from '../utils/flags';

/**
 * Create new default state instance for properties that aren't overridden
 * when the pipeline is reset with new data via the App component's data prop
 * @return {object} state
 */
export const createInitialState = () => ({
  chartSize: {},
  flags: Flags.defaults(),
  textLabels: true,
  theme: 'dark',
  visible: {
    labelBtn: true,
    layerBtn: true,
    layers: true,
    exportBtn: true,
    exportModal: false,
    sidebar: true,
    themeBtn: true,
    miniMapBtn: true,
    miniMap: true
  },
  zoom: {}
});

/**
 * Add state overrides from props, URL flags, etc
 * @param {object} state App state
 * @param {object} props Props passed to App component
 */
export const overrideInitialState = (state, props) => {
  // Override flag defaults with URL values
  state.flags = Object.assign(state.flags, getFlagsFromUrl());
  // Override theme if set in props
  if (props.theme) {
    state.theme = props.theme;
  }
  // Override button visibility if set in props
  if (props.visible) {
    state.visible = Object.assign(state.visible, props.visible);
  }
  // Turn layers off if there are no layers present:
  if (!state.layer.ids.length) {
    state.visible.layers = false;
  }
  return state;
};

/**
 * Load values from localStorage, but filter any values that
 * aren't used in the main redux store
 * @param {array} keys
 * @return {object} filtered state from localStorage
 */
const getLocalStorageState = keys => {
  const localStorageState = loadState();
  const filteredLocalStorageState = {};
  keys.forEach(key => {
    if (localStorageState[key]) {
      filteredLocalStorageState[key] = localStorageState[key];
    }
  });
  return filteredLocalStorageState;
};

/**
 * Configure the redux store's initial state
 * @param {Object} props App component props
 * @return {Object} Initial state
 */
const getInitialState = (props = {}) => {
  // Merge default values with normalised pipeline data and localStorage
  const initialPipelineState = normalizeData(props.data);
  const initialNonPipelineState = createInitialState();
  const storeKeys = Object.keys(initialPipelineState).concat(
    Object.keys(initialNonPipelineState)
  );
  const localStorageState = getLocalStorageState(storeKeys);
  const initialState = deepmerge(
    initialPipelineState,
    // Perform 2 deepmerges seperately because it performs much faster
    deepmerge(initialNonPipelineState, localStorageState)
  );
  // Add overrides from props etc
  return overrideInitialState(initialState, props);
};

export default getInitialState;
