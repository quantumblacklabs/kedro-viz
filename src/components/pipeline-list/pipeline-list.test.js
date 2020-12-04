import React from 'react';
import PipelineList, { mapStateToProps, mapDispatchToProps } from './index';
import { mockState, setup } from '../../utils/state.mock';

describe('PipelineList', () => {
  const pipelineIDs = mockState.animals.pipeline.ids.map((id, i) => [id, i]);

  it('renders without crashing', () => {
    const wrapper = setup.mount(<PipelineList onToggleOpen={jest.fn()} />);
    const container = wrapper.find('.pipeline-list');
    expect(container.length).toBe(1);
  });

  it('should call onToggleOpen when opening/closing', () => {
    const onToggleOpen = jest.fn();
    const wrapper = setup.mount(<PipelineList onToggleOpen={onToggleOpen} />);
    wrapper.find('.kui-dropdown__label').simulate('click');
    expect(onToggleOpen).toHaveBeenLastCalledWith(true);
    wrapper.find('.kui-dropdown__label').simulate('click');
    expect(onToggleOpen).toHaveBeenLastCalledWith(false);
  });

  test.each(pipelineIDs)(
    'should change the active pipeline to %s on clicking menu option %s',
    (id, i) => {
      const wrapper = setup.mount(<PipelineList onToggleOpen={jest.fn()} />);
      wrapper
        .find('MenuOption')
        .at(i)
        .simulate('click');
      expect(wrapper.find('PipelineList').props().pipeline.active).toBe(id);
    }
  );

  test.each(pipelineIDs)(
    'should apply an active class to a pipeline row only if it is active (id: %s, index: %s)',
    (id, i) => {
      const wrapper = setup.mount(<PipelineList onToggleOpen={jest.fn()} />);
      const { active } = wrapper.find('PipelineList').props().pipeline;
      const isActive = active === id;
      const hasClass = wrapper
        .find('MenuOption')
        .at(i)
        .hasClass('pipeline-list__option--active');
      expect(hasClass).toBe(isActive);
    }
  );

  it('maps state to props', () => {
    expect(mapStateToProps(mockState.animals)).toEqual({
      asyncDataSource: expect.any(Boolean),
      pipeline: {
        active: expect.any(String),
        main: expect.any(String),
        name: expect.any(Object),
        ids: expect.any(Array)
      },
      theme: mockState.animals.theme
    });
  });

  it('maps dispatch to props', async () => {
    const dispatch = jest.fn();
    mapDispatchToProps(dispatch).onUpdateActivePipeline({ value: '123' });
    expect(dispatch.mock.calls.length).toEqual(1);
  });
});
