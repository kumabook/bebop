import browser from 'webextension-polyfill';
import React     from 'react';
import PropTypes from 'prop-types';

function imageURL(type) {
  return browser.extension.getURL(`images/${type}.png`);
}

const Candidate = ({ item, isSelected }) => (
  <div className={isSelected ? 'candidate selected' : 'candidate'}>
    <img className="candidate-icon" src={imageURL(item.type)} alt={item.type} />
    <span>{item.label}</span>
  </div>
);

Candidate.propTypes = {
  item: PropTypes.shape({
    id:    PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type:  PropTypes.string.isRequired,
    name:  PropTypes.string.isRequired,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
};

export default Candidate;
