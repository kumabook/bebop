/* global confirm: false */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { getMessage } from '../utils/i18n';
import Candidate from '../components/Candidate';
import keySequence from '../key_sequences';
import { commandOfSeq } from '../sagas/popup';

class Popup extends React.Component {
  static get propTypes() {
    return {
      query:             PropTypes.string.isRequired,
      candidates:        PropTypes.arrayOf(PropTypes.object).isRequired,
      index:             PropTypes.number,
      handleCommand:     PropTypes.func.isRequired,
      handleInputChange: PropTypes.func.isRequired,
      handleKeydown:     PropTypes.func.isRequired,
      popupWidth:        PropTypes.number.isRequired,
    };
  }
  static get defaultProps() {
    return {
      index: null,
    };
  }
  componentDidMount() {
    setTimeout(() => {
      this.input.focus();
      document.scrollingElement.scrollTo(0, 0);
    }, 100);
  }
  componentDidUpdate() {
    if (this.selectedCandidate) {
      const container       = document.scrollingElement;
      const height          = container.clientHeight;
      const { bottom, top } = this.selectedCandidate.getBoundingClientRect();
      if (bottom > height || top < 0) {
        this.selectedCandidate.scrollIntoView({ block: 'end' });
      }
    }
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
          className="commandInput"
          ref={(input) => { this.input = input; }}
          type="text"
          value={this.props.query}
          onChange={e => this.props.handleInputChange(e.target.value)}
          onKeyDown={this.props.handleKeydown}
          placeholder={getMessage('commandInput_placeholder')}
        />
        <ul className="candidatesList">
          {this.props.candidates.map((c, i) =>
            <li
              key={c.id}
              ref={(node) => {
                  if (i === this.props.index) {
                    this.selectedCandidate = node;
                  }
                }}
            >
              <Candidate
                item={c}
                isSelected={i === this.props.index}
              />
            </li>
           )}
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
