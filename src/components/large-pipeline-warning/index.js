import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { toggleDisplayLargeGraph } from '../../actions/graph';
import { getGroupedNodes } from '../../selectors/nodes';
import Button from '@quantumblack/kedro-ui/lib/components/button';
import './large-pipeline-warning.css';

export const LargePipelineWarning = ({
  theme,
  nodes,
  onToggleDisplayLargeGraph,
  sidebarVisible
}) => {
  const elementCount =
    nodes.data.length + nodes.parameters.length + nodes.task.length;
  return (
    <div
      className={classnames('kedro', 'pipeline-warning', {
        'pipeline-warning--sidebar-visible': sidebarVisible
      })}>
      <h2 className="pipeline-warning__title">Your pipeline is large.</h2>
      <p className="pipeline-warning__subtitle">
        Your pipeline might take a while to render because it has{' '}
        <b>{elementCount}</b> elements. Use the sidebar controls to select a
        smaller graph, or click to render.
      </p>
      <Button theme={theme} onClick={() => onToggleDisplayLargeGraph(true)}>
        Render it anyway
      </Button>
    </div>
  );
};

export const mapStateToProps = state => ({
  theme: state.theme,
  sidebarVisible: state.visible.sidebar,
  nodes: getGroupedNodes(state)
});

export const mapDispatchToProps = dispatch => ({
  onToggleDisplayLargeGraph: value => {
    dispatch(toggleDisplayLargeGraph(value));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LargePipelineWarning);
