/* global confirm: false */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { getMessage } from '../utils/i18n';
import Candidate from '../components/Candidate';
import keySequence from '../key_sequences';
import { commandOfSeq } from '../sagas/popup.js';

class Popup extends React.Component {
  static get propTypes() {
    return {
      query:             PropTypes.string.isRequired,
      candidates:        PropTypes.arrayOf(PropTypes.object).isRequired,
      index:             PropTypes.number,
      handleCommand:     PropTypes.func.isRequired,
      handleInputChange: PropTypes.func.isRequired,
      handleKeydown:     PropTypes.func.isRequired,
      popupWidth:        PropTypes.number,
    };
  }
  static get defaultProps() {
    return {
      index:      null,
      popupWidth: null,
    };
  }
  componentDidMount() {
    setTimeout(() => this.input.focus(), 100);
  }
  handleSubmit() {
    if (this.props.index !== null) {
      this.props.handleCommand(this.props.candidates[this.props.index]);
    }
  }
  render() {
    const style = { width: this.props.popupWidth };
    return (
      <form
        style={style}
        className="commandForm"
        onSubmit={() => this.handleSubmit(this.input.value)}
      >
        <input
          ref={(input) => { this.input = input; }}
          type="text"
          value={this.props.query}
          onChange={e => this.props.handleInputChange(e.target.value)}
          onKeyDown={this.props.handleKeydown}
          placeholder={getMessage('commandInput_placeholder')}
        />
        <ul className="candidatesList">
          {this.props.candidates.map((c, i) =>
            <Candidate key={c.id} item={c} isSelected={i === this.props.index} />)
          }
        </ul>
      </form>
    );
  }
}

function mapStateToProps(state) {
  return {
    query:      state.query,
    candidates: state.candidates.items,
    index:      state.candidates.index,
    popupWidth: state.popupWidth,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    handleCommand:     payload => dispatch({ type: 'COMMAND', payload }),
    handleInputChange: payload => dispatch({ type: 'QUERY', payload }),
    handleKeydown:     (e) => {
      const keySeq = keySequence(e);
      if (commandOfSeq[keySeq]) {
        e.preventDefault();
        dispatch({ type: 'KEY_SEQUENCE', payload: keySeq });
      }
    },
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Popup));
