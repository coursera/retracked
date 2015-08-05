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
    className: React.PropTypes.string,
  },

  contextTypes: {
    track: React.PropTypes.func.isRequired
  },

  isExternal: function() {
    return EXTERNAL_URL_RE.test(this.props.to);
  },

  render: function() {
    var LinkType = this.isExternal() ? 'a' : ReactRouter.Link;

    return (
      <LinkType
        onClick={this.context.track.handle('click.' + this.props.trackingName)}
        data-click-key={this.context.track.clickKey(this.props.trackingName)}
        href={this.props.to}
        className={this.props.className}
        {...this.props}>
        {this.props.children}
      </LinkType>
    );
  }

});

module.exports = TrackedLink;
