/* global confirm: false */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import getMessage from '../utils/i18n';
import Candidate from '../components/Candidate';
import keySequence from '../key_sequences';
import { commandOfSeq } from '../sagas/popup';

class Popup extends React.Component {
  static get propTypes() {
    return {
      query:                 PropTypes.string.isRequired,
      candidates:            PropTypes.arrayOf(PropTypes.object).isRequired,
      index:                 PropTypes.number,
      handleSelectCandidate: PropTypes.func.isRequired,
      handleInputChange:     PropTypes.func.isRequired,
      handleKeydown:         PropTypes.func.isRequired,
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
      if (document.scrollingElement) {
        document.scrollingElement.scrollTo(0, 0);
      }
    }, 100);
  }
  componentDidUpdate() {
    if (this.selectedCandidate && document.scrollingElement) {
      const container       = document.scrollingElement;
      const height          = container.clientHeight;
      const { bottom, top } = this.selectedCandidate.getBoundingClientRect();
      if (bottom > height || top < 0) {
        this.selectedCandidate.scrollIntoView({ block: 'end' });
      }
    }
  }
  getSelectedCandidate() {
    if (this.props.index === null) {
      return null;
    }
    return this.normalizeCandidate(this.props.candidates[this.props.index]);
  }
  normalizeCandidate(candidate) {
    if (!candidate) {
      return null;
    }
    if (candidate.type === 'search') {
      // eslint-disable-next-line no-param-reassign
      candidate.args = [this.input.value];
    }
    return candidate;
  }
  handleSubmit() {
    const candidate = this.getSelectedCandidate();
    if (candidate !== null) {
      this.props.handleSelectCandidate(candidate);
    }
  }
  handleCandidateClick(index) {
    const candidate = this.normalizeCandidate(this.props.candidates[index]);
    if (candidate !== null) {
      this.props.handleSelectCandidate(candidate);
    }
  }
  render() {
    return (
      <form
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
          {this.props.candidates.map((c, i) => (
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
                onClick={() => this.handleCandidateClick(i)}
              />
            </li>))
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
  };
}

function mapDispatchToProps(dispatch) {
  return {
    handleSelectCandidate: payload => dispatch({ type: 'SELECT_CANDIDATE', payload }),
    handleInputChange:     payload => dispatch({ type: 'QUERY', payload }),
    handleKeydown:         (e) => {
      const keySeq = keySequence(e);
      if (commandOfSeq[keySeq]) {
        e.preventDefault();
        dispatch({ type: 'KEY_SEQUENCE', payload: keySeq });
      }
    },
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Popup));
