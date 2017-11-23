/* global confirm: false */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getMessage } from '../utils/i18n';

class Options extends React.Component {
  static get propTypes() {
    return {
      popupWidth:        PropTypes.number.isRequired,
      handlePopupWidthChange: PropTypes.func.isRequired,
    };
  }
  static get defaultProps() {
    return {
    };
  }
  handlePopupWidthChange(e) {
    if (!isNaN(e.target.valueAsNumber)) {
      this.props.handlePopupWidthChange(e.target.valueAsNumber);
    }
  }
  render() {
    return (
      <div className="options">
        <span className="popupWidthlabel">popup width</span>
        <input
          className="popupWidthInput"
          type="number"
          min="200"
          max="5000"
          step="50"
          placeholder={getMessage('optionsUI_width')}
          value={this.props.popupWidth}
          onChange={e => this.handlePopupWidthChange(e)}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    popupWidth: state.popupWidth,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    handlePopupWidthChange: payload => dispatch({ type: 'POPUP_WIDTH', payload }),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Options);
