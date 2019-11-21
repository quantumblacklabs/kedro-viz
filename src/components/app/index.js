import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import store from '../../store';
import { resetData } from '../../actions';
import Wrapper from '../wrapper';
import formatData from '../../utils/format-data';
import { getInitialState, loadData } from './load-data';
import '@quantumblack/kedro-ui/lib/styles/app.css';
import './app.css';

/**
 * Main wrapper component. Handles store, and loads/formats pipeline data
 */
class App extends React.Component {
  constructor(props) {
    super(props);
    const pipelineData = loadData(props.data, this.resetStoreData.bind(this));
    const initialState = getInitialState(pipelineData, props);
    this.store = store(initialState);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data.schema_id !== this.props.data.schema_id) {
      this.resetStoreData(formatData(this.props.data));
    }
  }

  /**
   * Dispatch an action to update the store with new pipeline data
   * @param {Object} formattedData Normalised state data
   */
  resetStoreData(formattedData) {
    this.store.dispatch(resetData(formattedData));
  }

  render() {
    return this.props.data ? (
      <Provider store={this.store}>
        <Wrapper />
      </Provider>
    ) : null;
  }
}

App.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      schema_id: PropTypes.string,
      edges: PropTypes.array.isRequired,
      nodes: PropTypes.array.isRequired,
      tags: PropTypes.array
    })
  ]),
  theme: PropTypes.oneOf(['dark', 'light']),
  visible: PropTypes.shape({
    labelBtn: PropTypes.bool,
    themeBtn: PropTypes.bool
  })
};

App.defaultProps = {
  /**
   * String (e.g. 'json') or pipeline data
   */
  data: null,
  theme: null,
  visible: {}
};

export default App;
