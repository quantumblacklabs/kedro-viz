import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import {
  SearchBar,
  Checkbox,
  utils,
} from '@quantumblack/carbon-ui-components';
import { Scrollbars } from 'react-custom-scrollbars';
import { getNodes } from '../../selectors';
import {
  toggleNodeActive,
  toggleNodeDisabled,
  toggleNodesDisabled
} from '../../actions';
import './node-list.css';

const {
  escapeRegExp,
  getHighlightedText,
  handleKeyEvent,
} = utils;

class NodeList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: ''
    };
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.updateSearchValue = this.updateSearchValue.bind(this);
  }

  /**
   * Add a new highlightedLabel field to each of the results
   * @param {object} results
   * @return {object} The results array with a new field added
   */
  highlightMatch(results) {
    return results.map(result => ({
      highlightedLabel: getHighlightedText(
        result.name,
        this.state.searchValue
      ),
      ...result
    }));
  }

  /**
   * Check whether a name matches the search text
   * @param {string} name
   * @param {string} searchValue
   */
  nodeMatchesSearch(node, searchValue) {
    const valueRegex = searchValue ? new RegExp(escapeRegExp(searchValue), 'gi') : '';
    return node.name.match(valueRegex);
  }

  /**
   * Return only the results that match the search text
   * @param {object} results
   */
  filterResults(results) {
    return results.filter(node => this.nodeMatchesSearch(node, this.state.searchValue));
  }

  /**
   * Listen for keyboard events, and trigger relevant actions
   * @param {number} keyCode The key event keycode
   */
  handleKeyDown(event) {
    handleKeyEvent(event.keyCode, {
      escape: this.updateSearchValue.bind(this, '')
    });
  }

  /**
   * Apply the new search filter text to the component state
   * @param {string} searchValue The term being searched
   */
  updateSearchValue(searchValue) {
    this.setState({
      searchValue
    });
  }

  render() {
    const {
      onToggleAllNodes,
      onToggleNodeActive,
      onToggleNodeDisabled,
      nodes,
      theme
    } = this.props;
    const { searchValue } = this.state;
    const formattedNodes = this.highlightMatch(
      this.filterResults(nodes)
    );

    return (
      <React.Fragment>
        <div
          className='pipeline-node-list-search'
          onKeyDown={this.handleKeyDown}>
          <SearchBar
            onChange={this.updateSearchValue}
            value={searchValue} />
        </div>
        <Scrollbars
          className='pipeline-node-list-scrollbars'
          style={{ width: 'auto' }}
          autoHide
          hideTracksWhenNotNeeded>
          <div className='carbon'>
            <h2 className='pipeline-node-list__toggle-title'>All Elements</h2>
            <div className='pipeline-node-list__toggle-container'>
              <button
                onClick={() => onToggleAllNodes(formattedNodes, false)}
                className='pipeline-node-list__toggle'>
                <svg
                  className='pipeline-node-list__icon pipeline-node-list__icon--check'
                  width='24'
                  height='24'>
                  <polygon points='9.923 14.362 7.385 11.944 6 13.263 7.33384369 14.5336026 9.923 17 18 9.32 16.615 8' />
                </svg>
                Check all
              </button>
              <button
                onClick={() => onToggleAllNodes(formattedNodes, true)}
                className='pipeline-node-list__toggle'>
                <svg
                  className='pipeline-node-list__icon pipeline-node-list__icon--uncheck'
                  width='24'
                  height='24'>
                  <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' />
                </svg>
                Uncheck all
              </button>
            </div>
          </div>
          <ul className='pipeline-node-list'>
            { formattedNodes.map(node => (
              <li
                key={node.id}
                className={classnames('pipeline-node', {
                  'pipeline-node--active': node.active,
                  'pipeline-node--disabled': node.disabled_tag || node.disabled_view
                })}
                title={node.name}
                onMouseEnter={onToggleNodeActive(node, true)}
                onMouseLeave={onToggleNodeActive(node, false)}>
                <Checkbox
                  checked={!node.disabled_node}
                  label={<span dangerouslySetInnerHTML={{
                    __html: node.highlightedLabel
                  }} />}
                  name={node.name}
                  onChange={onToggleNodeDisabled(node)}
                  theme={theme}
                />
              </li>
            ))}
          </ul>
        </Scrollbars>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  nodes: getNodes(state),
  theme: state.theme,
});

const mapDispatchToProps = dispatch => ({
  onToggleNodeActive: (node, isActive) => () => {
    dispatch(toggleNodeActive(node.id, isActive));
  },
  onToggleNodeDisabled: node => (e, { checked }) => {
    dispatch(toggleNodeDisabled(node.id, !checked));
  },
  onToggleAllNodes: (formattedNodes, disabled) => {
    dispatch(toggleNodesDisabled(formattedNodes.map(node => node.id), disabled));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(NodeList);