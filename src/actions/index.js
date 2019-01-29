export const CHANGE_ACTIVE_PIPELINE = 'CHANGE_ACTIVE_PIPELINE';
export const CHANGE_VIEW = 'CHANGE_VIEW';
export const RESET_SNAPSHOT_DATA = 'RESET_SNAPSHOT_DATA';
export const TOGGLE_PARAMETERS = 'TOGGLE_PARAMETERS';
export const TOGGLE_TEXT_LABELS = 'TOGGLE_TEXT_LABELS';
export const UPDATE_NODE_PROPERTIES = 'UPDATE_NODE_PROPERTIES';

export function changeActivePipeline(pipeline) {
  return {
    type: CHANGE_ACTIVE_PIPELINE,
    pipeline
  };
}

export function changeView(view) {
  return {
    type: CHANGE_VIEW,
    view
  };
}

export function resetSnapshotData(snapshots) {
  return {
    type: RESET_SNAPSHOT_DATA,
    snapshots
  };
}

export function toggleParameters(parameters) {
  return {
    type: TOGGLE_PARAMETERS,
    parameters
  };
}

export function toggleTextLabels(textLabels) {
  return {
    type: TOGGLE_TEXT_LABELS,
    textLabels
  };
}

export function updateNodeProperties(matchNode, property, value) {
  return {
    type: UPDATE_NODE_PROPERTIES,
    matchNode,
    property,
    value
  };
}