'use strict';

/*
 * Splits emoji out of a commit message
 */
const getEmoji = (message) => {
  const pattern = /^((:(\w+):)*) /;
  const match = pattern.exec(message);

  if (!match) {
    return null;
  }

  return match[1].split('::').map(e => {
    return `:${e.replace(/:/g, '')}:`;
  });
};

module.exports.getEmoji = getEmoji;
