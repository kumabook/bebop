/* global confirm: false */
import browser from 'webextension-polyfill';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import getMessage from '../utils/i18n';
import { defaultOrder } from '../reducers/options';

const dragIcon = browser.extension.getURL('images/drag.png');

const SortableItem = SortableElement(({ value }) => ((
  <li className="sortableListItem">
    <img src={dragIcon} className="dragIcon" alt="drag" />
    {value}
  </li>
)));

const SortableList = SortableContainer(({ items }) => ((
  <ul className="sortableList">
    {items.map((value, index) => (
      <SortableItem key={`item-${value}`} index={index} value={value} />
     ))}
  </ul>
)));

class Options extends React.Component {
  static get propTypes() {
    return {
      popupWidth:                     PropTypes.number.isRequired,
      orderOfCandidates:              PropTypes.arrayOf(PropTypes.string).isRequired,
      maxResultsForEmpty:             PropTypes.objectOf(PropTypes.number).isRequired,
      enabledCJKMove:                 PropTypes.bool.isRequired,
      handlePopupWidthChange:         PropTypes.func.isRequired,
      handleMaxResultsForEmptyChange: PropTypes.func.isRequired,
      handleCJKMoveChange:            PropTypes.func.isRequired,
      handleSortEnd:                  PropTypes.func.isRequired,
    };
  }
  handlePopupWidthChange(e) {
    if (!Number.isNaN(e.target.valueAsNumber)) {
      this.props.handlePopupWidthChange(e.target.valueAsNumber);
    }
  }
  renderInputsOfCandidates() {
    return defaultOrder.map((type) => {
      const n = this.props.maxResultsForEmpty[type];
      return (
        <div key={`maxResultsFor-${type}`}>
          <span className="maxResultsInputLabel">{type}</span>
          <input
            className="maxResultsInput"
            type="number"
            min="1"
            max="20"
            step="1"
            value={n}
            onChange={e => this.props.handleMaxResultsForEmptyChange({
                [type]: parseInt(e.target.value, 10),
              })}
          />
        </div>
      );
    });
  }
  render() {
    return (
      <div className="options">
        <h3 className="optionsTitle">Options</h3>
        <h4 className="optionsLabel">Popup width</h4>
        <input
          className="optionsValueInput popupWidthInput"
          type="number"
          min="200"
          max="5000"
          step="50"
          placeholder={getMessage('optionsUI_width')}
          value={this.props.popupWidth}
          onChange={e => this.handlePopupWidthChange(e)}
        />
        <h4 className="optionsLabel">Order of candidates</h4>
        <p className="optionsDescription">You can change order by drag</p>
        <SortableList items={this.props.orderOfCandidates} onSortEnd={this.props.handleSortEnd} />
        <h4 className="optionsLabel">Max results of candidates for empty query</h4>
        <div className="optionsValue">
          {this.renderInputsOfCandidates()}
        </div>
        <h4 className="optionsLabel">key-bindings</h4>
        <input
          className="optionsValueInput cjkMoveCheckbox"
          type="checkbox"
          checked={this.props.enabledCJKMove}
          onChange={e => this.props.handleCJKMoveChange(e.target.checked)}
        />
        C-j ... next-candidate, C-k ... previous-candidate
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    popupWidth:         state.popupWidth,
    orderOfCandidates:  state.orderOfCandidates,
    maxResultsForEmpty: state.maxResultsForEmpty,
    enabledCJKMove:     state.enabledCJKMove,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    handlePopupWidthChange:         payload => dispatch({ type: 'POPUP_WIDTH', payload }),
    handleSortEnd:                  payload => dispatch({ type: 'CHANGE_ORDER', payload }),
    handleMaxResultsForEmptyChange: payload => dispatch({
      type: 'UPDATE_MAX_RESULTS_FOR_EMPTY',
      payload,
    }),
    handleCJKMoveChange: payload => dispatch({
      type: 'ENABLE_CJK_MOVE',
      payload,
    }),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Options);
