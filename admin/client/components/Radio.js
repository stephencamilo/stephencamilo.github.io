import React from 'react';
import blacklist from 'blacklist';
import classnames from 'classnames';
import Color from 'color';
import E from '../constants';

var Radio = React.createClass({
	displayName: 'Radio',
	propTypes: {
		checked: React.PropTypes.bool,
		onChange: React.PropTypes.func,
		readonly: React.PropTypes.bool,
	},
	getDefaultProps () {
		return {
			component: 'button',
		};
	},
	componentDidMount () {
		window.addEventListener('mouseup', this.handleMouseUp, false);
	},
	componentWillUnmount () {
		window.removeEventListener('mouseup', this.handleMouseUp, false);
	},
	getInitialState () {
		return {
			active: null,
			focus: null,
			hover: null,
		};
	},
	getStyles () {
		let { checked, readonly } = this.props;
		let { active, focus, hover } = this.state;

		let checkedColor = Color('#3999fc');

		let background = (checked && !readonly) ? checkedColor.hexString() : 'white';
		let borderColor = (checked && !readonly) ? 'rgba(0,0,0,0.05) rgba(0,0,0,0.1) rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.3) rgba(0,0,0,0.2) rgba(0,0,0,0.15)';
		let boxShadow = (checked && !readonly) ? '0 1px 0 rgba(255,255,255,0.33)' : 'inset 0 1px 0 rgba(0,0,0,0.06)';
		let color = (checked && !readonly) ? 'white' : '#bbb';
		let textShadow = (checked && !readonly) ? '0 1px 0 rgba(0,0,0,0.2)' : null;

		// pseudo state
		if (hover && !focus && !readonly) {
			borderColor = (checked) ? 'rgba(0,0,0,0.1) rgba(0,0,0,0.15) rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.35) rgba(0,0,0,0.3) rgba(0,0,0,0.25)';
		}
		if (active) {
			background = (checked && !readonly) ? checkedColor.darken(0.2).hexString() : '#eee';
			borderColor = (checked && !readonly) ? 'rgba(0,0,0,0.25) rgba(0,0,0,0.3) rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.4) rgba(0,0,0,0.35) rgba(0,0,0,0.3)';
			boxShadow = (checked && !readonly) ? '0 1px 0 rgba(255,255,255,0.33)' : 'inset 0 1px 3px rgba(0,0,0,0.2)';
		}
		if (focus && !active) {
			borderColor = (checked && !readonly) ? 'rgba(0,0,0,0.25) rgba(0,0,0,0.3) rgba(0,0,0,0.35)' : checkedColor.hexString();
			boxShadow = (checked && !readonly) ? `0 0 0 3px ${checkedColor.alpha(0.15).rgbString()}` : `inset 0 1px 2px rgba(0,0,0,0.15), 0 0 0 3px ${checkedColor.alpha(0.15).rgbString()}`;
		}

		// noedit
		if (readonly) {
			background = 'rgba(255,255,255,0.5)';
			borderColor = 'rgba(0,0,0,0.1)';
			boxShadow = 'none';
			color = checked ? checkedColor.hexString() : '#bbb';
		}

		return {
			alignItems: 'center',
			background: background,
			border: '1px solid',
			borderColor: borderColor,
			borderRadius: '50%',
			boxShadow: boxShadow,
			color: color,
			display: 'inline-block',
			fontSize: 10,
			height: 16,
			lineHeight: '15px',
			outline: 'none',
			padding: 0,
			textAlign: 'center',
			textShadow: textShadow,
			verticalAlign: 'middle',
			width: 16,

			msTransition: 'all 120ms ease-out',
			MozTransition: 'all 120ms ease-out',
			WebkitTransition: 'all 120ms ease-out',
			transition: 'all 120ms ease-out',
		};
	},
	handleKeyDown (e) {
		if (e.keyCode !== 32) return;
		this.toggleActive(true);
	},
	handleKeyUp (e) {
		this.toggleActive(false);
	},
	handleMouseOver (e) {
		this.toggleHover(true);
	},
	handleMouseDown (e) {
		this.toggleActive(true);
		this.toggleFocus(true);
	},
	handleMouseUp (e) {
		this.toggleActive(false);
	},
	handleMouseOut (e) {
		this.toggleHover(false);
	},
	toggleActive (pseudo) {
		this.setState({ active: pseudo });
	},
	toggleHover (pseudo) {
		this.setState({ hover: pseudo });
	},
	toggleFocus (pseudo) {
		this.setState({ focus: pseudo });
	},
	handleChange () {
		this.props.onChange(this.props.value);
	},
	render () {
		let { checked, readonly } = this.props;

		let props = blacklist(this.props, 'checked', 'component', 'onChange', 'readonly');
		props.style = this.getStyles();
		props.ref = 'checkbox';
		props.className = classnames('octicon', {
			'octicon-primitive-dot': checked,
			'octicon-x': (typeof checked === 'boolean') && !checked && readonly,
		});
		props.type = readonly ? null : 'button';

		props.onKeyDown = this.handleKeyDown;
		props.onKeyUp = this.handleKeyUp;

		props.onMouseDown = this.handleMouseDown;
		props.onMouseUp = this.handleMouseUp;
		props.onMouseOver = this.handleMouseOver;
		props.onMouseOut = this.handleMouseOut;

		props.onClick = readonly ? null : this.handleChange;
		props.onFocus = readonly ? null : this.toggleFocus.bind(this, true);
		props.onBlur = readonly ? null : this.toggleFocus.bind(this, false);

		let node = readonly ? 'span' : this.props.component;

		return React.createElement(node, props);
	}
});

module.exports = Radio;
