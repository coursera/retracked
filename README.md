# Retracked

A little library to simplify event tracking in React components.

## Basic event tracking

Set it up in your bootstrap:
```js
var myTracker = require('awesomeTracker');
var retracked = require('retracked');

var recordingFn = (fullEventKey, values) =>
  myTracker.record(fullEventKey, values);

// event types that we track
var actionNames = [
  'view',
  'click', // or tap
  'hover',
  'scroll',
  'swipe',
  'pinch',
  'expand',
];

retracked.setup(recordingFn, actionNames);
```

Then in your components you can namespace the event tracking by context:
```js
var AboutApp = React.createClass({

  childContextTypes: {
    track: React.PropTypes.func,
  },

  getChildContext: function() {
    return {
      track: Retracked.makeTracker({
        namespace: 'about'
      })
    };
  },

  render: function() {
    return (
      <div>
        <JobsPage />
      </div>
    );
  }

});
```

Then you can use that anywhere down the ownership hierarchy:
```js
var JobsPage = React.createClass({

  contextTypes: {
    track: React.PropTypes.func.isRequired
  },

  componentDidMount: function() {
    // track this event right now
    this.context.track('view.jobs');
  }

  render: function() {
    return (
      <div>
        {/* curried function to track when a click happens */}
        <button label="Apply" onClick={this.context.track.handle('click.apply')} />
      </div>
    );
  }

});
```

## Isomorphic link tracking

This package contains a component, `TrackedLink`, that abstracts away defining links on which you want
to track clicks, so that they fire events both in regular client-side rendering and also from server-side
rendered HTML before the full Javascript assets have downloaded and the full components have mounted.

For example,
```js
    <TrackedLink
      className="open-in-app btn"
      to={appStoreUrl}
      trackingName="download_app"
    >
      Download our App
    </TrackedLink>
```
