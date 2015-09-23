/* eslint-disable no-unused-expressions */
import {expect} from 'chai';

import Retracked from '../index';

describe('retracked', function() {

  var eventsRecorded;

  function mockRecord(fullEventKey, values) {
    const newEvent = [fullEventKey, values];
    eventsRecorded.push(newEvent);
  }

  beforeEach(function() {
    Retracked.setup(mockRecord, ['action1']);
    eventsRecorded = [];
  });

  it('should handle empty config', function() {
    var track = Retracked.makeTracker();
    track('event1', ['value1']);
    expect(eventsRecorded.length).to.equal(1);
    expect(eventsRecorded[0]).to.deep.equal([ 'event1', { 0: 'value1' } ]);
  });

  it('should include values from config', function() {
    var track = Retracked.makeTracker({include: {str: 'strValue', fun: () => 'funValue'}});
    track('event1', ['value1']);
    expect(eventsRecorded.length).to.equal(1);
    expect(eventsRecorded[0]).to.deep.equal([ 'event1',
      { 0: 'value1', fun: 'funValue', str: 'strValue' } ]);
  });

  it('should prepend namespace', function() {
    var track = Retracked.makeTracker({namespace: 'aNamespace'});
    track('event1', ['value1']);
    expect(eventsRecorded.length).to.equal(1);
    expect(eventsRecorded[0]).to.deep.equal([ 'aNamespace.event1', { 0: 'value1' } ]);
  });

  it('should prepend namespace', function() {
    var track = Retracked.makeTracker({namespace: 'aNamespace'});
    track('event1', ['value1']);
    expect(eventsRecorded.length).to.equal(1);
    expect(eventsRecorded[0]).to.deep.equal([ 'aNamespace.event1', { 0: 'value1' } ]);
  });

  it('should curry in handle', function() {
    var track = Retracked.makeTracker({namespace: 'aNamespace'});
    track.handle('event1', ['value1'])();
    expect(eventsRecorded.length).to.equal(1);
    expect(eventsRecorded[0]).to.deep.equal([ 'aNamespace.event1', { 0: 'value1' } ]);
  });

});
