import browser from 'webextension-polyfill';
import React     from 'react';
import PropTypes from 'prop-types';

function noop() {}

function imageURL(type) {
  return browser.extension.getURL(`images/${type}.png`);
}

function commandTypeImg(type) {
  switch (type) {
    case 'search':
      return <span className="candidate-icon-dummy" />;
    default:
      return <img className="candidate-icon" src={imageURL(type)} alt={type} />;
  }
}

function faviconImg(url) {
  let src = url;
  if (!src) {
    src = browser.extension.getURL('images/blank_page.png');
  }
  return <img className="candidate-icon" src={src} alt="favicon" />;
}

const Candidate = ({ item, isSelected, onClick }) => (
  <div
    className={isSelected ? 'candidate selected' : 'candidate'}
    role="button"
    onClick={onClick}
    onKeyUp={noop}
    tabIndex={0}
  >
    {commandTypeImg(item.type)}
    {faviconImg(item.faviconUrl)}
    <span className="candidate-label">{item.label}</span>
  </div>
);

Candidate.propTypes = {
  item: PropTypes.shape({
    id:         PropTypes.string.isRequired,
    label:      PropTypes.string.isRequired,
    type:       PropTypes.string.isRequired,
    name:       PropTypes.string.isRequired,
    faviconUrl: PropTypes.string,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick:    PropTypes.func.isRequired,
};

export default Candidate;
