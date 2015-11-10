import classnames from 'classnames';
import React from 'react';
import Transition from 'react-addons-css-transition-group';

var CurrentListStore = require('../stores/CurrentListStore');
var Popout = require('./Popout');
var PopoutList = require('./PopoutList');
var { Button, Checkbox, InputGroup, SegmentedControl } = require('elemental');

var ListColumnsForm = React.createClass({
	displayName: 'ListColumnsForm',

	getInitialState () {
		return {
			selectedColumns: {}
		};
	},

	getSelectedColumnsFromStore () {
		var selectedColumns = {};
		CurrentListStore.getActiveColumns().forEach(col => {
			selectedColumns[col.path] = true;
		});
		return selectedColumns;
	},

	togglePopout (visible) {
		this.setState({
			selectedColumns: this.getSelectedColumnsFromStore(),
			isOpen: visible,
		}, () => {
			if (visible) {
				React.findDOMNode(this.refs.target).focus();
			}
		});
	},

	toggleColumn (path, value) {
		let newColumns = this.state.selectedColumns;

		if (value) {
			newColumns[path] = value;
		} else {
			delete newColumns[path];
		}

		this.setState({
			selectedColumns: newColumns
		});
	},

	applyColumns () {
		CurrentListStore.setActiveColumns(Object.keys(this.state.selectedColumns));
		this.togglePopout(false);
	},

	renderColumns () {
		return CurrentListStore.getAvailableColumns().map((el, i) => {
			if (el.type === 'heading') {
				return <PopoutList.Heading key={'heading_' + i}>{el.content}</PopoutList.Heading>;
			}

			let path = el.field.path;
			let selected = this.state.selectedColumns[path];

			return (
				<PopoutList.Item
					key={'column_' + el.field.path}
					icon={selected ? 'check' : 'dash'}
					iconHover={selected ? 'dash' : 'check'}
					isSelected={!!selected}
					label={el.field.label}
					onClick={() => { this.toggleColumn(path, !selected); }} />
			);
		});
	},

	render () {
		return (
			<InputGroup.Section className={this.props.className}>
				<Button ref="target" id="listHeaderColumnButton" isActive={this.state.isOpen} onClick={this.togglePopout.bind(this, !this.state.isOpen)}>
					<span className={this.props.className + '__icon octicon octicon-list-unordered'} />
					<span className={this.props.className + '__label'}>Columns</span>
					<span className="disclosure-arrow" />
				</Button>
				<Popout isOpen={this.state.isOpen} onCancel={this.togglePopout.bind(this, false)} relativeToID="listHeaderColumnButton">
					<Popout.Header title="Columns" />
					<Popout.Body scrollable>
						<PopoutList>
							{this.renderColumns()}
						</PopoutList>
					</Popout.Body>
					<Popout.Footer
						primaryButtonAction={this.applyColumns}
						primaryButtonLabel="Apply"
						secondaryButtonAction={this.togglePopout.bind(this, false)}
						secondaryButtonLabel="Cancel" />
				</Popout>
			</InputGroup.Section>
		);
	}

});

module.exports = ListColumnsForm;
