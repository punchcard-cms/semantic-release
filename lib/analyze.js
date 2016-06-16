'use strict';

const util = require('./util');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const semanticEmoji = {
  major: [
    ':boom:',
  ],
  minor: [
    ':new:',
    ':racehorse:',
    ':lock:',
  ],
  patch: [
    ':bug:',
    ':shirt:',
    ':art:',
    ':unamused:',
  ],
  prerelease: [
    ':crystal_ball:',
  ],
};

const states = [
  'major',
  'premajor',
  'minor',
  'preminor',
  'patch',
  'prepatch',
  'prerelease',
];

/*
 * Gets the highest type from all emoji
 */
const highestType = (emoji) => {
  let type = null;

  if (emoji === null) {
    return null;
  }

  emoji.forEach(e => {
    Object.keys(semanticEmoji).forEach(se => {
      if (semanticEmoji[se].indexOf(e) !== -1) {
        type = states.indexOf(se);
      }
    });
  });

  return type;
};

module.exports = (pluginConfig, info, cb) => {
  let type = null;
  const commits = _.cloneDeep(info.commits);

  type = commits.map(commit => {
    const msg = commit.message.trim();
    const emoji = util.getEmoji(msg);
    const highType = highestType(emoji);

    return highType;
  }).filter(high => {
    if (high === null) {
      return false;
    }

    return true;
  }).sort().reduce((prev, curr) => {
    return Math.min(prev, curr);
  });

  type = states[type];

  fs.writeFileSync(path.join(process.cwd(), '.semantic-commits.json'), JSON.stringify(info.commits));

  cb(null, type);
};
