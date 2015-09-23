var React = require('react');
var ReactRouter = require('react-router');

var EXTERNAL_URL_RE = new RegExp('^(?:[a-z]+:)?//', 'i');

/**
 * An extension to React-Router's Link that abstracts link tracking for isomorphic rendering
 * to operate the same before and after page rehydration.
 *
 * When the page has been rehydrated, it tracks links using a standard click handler.
 * Before the page has been rehydrated, it tracks links using a supporting click
 * event listener, keyed by the same data.
 *
 * To set up that event listener, run something like this on your page before scripts load:
 *
 *  function instrumentLinks() {
 *    var linkElsList = document.querySelectorAll('a[data-click-key]');
 *    // convert the NodeList to Array
 *    var linkEls = Array.prototype.slice.call(linkElsList);
 *
 *    linkEls.forEach(function (el) {
 *      el.addEventListener('click', (e) => {
 *        var eventKey = el.getAttribute('data-click-key');
 *        YOUR_EVENT_TRACKER.push(eventKey);
 *      });
 *    });
 *  }
 */
var TrackedLink = React.createClass({

  propTypes: {
    // when this is link is clicked, it will fire an event key made of
    // {group}.{page}.click.{trackingName} (this sets the last part)
    trackingName: React.PropTypes.string.isRequired,
    href: React.PropTypes.string.isRequired,
    className: React.PropTypes.string,
    moreValues: React.PropTypes.object,
    children: React.PropTypes.node,
  },

  contextTypes: {
    track: React.PropTypes.func.isRequired
  },

  canRouteLocally() {
    const isExternal = EXTERNAL_URL_RE.test(this.props.to);
    if (isExternal) return false;

    const matches = this.context.router.match(this.props.to);
    if (!matches) return false;

    const lastRoute = matches.routes[matches.routes.length - 1];
    const localRouteMissing = lastRoute.isNotFound;
    if (localRouteMissing) return false;

    return true;
  },

  render: function() {
    var LinkType = this.canRouteLocally() ? ReactRouter.Link : 'a';

    return (
      <LinkType
        onClick={this.context.track.handle('click.' + this.props.trackingName, this.props.moreValues)}
        data-click-key={this.context.track.clickKey(this.props.trackingName)}
        {...this.props}
      />
    );
  }

});

module.exports = TrackedLink;
