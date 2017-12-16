/* global confirm: false */
import browser from 'webextension-polyfill';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import getMessage from '../utils/i18n';

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
      popupWidth:             PropTypes.number.isRequired,
      orderOfCandidates:      PropTypes.arrayOf(PropTypes.string).isRequired,
      handlePopupWidthChange: PropTypes.func.isRequired,
      handleSortEnd:          PropTypes.func.isRequired,
    };
  }
  static get defaultProps() {
    return {
    };
  }
  handlePopupWidthChange(e) {
    if (!Number.isNaN(e.target.valueAsNumber)) {
      this.props.handlePopupWidthChange(e.target.valueAsNumber);
    }
  }
  render() {
    return (
      <div className="options">
        <h3 className="optionsTitle">Options</h3>
        <h4 className="optionsLabel">Popup width</h4>
        <input
          className="optionsValueInput"
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
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    popupWidth:                state.popupWidth,
    orderOfCandidates:         state.orderOfCandidates,
    defaultNumberOfCandidates: state.defaultNumberOfCandidates,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    handlePopupWidthChange: payload => dispatch({ type: 'POPUP_WIDTH', payload }),
    handleSortEnd:          payload => dispatch({ type: 'CHANGE_ORDER', payload }),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Options);
