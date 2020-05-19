import React from 'react';
import { connect } from 'react-redux';
import { toggleNodesDisabled } from '../../actions/nodes';

export const NodeListToggleAll = ({ onToggleNodesDisabled, nodeIDs }) => (
  <div className="kedro pipeline-nodelist__toggle">
    <h2 className="pipeline-nodelist__toggle__title">All Elements</h2>
    <div className="pipeline-nodelist__toggle__row">
      <button
        onClick={() => onToggleNodesDisabled(nodeIDs, false)}
        className="pipeline-nodelist__toggle__button">
        <svg
          className="pipeline-nodelist__toggle__icon pipeline-nodelist__toggle__icon--check"
          width="24"
          height="24">
          <polygon points="9.923 14.362 7.385 11.944 6 13.263 7.33384369 14.5336026 9.923 17 18 9.32 16.615 8" />
        </svg>
        Show all
      </button>
      <button
        onClick={() => onToggleNodesDisabled(nodeIDs, true)}
        className="pipeline-nodelist__toggle__button">
        <svg
          className="pipeline-nodelist__toggle__icon pipeline-nodelist__toggle__icon--uncheck"
          width="24"
          height="24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
        Hide all
      </button>
    </div>
  </div>
);

export const mapDispatchToProps = dispatch => ({
  onToggleNodesDisabled: (nodeIDs, disabled) => {
    dispatch(toggleNodesDisabled(nodeIDs, disabled));
  }
});

export default connect(
  null,
  mapDispatchToProps
)(NodeListToggleAll);
