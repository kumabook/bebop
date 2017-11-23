/* global browser: false, confirm: false */
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { getMessage } from '../utils/i18n';

class Popup extends React.Component {
  render() {
    return (
      <div>
        <div className="">
          <input
            ref={(input) => { this.input = input; }}
            type="text"
            onChange={e => this.props.handleInputChange(e.target.value)}
            placeholder={getMessage('commandInput.placeholder')}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    query: state.query,
  };
}

function mapDispatchToProps(dispatch, { history }) {
  return {
    handleInputChange: (value) => {
      dispatch('COMMAND', value);
    },
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Popup));
