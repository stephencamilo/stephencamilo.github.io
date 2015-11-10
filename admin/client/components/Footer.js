import blacklist from 'blacklist';
import classnames from 'classnames';
import React from 'react';
import { Container } from 'elemental';

var Footer = React.createClass({
	displayName: 'Footer',
	propTypes: {
		appversion: React.PropTypes.string,
		backUrl: React.PropTypes.string,
		brand: React.PropTypes.string,
		User: React.PropTypes.object,
		user: React.PropTypes.object,
		version: React.PropTypes.string,
	},
	renderUser () {
		let { User, user } = this.props;
		if (!User || !user) return null;

		return (
			<span>
				<span>Signed in as </span>
				<a href={'/keystone/' + User.path + '/' + user.id} tabIndex="-1" className="keystone-footer__link">
					{User.getDocumentName(user)}
				</a>
				<span>.</span>
			</span>
		);
	},
	render () {
		let { backUrl, brand, appversion, version } = this.props;

		return (
			<footer className="keystone-footer">
				<Container>
					<a href={backUrl} tabIndex="-1" className="keystone-footer__link">{brand + (appversion ? (' ' + appversion) : '')}</a>
					<span> powered by </span>
					<a href="http://keystonejs.com" target="_blank" className="keystone-footer__link" tabIndex="-1">KeystoneJS</a>
					<span> version {version}.</span>
					{this.renderUser()}
				</Container>
			</footer>
		);
	}
});

module.exports = Footer;
