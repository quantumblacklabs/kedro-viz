import { createSelector } from 'reselect';
import { getPipelineModularPipelineIDs } from './pipeline';

const getNodesModularPipelines = (state) => state.node.modularPipelines;
const getModularPipelineIDs = (state) => state.modularPipeline.ids;
const getModularPipelineName = (state) => state.modularPipeline.name;
const getModularPipelineEnabled = (state) => state.modularPipeline.enabled;

/**
 * Retrieve the formatted list of modular pipeline filters
 */
export const getModularPipelineData = createSelector(
  [getModularPipelineIDs, getModularPipelineName, getModularPipelineEnabled],
  (modularPipelineIDs, modularPipelineName, modularPipelineEnabled) =>
    modularPipelineIDs.sort().map((id) => ({
      id,
      name: modularPipelineName[id],
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
 * returns an array of modular pipelines with the corresponding
 * nodes for each modular pipeline
 */
export const getModularPipelineNodes = createSelector(
  [getNodesModularPipelines, getModularPipelineIDs],
  (allNodes, modularPipelines) => {
    return modularPipelines.map((modularPipeline) => {
      let nodes = [];
      Object.keys(allNodes).map((key) =>
        allNodes[key]
          ? allNodes[key].includes(modularPipeline) && nodes.push(key)
          : null
      );
      return {
        modularPipeline,
        nodes,
      };
    });
  }
);
