import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ChartWrapper from '../chart-wrapper';
import '@quantumblack/carbon-ui-components/dist/carbon-ui.min.css';
import './store.css';

class Store extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activePipelineData: props.data[0],
      pipelineData: props.data,
      parameters: true,
      textLabels: false,
      view: 'combined',
      theme: 'dark'
    };
  }

  componentDidUpdate(prevProps) {
    const newData = this.props.data;
    if (prevProps.data !== newData) {
      this.setState({
        activePipelineData: newData[0],
        pipelineData: newData,
      });
    }
  }

  onChangeView(e, { value }) {
    this.setState({
      view: value
    });
  }

  onNodeUpdate(nodeID, property, value) {
    const { activePipelineData } = this.state;
    const nodes = activePipelineData.nodes.map(node => {
      if (node.id === nodeID) {
        node[property] = value;
      }
      return node;
    });
    this.setState({
      activePipelineData: Object.assign({}, activePipelineData, { nodes })
    });
  }

  onToggleParameters(parameters) {
    const { activePipelineData } = this.state;
    const nodes = activePipelineData.nodes.map(node => {
      if (node.id.includes('param')) {
        node.disabled = !parameters;
      }
      return node;
    });
    this.setState({
      activePipelineData: Object.assign({}, activePipelineData, { nodes }),
      parameters
    });
  }

  onToggleTextLabels(textLabels) {
    this.setState({ textLabels });
  }

  onChangeActivePipeline(activePipelineData) {
    this.setState({ activePipelineData });
  }

  render() {
    const { activePipelineData, pipelineData, parameters, textLabels, view } = this.state;

    if (!pipelineData) {
      return null;
    }

    return (
      <ChartWrapper
        {...this.props}
        {...this.state}
        onChangeActivePipeline={this.onChangeActivePipeline.bind(this)}
        onChangeView={this.onChangeView.bind(this)}
        onNodeUpdate={this.onNodeUpdate.bind(this)}
        onToggleParameters={this.onToggleParameters.bind(this)}
        onToggleTextLabels={this.onToggleTextLabels.bind(this)}
        chartParams={{
          data: activePipelineData,
          onNodeUpdate: this.onNodeUpdate.bind(this),
          parameters,
          textLabels,
          view,
        }} />
    );
  }
}

Store.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    nodes: PropTypes.array.isRequired,
    edges: PropTypes.array.isRequired,
    json_schema: PropTypes.array,
    message: PropTypes.string,
    created_ts: PropTypes.number,
  })),
  allowUploads: PropTypes.bool,
  showHistory: PropTypes.bool,
};

Store.defaultProps = {
  /**
   * Data array containing Pipeline snapshot objects
   */
  data: null,
  /**
   * Show/hide button to upload data snapshots to StudioAI
   */
  allowUploads: true,
  /**
   * Show/hide snapshot history tab in sidebar
   */
  showHistory: false,
};

export default Store;
