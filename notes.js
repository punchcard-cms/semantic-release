'use strict';

const dateformat = require('dateformat');
const parseUrl = require('github-url-from-git');
const util = require('./lib/util');
const fs = require('fs');
const path = require('path');

const merge = /^Merge /;

module.exports = (pluginConfig, info, cb) => {
  let notes = '';
  const repository = info.pkg.repository ? parseUrl(info.pkg.repository.url) : null;
  const pkg = info.pkg;

  const commits = info.commits ? info.commits : JSON.parse(fs.readFileSync(path.join(process.cwd(), '.semantic-commits.json')).toString());

  const changes = {
    new: [],
    changed: [],
    leftover: [],
    breaking: [],
  };

  notes += `## ${pkg.version}\n`;
  notes += `**${dateformat(new Date(), 'mmmm dd, yyyy')}**\n\n`;

  commits.forEach(commit => {
    // Get Emoji
    const emoji = util.getEmoji(commit.message) || [];
    const message = commit.message.trim().split('\n').filter(msg => {
      if (msg === '') {
        return false;
      }

      return true;
    });

    let msg = '';

    if (!merge.test(commit.message)) {
      // Add Message
      msg = `* ${message[0].trim()}`;

      // Add Link to Commit.
      if (repository !== null) {
        msg += ` ([commit](${repository}/commit/${commit.hash}))`;
      }

      // Add sub-messages as sub-bullets
      if (message.length > 1) {
        message.shift();
        message.forEach(submsg => {
          msg += `\n  * ${submsg}`;
        });
      }

      // Determine which section to add message to
      if (msg.indexOf(':boom:') !== -1) {
        changes.breaking.push(msg);
      }
      else if (msg.indexOf(':new:') >= 0 || msg.indexOf(':racehorse:') >= 0 || msg.indexOf(':lock:') >= 0) {
        changes.new.push(msg);
      }
      else if (emoji.length) {
        changes.changed.push(msg);
      }
      else {
        changes.leftover.push(msg);
      }
    }
  });

  // Write out messages
  if (changes.breaking.length) {
    notes += '**Breaking Changes**\n\n';
    notes += changes.breaking.join('\n');
    notes += '\n\n';
  }

  if (changes.new.length) {
    notes += '**New**\n\n';
    notes += changes.new.join('\n');
    notes += '\n\n';
  }

  if (changes.changed.length || changes.leftover.length) {
    notes += '**Changed**\n\n';
    if (changes.changed.length) {
      notes += changes.changed.join('\n');
    }
    notes += '\n';

    if (changes.leftover.length) {
      notes += changes.leftover.join('\n');
    }
    notes += '\n';
  }

  cb(null, notes);
};
