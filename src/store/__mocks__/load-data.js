import { getUrl } from '../../config';
import animals from '../../utils/data/animals.mock';
import demo from '../../utils/data/demo.mock';

/**
 * Mimic old deprecated API formats which didn't include newer fields
 * such as pipelines, layers, tags, etc
 * @param {object} data A dataset file
 */
export const mockAPIFeatureSupport = data => {
  let dataCopy = Object.assign({}, data);
  if (window.deletePipelines) {
    delete dataCopy.selected_pipeline;
    delete dataCopy.pipelines;
  }
  return dataCopy;
};

/**
 * Mock asynchronously loading/parsing data
 * @param {string} path JSON file location. Defaults to main data url from config.js
 * @return {function} A promise that will return when the file is loaded and parsed
 */
const loadJsonData = async (path = getUrl('main')) => {
  await Promise.resolve();
  // Use animals dataset in place of 'main' endpoint
  if (path.includes('main')) {
    return mockAPIFeatureSupport(animals);
  }
  // Use demo dataset for 'pipelines' endpoints
  if (path.includes('pipelines')) {
    return mockAPIFeatureSupport(demo);
  }
  const fullPath = `/public${path.substr(1)}`;
  throw new Error(
    `Unable to load pipeline data from ${path}. If you're running Kedro-Viz as a standalone (e.g. for JavaScript development), please check that you have placed a data file at ${fullPath}.`
  );
};

export default loadJsonData;
