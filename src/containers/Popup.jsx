/* global browser: false, confirm: false */
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { getMessage } from '../utils/i18n';

class Popup extends React.Component {
  componentDidMount() {
    setTimeout(() => this.input.focus(), 100);
  }
  render() {
    return (
      <form onSubmit={() => this.props.handleSubmit(this.input.value)}>
        <input
          ref={(input) => { this.input = input; }}
          type="text"
          value={this.props.query}
          onChange={e => this.props.handleInputChange(e.target.value)}
          placeholder={getMessage('commandInput.placeholder')}
        />
      </form>
    );
  }
}

function mapStateToProps(state) {
  return {
    query: state.query,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    handleSubmit:      value => dispatch({ type: 'COMMAND', payload: value }),
    handleInputChange: value => dispatch({ type: 'QUERY', payload: value }),
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Popup));
