import test from 'ava';
import fs from 'fs';
import notes from '../lib/notes';
import info from './fixtures/info';

test.cb('Generate Release Notes', t => {
  const expected = fs.readFileSync('./fixtures/notes.md').toString();

  return notes({}, info, (err, note) => {
    t.is(err, null, 'No Error');
    t.is(note, expected, 'Notes are output as expected');
    t.end();
  });
});
