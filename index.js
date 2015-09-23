/**
 * Retracked wraps your event recording system in an API optimized for React components.
 *
 * .track(key, values) records an event immediately. (values are optional)
 *
 * .track.handle(key, values) returns a function that records the event when evaluated.
 */

import React from 'react';

var _recordEvent = function(fullEventKey, values) {
  throw new Error('Retracked setup() must first be called with an event recording function.');
};

var _actionNames = [];

function setup(recordEventFn, actionNames) {
  _recordEvent = recordEventFn;
  _actionNames = actionNames;
}

/**
 * Clone object, evaluting each property that is a function
 * @param  {Object} map keys map to simple values or functions
 * @return {Object}     Clone of object, with each function value evaluated
 */
function cloneWithPropertyEval(map) {
  const evaluatedMap = {};
  Object.keys(map).forEach(key => {
    const valOrFunc = map[key];
    evaluatedMap[key] = (typeof valOrFunc === 'function') ?
      valOrFunc() :
      valOrFunc;
  });
  return evaluatedMap;
}

function makeTracker(config = {}) {

  /**
   * Expand the key argument into the full key that would be sent to eventing
   * @param  {String}
   * @return {String} the full key to send to eventing
   */
  function expandKey(eventKey) {
    return config.namespace ? config.namespace + '.' + eventKey : eventKey;
  }

  /**
   * Track an event in the app.
   * @param {String} eventKey name of the event
   * @param {Object} moreValues dictionary of values to attach to the logged event
   * @param {SyntheticEvent} [uiEvent] React's event, passed by track.handle
   */
  function track(eventKey, moreValues, uiEvent) {
    const fullEventKey = expandKey(eventKey);

    const includeValues = cloneWithPropertyEval(config.include || {});

    const values = Object.assign({}, includeValues, moreValues);

    if (uiEvent && uiEvent.currentTarget) {
      // record features of the element interacted upon
      const el = uiEvent.currentTarget;
      if (el.href) {
        values.href = el.href;
      }
    }

    _recordEvent(fullEventKey, values);
  }

  /**
   * Curried form of track
   *
   * @returns {function} that calls event with the same args
   */
  track.handle = function(eventKey, moreValues) {
    return track.bind(null, eventKey, moreValues);
  };

  // create functions like `track.click` that take the client target as the key
  _actionNames.forEach(function(actionName) {
    track[actionName] = function(objectName, moreValues) {
      var eventKey = actionName + '.' + objectName;
      return track.bind(null, eventKey, moreValues);
    };
  });

  /**
   * Expand the objectName argument into the full key that would be sent to eventing.
   *
   * This is used by preloader's instrumentLinks function.
   *
   * @param  {String}
   * @return {String} the full key to send to eventing
   */
  track.clickKey = function(objectName) {
    return expandKey('click.' + objectName);
  };

  return track;
}

function provideTracking(Component, config = {}) {
  const baseName = Component.displayName || Component.name;

  const track = makeTracker(config);

  const TrackingProvider = React.createClass({

    displayName: baseName + 'TrackingProvider',

    childContextTypes: {
      track: React.PropTypes.func.isRequired
    },

    getChildContext() {
      return {track};
    },

    render() {
      return <Component {...this.props}/>;
    }
  });

  return TrackingProvider;
}

module.exports = {
  setup,
  makeTracker,
  provideTracking,
};
