import _ from 'underscore';
import CodeMirror from 'codemirror';
import Field from '../Field';
import React from 'react';
import { FormInput } from 'elemental';

/**
 * TODO:
 * - Remove dependency on underscore
 */

// See CodeMirror docs for API:
// http://codemirror.net/doc/manual.html

module.exports = Field.create({
	
	displayName: 'CodeField',
	
	getInitialState () {
		return {
			isFocused: false
		};
	},
	
	componentDidMount () {
		if (!this.refs.codemirror) {
			return;
		}
		
		var options = _.defaults({}, this.props.editor, {
			lineNumbers: true,
			readOnly: this.shouldRenderField() ? false : true
		});
		
		this.codeMirror = CodeMirror.fromTextArea(this.refs.codemirror.getDOMNode(), options);
		this.codeMirror.on('change', this.codemirrorValueChanged);
		this.codeMirror.on('focus', this.focusChanged.bind(this, true));
		this.codeMirror.on('blur', this.focusChanged.bind(this, false));
		this._currentCodemirrorValue = this.props.value;
	},
	
	componentWillUnmount () {
		// todo: is there a lighter-weight way to remove the cm instance?
		if (this.codeMirror) {
			this.codeMirror.toTextArea();
		}
	},
	
	componentWillReceiveProps (nextProps) {
		if (this.codeMirror && this._currentCodemirrorValue !== nextProps.value) {
			this.codeMirror.setValue(nextProps.value);
		}
	},
	
	focus () {
		if (this.codeMirror) {
			this.codeMirror.focus();
		}
	},
	
	focusChanged (focused) {
		this.setState({
			isFocused: focused
		});
	},
	
	codemirrorValueChanged (doc, change) {//eslint-disable-line no-unused-vars
		var newValue = doc.getValue();
		this._currentCodemirrorValue = newValue;
		this.props.onChange({
			path: this.props.path,
			value: newValue
		});
	},
	
	renderCodemirror () {
		var className = 'CodeMirror-container';
		if (this.state.isFocused && this.shouldRenderField()) {
			className += ' is-focused';
		}
		return (
			<div className={className}>
				<FormInput multiline ref="codemirror" name={this.props.path} value={this.props.value} onChange={this.valueChanged} autoComplete="off" />
			</div>
		);
	},
	
	renderValue () {
		return this.renderCodemirror();
	},
	
	renderField () {
		return this.renderCodemirror();
	}
	
});
