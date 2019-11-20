import { json } from 'd3-fetch';
import config from '../../config';
import getRandomPipeline from '../../utils/random-data';
import formatData from '../../utils/format-data';
import loremIpsum from '../../utils/data/lorem-ipsum.mock';
import animals from '../../utils/data/animals.mock';
import demo from '../../utils/data/demo.mock';
import { loadState } from '../../utils';

/**
 * Configure the redux store's initial state
 * @param {Object}   pipelineData Formatted pipeline data
 * @param {Object}   props App component props
 */
export const getInitialState = (pipelineData, props = {}) => {
  // Load properties from localStorage if defined, else use defaults
  const {
    parameters = true,
    textLabels = true,
    theme = 'dark',
    view = 'combined'
  } = loadState();

  const visible = Object.assign(
    { labelBtn: true, themeBtn: true },
    props.visible
  );

  return {
    ...pipelineData,
    chartSize: {},
    parameters,
    textLabels,
    view,
    visible,
    theme: props.theme || theme
  };
};

/**
 * Determine how data should be loaded (i.e. async from JSON, or randomly-generated,
 * or directly via props), then load and format it.
 * @param {string|Array} data Either raw data itself, or a 'json'/'random' string
 * @param {Function} onLoadData Callback for adding data to the store once loaded
 */
export const loadData = (data, onLoadData) => {
  switch (data) {
    case 'random':
      return formatData(getRandomPipeline());
    case 'lorem':
      return formatData(loremIpsum);
    case 'animals':
      return formatData(animals);
    case 'demo':
      return formatData(demo);
    case 'json':
      loadJsonData().then(onLoadData);
      return formatData();
    case null:
      throw new Error('No data was provided to App component via props');
    default:
      return formatData(data);
  }
};

/**
 * Asynchronously load, parse and format data from json file using D3
 */
export const loadJsonData = () => {
  const { dataPath } = config();
  return json(dataPath)
    .catch(() => {
      throw new Error(
        `Unable to load pipeline data. Please check that you have placed a file at ${dataPath}`
      );
    })
    .then(formatData);
};
