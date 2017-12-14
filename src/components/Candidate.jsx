import browser from 'webextension-polyfill';
import React     from 'react';
import PropTypes from 'prop-types';

function noop() {}

function imageURL(type) {
  return browser.extension.getURL(`images/${type}.png`);
}

function typeImg(type) {
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

function className(isSelected, isMarked) {
  const classes = ['candidate'];
  if (isMarked) {
    classes.push('marked');
  }
  if (isSelected) {
    classes.push('selected');
  }
  return classes.join(' ');
}

/* eslint-disable object-curly-newline */
const Candidate = ({ item, isSelected, isMarked, onClick }) => (
  <div
    className={className(isSelected, isMarked)}
    role="button"
    onClick={onClick}
    onKeyUp={noop}
    tabIndex={0}
  >
    {typeImg(item.type)}
    {faviconImg(item.faviconUrl)}
    <span className="candidate-label">{item.label}</span>
  </div>
);

Candidate.propTypes = {
  item: PropTypes.shape({
    id:         PropTypes.string.isRequired,
    label:      PropTypes.string.isRequired,
    type:       PropTypes.string.isRequired,
    faviconUrl: PropTypes.string,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  isMarked:   PropTypes.bool.isRequired,
  onClick:    PropTypes.func.isRequired,
};

export default Candidate;
