import React from 'react';
import PlotlyModal from './index';
import { toggleNodeClicked, addNodeMetadata } from '../../actions/nodes';
import { setup } from '../../utils/state.mock';
import { togglePlotModal } from '../../actions';
import nodePlot from '../../utils/data/node_plot.mock.json';

const bullPlotNodeID = 'c3p345ed';

describe('Plotly Modal', () => {
  const mount = (props) => {
    return setup.mount(<PlotlyModal metadata={nodePlot.plot} />, {
      beforeLayoutActions: [
        () => toggleNodeClicked(props.nodeId),
        () => addNodeMetadata({ id: bullPlotNodeID, data: nodePlot }),
      ],
      afterLayoutActions: [
        () => {
          // Click the expected node
          return togglePlotModal(true);
        },
      ],
    });
  };

  it('renders without crashing', () => {
    const wrapper = mount({ nodeId: bullPlotNodeID });
    expect(wrapper.find('.pipeline-plotly-modal').length).toBe(1);
  });

  it('modal closes when collapse button is clicked', () => {
    const wrapper = mount({ nodeId: bullPlotNodeID });
    wrapper.find('.pipeline-plot-modal__collapse-plot').simulate('click');
    expect(wrapper.find('.pipeline-plotly-modal').length).toBe(0);
  });

  it('modal closes when back button is clicked', () => {
    const wrapper = mount({ nodeId: bullPlotNodeID });
    wrapper.find('.pipeline-plot-modal__back').simulate('click');
    expect(wrapper.find('.pipeline-plotly-modal').length).toBe(0);
  });

  it('shows plot when a plot node is clicked', () => {
    const wrapper = mount({ nodeId: bullPlotNodeID });
    expect(wrapper.find('.pipeline-plot-modal__header').length).toBe(1);
    expect(wrapper.find('.pipeline-plotly-chart').length).toBe(1);
  });
});
