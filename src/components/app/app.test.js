import React from 'react';
import { shallow } from 'enzyme';
import App from './index';
import mockData from '../../utils/data.mock';

describe('App', () => {
  describe('renders without crashing', () => {
    it('when loading random data', () => {
      shallow(<App data="random" />);
    });

    it('when loading json data', () => {
      shallow(<App data="json" />);
    });

    it('when being passed data as a prop', () => {
      shallow(<App data={mockData.lorem} />);
    });
  });

  describe('updates the store', () => {
    const getSnapshotIDs = wrapper =>
      wrapper.instance().store.getState().snapshotIDs;

    it('when data prop is set on first load', () => {
      const wrapper = shallow(<App data={mockData.lorem} />);
      expect(getSnapshotIDs(wrapper)[0]).toEqual(mockData.lorem.schema_id);
    });

    it('when data prop is updated', () => {
      const wrapper = shallow(<App data={mockData.lorem} />);
      wrapper.setProps({ data: mockData.animals });
      expect(getSnapshotIDs(wrapper)[0]).toEqual(mockData.animals.schema_id);
    });
  });

  describe('throws an error', () => {
    it('when data prop is empty', () => {
      expect(() => shallow(<App />)).toThrow();
    });
  });
});
