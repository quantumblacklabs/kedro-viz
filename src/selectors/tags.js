import { createSelector } from 'reselect';

const getActiveSnapshot = state => state.activeSnapshot;
const getSnapshotTags = state => state.snapshotTags;
const getTagName = state => state.tagName;
const getTagActive = state => state.tagActive;
const getTagEnabled = state => state.tagEnabled;

/**
 * Get a list of tags for the active snapshot
 */
export const getActiveSnapshotTags = createSelector(
  [getActiveSnapshot, getSnapshotTags],
  (activeSnapshot, snapshotTags) => snapshotTags[activeSnapshot]
);

/**
 * Retrieve the formatted list of tag filters
 * @param {Object} tags Active pipeline tag data
 * @return {Array} Tag data list
 */
export const getTags = createSelector(
  [getActiveSnapshotTags, getTagName, getTagActive, getTagEnabled],
  (activeSnapshotTags, tagName, tagActive, tagEnabled) => activeSnapshotTags
    .map(id => ({
      id,
      name: tagName[id],
      active: tagActive[id],
      enabled: tagEnabled[id],
    }))
    .sort((a, b) => b.name - a.name)
);

/**
 * Get the total and enabled number of tags
 * @param {Array} tags List of tag objects
 * @return {Object} total / enabled tags
 */
export const getTagCount = createSelector(
  [getActiveSnapshotTags, getTagEnabled],
  (activeSnapshotTags, tagEnabled) => ({
    total: activeSnapshotTags.length,
    enabled: activeSnapshotTags.filter(id => tagEnabled[id]).length,
  })
);