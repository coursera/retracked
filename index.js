/**
 * Retracked wraps your event recording system in an API optimized for React components.
 *
 * .track(key, values) records an event immediately. (values are optional)
 *
 * .track.handle(key, values) returns a function that records the event when evaluated.
 */

var _ = require('underscore');

var _recordEvent = function() {
  throw new Error('Retracked setup() must first be called with an event recording function.');
};

var _actionNames = [];

exports.setup = function(recordEventFn, actionNames) {
  _recordEvent = recordEventFn;
  _actionNames = actionNames;
};

exports.makeTracker = function(config) {

  var include = config.include || {};

  /**
   * Expand the key argument into the full key that would be sent to eventing
   * @param  {String}
   * @return {String} the full key to send to eventing
   */
  var expandKey = function(eventKey) {
    return config.namespace ? config.namespace + '.' + eventKey : eventKey;
  };

  /**
   * Track an event in the app.
   * @param {String} eventKey name of the event
   * @param {Object} moreValues dictionary of values to attach to the logged event
   * @param {SyntheticEvent} [uiEvent] React's event, passed by track.handle
   */
  var track = function(eventKey, moreValues, uiEvent) {
    var fullEventKey = expandKey(eventKey);

    // keys map to values or functions
    var includeValues = _(_(include).map(function(valOrFunc, key) {
      return [key, _(include).result(key)];
    })).object();

    var values = _({}).extend(includeValues, moreValues);

    if (uiEvent && uiEvent.currentTarget) {
      // record features of the element interacted upon
      var el = uiEvent.currentTarget;
      if (el.href) {
        values.href = el.href;
      }
    }

    _recordEvent(fullEventKey, values);
  };

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
   * This is used for isomorphic link tracking in TrackedLink.
   *
   * @param  {String}
   * @return {String} the full key to send to eventing
   */
  track.clickKey = function(objectName) {
    return expandKey('click.' + objectName);
  };

  return track;
};
