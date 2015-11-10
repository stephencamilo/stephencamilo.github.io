import blacklist from 'blacklist';
import classnames from 'classnames';
import React from 'react';

var PopoutList = React.createClass({
	displayName: 'PopoutList',
	propTypes: {
		children: React.PropTypes.node.isRequired,
	},
	render () {
		let className = classnames('PopoutList', this.props.className);
		let props = blacklist(this.props, 'className');
		return <div className={className} {...props} />;
	}
});
module.exports = PopoutList;

// expose the child to the top level export
module.exports.Item = require('./PopoutListItem');
module.exports.Heading = require('./PopoutListHeading');
