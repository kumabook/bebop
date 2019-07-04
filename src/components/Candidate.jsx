import browser from 'webextension-polyfill';
import React     from 'react';
import PropTypes from 'prop-types';

import { isExtensionUrl } from '../utils/url';

function noop() {}

function imageURL(type) {
  return browser.extension.getURL(`images/${type}.png`);
}

function typeImg(type) {
  const alt = type[0].toUpperCase();
  switch (type) {
    case 'search':
      return <span className="candidate-icon-dummy" />;
    default:
      return <img className="candidate-icon candidate-icon-ext" src={imageURL(type)} alt={alt} />;
  }
}

function faviconImg(url) {
  let src = url;
  let classes = 'candidate-icon';
  if (!src) {
    src = browser.extension.getURL('images/blank_page.png');
    classes += ' candidate-icon-ext';
  } else if (isExtensionUrl(url)) {
    classes += ' candidate-icon-ext';
  }
  return <img className={classes} src={src} alt="favicon" />;
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
