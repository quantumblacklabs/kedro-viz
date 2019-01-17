import React from 'react';
import classnames from 'classnames';
import {
  SearchBar,
  Checkbox,
  utils,
} from '@quantumblack/carbon-ui-components';
import './node-list.css';
import { Scrollbars } from 'react-custom-scrollbars';

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
  nameMatchesSearch(name, searchValue) {
    const valueRegex = searchValue ? new RegExp(escapeRegExp(searchValue), 'gi') : '';
    return name.match(valueRegex);
  }

  /**
   * Return only the results that match the search text
   * @param {object} results
   */
  filterResults(results) {
    const { searchValue } = this.state;
    return results.filter(({ name }) => this.nameMatchesSearch(name, searchValue));
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

  toggleAllNodes(disabled) {
    this.props.onNodeUpdate(
      name => this.nameMatchesSearch(name, this.state.searchValue),
      'disabled',
      disabled
    );
  }

  render() {
    const { nodes, onNodeUpdate, theme } = this.props;
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
          <ul className='pipeline-node-list'>
            { formattedNodes.map(node => (
              <li
                key={node.id}
                className={classnames('pipeline-node', {
                  'pipeline-node--active': node.active
                })}
                title={node.name}
                onMouseEnter={() => {
                  onNodeUpdate(id => id === node.id, 'active', true);
                }}
                onMouseLeave={() => {
                  onNodeUpdate(id => id === node.id, 'active', false);
                }}>
                <Checkbox
                  checked={!node.disabled}
                  label={<span dangerouslySetInnerHTML={{
                    __html: node.highlightedLabel
                  }} />}
                  name={node.name}
                  onChange={(e, { checked }) => {
                    onNodeUpdate(id => id === node.id, 'disabled', !checked);
                  }}
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

export default NodeList;