'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const classnames = require('classnames');

const Lists = require('../stores/Lists');
const CurrentListStore = require('../stores/CurrentListStore');
const Columns = require('../columns');

const CreateForm = require('../components/CreateForm');
const FlashMessages = require('../components/FlashMessages');
const Footer = require('../components/Footer');
const ListColumnsForm = require('../components/ListColumnsForm');
const ListControl = require('../components/ListControl');
const ListDownloadForm = require('../components/ListDownloadForm');
const ListFilters = require('../components/ListFilters');
const ListFiltersAdd = require('../components/ListFiltersAdd');
const ListSort = require('../components/ListSort');
const MobileNavigation = require('../components/MobileNavigation');
const PrimaryNavigation = require('../components/PrimaryNavigation');
const SecondaryNavigation = require('../components/SecondaryNavigation');
const UpdateForm = require('../components/UpdateForm');

const { Alert, BlankState, Button, Container, Dropdown, FormInput, InputGroup, Pagination, Spinner } = require('elemental');

const { plural } = require('../utils');

const TABLE_CONTROL_COLUMN_WIDTH = 26;  // icon + padding

function showCreateForm() {
	return window.location.search === '?create' || Keystone.createFormErrors;
}

const ListView = React.createClass({
	getInitialState () {
		return {
			checkedItems: {},
			constrainTableWidth: true,
			manageMode: false,
			searchString: '',
			showCreateForm: showCreateForm(),
			showUpdateForm: false,
			...this.getStateFromStore()
		};
	},
	componentDidMount () {
		CurrentListStore.addChangeListener(this.updateStateFromStore);
		if (!this.state.ready) {
			CurrentListStore.loadItems();
		}
	},
	componentWillUnmount () {
		CurrentListStore.removeChangeListener(this.updateStateFromStore);
	},
	updateStateFromStore () {
		this.setState(this.getStateFromStore());
	},
	getStateFromStore () {
		var state = {
			columns: CurrentListStore.getActiveColumns(),
			currentPage: CurrentListStore.getCurrentPage(),
			filters: CurrentListStore.getActiveFilters(),
			items: CurrentListStore.getItems(),
			list: CurrentListStore.getList(),
			loading: CurrentListStore.isLoading(),
			pageSize: CurrentListStore.getPageSize(),
			ready: CurrentListStore.isReady(),
			search: CurrentListStore.getActiveSearch()
		};
		state.showBlankState = (state.ready && !state.loading && !state.items.results.length && !state.search && !state.filters.length) ? true : false;
		return state;
	},

	// ==============================
	// HEADER
	// ==============================

	updateSearch (e) {
		clearTimeout(this._searchTimeout);
		this.setState({
			searchString: e.target.value
		});
		var delay = e.target.value.length > 1 ? 150 : 0;
		this._searchTimeout = setTimeout(() => {
			CurrentListStore.setActiveSearch(this.state.searchString);
		}, delay);
	},
	handleSearchClear () {
		CurrentListStore.setActiveSearch('');
		this.setState({ searchString: '' });
		React.findDOMNode(this.refs.listSearchInput).focus();
	},
	handleSearchKey (e) {
		// clear on esc
		if (e.which === 27) {
			this.handleSearchClear ();
		}
	},
	handlePageSelect (i) {
		CurrentListStore.setCurrentPage(i);
	},
	toggleManageMode (filter = !this.state.manageMode) {
		this.setState({
			manageMode: filter,
			checkedItems: {}
		});
	},
	toggleUpdateModal (filter = !this.state.showUpdateForm) {
		this.setState({
			showUpdateForm: filter
		});
	},
	massUpdate () {
		console.log('Update ALL the things!');
	},
	massDelete () {
		let { checkedItems, list } = this.state;
		let itemCount = plural(checkedItems, ('* ' + list.singular.toLowerCase()), ('* ' + list.plural.toLowerCase()));
		if (!confirm(`Are you sure you want to delete ${itemCount}?`)) return;

		// TODO: implement mass deletion

		console.log(`Deleted ${itemCount}:`, Object.keys(checkedItems));
		this.toggleManageMode();
	},
	handleManagementSelect (selection) {
		if (selection === 'all') this.checkAllTableItems();
		if (selection === 'none') this.uncheckAllTableItems();
		if (selection === 'visible') this.checkAllTableItems();
		return false;
	},
	renderSearch () {
		var searchClearIcon = classnames('ListHeader__search__icon octicon', {
			'is-search octicon-search': !this.state.searchString.length,
			'is-clear octicon-x': this.state.searchString.length
		});
		return (
			<InputGroup.Section grow className="ListHeader__search">
				<FormInput ref="listSearchInput" value={this.state.searchString} onChange={this.updateSearch} onKeyUp={this.handleSearchKey} placeholder="Search" className="ListHeader__searchbar-input" />
				<button ref="listSearchClear" type="button" onClick={this.handleSearchClear} disabled={!this.state.searchString.length} className={searchClearIcon} />
			</InputGroup.Section>
		);
	},
	renderCreateButton () {
		var props = { type: 'success' };
		if (this.state.list.autocreate) {
			props.href = '?new' + Keystone.csrf.query;
		} else {
			props.onClick = this.toggleCreateModal.bind(this, true);
		}
		return (
			<InputGroup.Section className="ListHeader__create">
				<Button {...props} title={'Create ' + this.state.list.singular}>
					<span className="ListHeader__create__icon octicon octicon-plus" />
					<span className="ListHeader__create__label">
						Create
					</span>
					<span className="ListHeader__create__label--lg">
						Create {this.state.list.singular}
					</span>
				</Button>
			</InputGroup.Section>
		);
	},
	renderManagement () {
		let { checkedItems, items, list, manageMode, pageSize } = this.state;
		if (!items.count || (list.nodelete && list.noedit)) return;

		let checkedItemCount = Object.keys(checkedItems).length;
		let visibleCount = items.count > pageSize ? pageSize : items.count;
		let buttonNoteStyles = { color: '#999', fontWeight: 'normal' };

		// action buttons
		let actionUpdateButton = !list.noedit ? (
			<InputGroup.Section>
				<Button onClick={this.toggleUpdateModal} disabled={!checkedItemCount}>Update</Button>
			</InputGroup.Section>
		) : null;
		let actionDeleteButton = !list.nodelete ? (
			<InputGroup.Section>
				<Button onClick={this.massDelete} disabled={!checkedItemCount}>Delete</Button>
			</InputGroup.Section>
		) : null;
		let actionButtons = manageMode ? (
			<InputGroup.Section>
				<InputGroup contiguous>
					{actionUpdateButton}
					{actionDeleteButton}
				</InputGroup>
			</InputGroup.Section>
		) : null;

		// select buttons
		let selectAllButton = items.count > pageSize ? (
		<InputGroup.Section>
			<Button onClick={this.handleManagementSelect.bind(this, 'all')} title="Select all rows (including those not visible)">All <small style={buttonNoteStyles}>({items.count})</small></Button>
		</InputGroup.Section>
		) : null;
		let selectButtons = manageMode ? (
			<InputGroup.Section>
				<InputGroup contiguous>
					{selectAllButton}
					<InputGroup.Section>
						<Button onClick={this.handleManagementSelect.bind(this, 'visible')} title="Select all rows">{items.count > pageSize ? 'Page' : 'All'} <small style={buttonNoteStyles}>({items.results.length})</small></Button>
					</InputGroup.Section>
					<InputGroup.Section>
						<Button onClick={this.handleManagementSelect.bind(this, 'none')} title="Deselect all rows">None</Button>
					</InputGroup.Section>
				</InputGroup>
			</InputGroup.Section>
		) : null;

		// selected count text
		let selectedCountText = manageMode ? (
			<InputGroup.Section grow>
				<span style={{ color: '#666', display: 'inline-block', lineHeight: '2.4em', margin: 1 }}>{checkedItemCount} selected</span>
			</InputGroup.Section>
		) : null;

		// put it all together
		return (
			<InputGroup style={{ float: 'left', marginRight: '.75em' }}>
				<InputGroup.Section>
					<Button isActive={manageMode} onClick={this.toggleManageMode.bind(this, !manageMode)}>Manage</Button>
				</InputGroup.Section>
				{selectButtons}
				{actionButtons}
				{selectedCountText}
			</InputGroup>
		);
	},
	renderPagination () {
		let { currentPage, items, list, manageMode, pageSize } = this.state;
		if (manageMode || !items.count) return;

		return (
			<Pagination
				className="ListHeader__pagination"
				currentPage={currentPage}
				onPageSelect={this.handlePageSelect}
				pageSize={pageSize}
				plural={list.plural}
				singular={list.singular}
				style={{ marginBottom: 0 }}
				total={items.count}
				limit={10}
				/>
		);
	},
	renderHeader () {
		let { currentPage, items, list, pageSize } = this.state;
		return (
			<div className="ListHeader">
				<Container>
					<h2 className="ListHeader__title">
						{plural(items.count, ('* ' + list.singular), ('* ' + list.plural))}
						<ListSort />
					</h2>
					<InputGroup className="ListHeader__bar">
						{this.renderSearch()}
						<ListFiltersAdd className="ListHeader__filter" />
						<ListColumnsForm className="ListHeader__columns" />
						<ListDownloadForm className="ListHeader__download" />
						<InputGroup.Section className="ListHeader__expand">
							<Button isActive={!this.state.constrainTableWidth} onClick={this.toggleTableWidth} title="Expand table width">
								<span className="octicon octicon-mirror" />
							</Button>
						</InputGroup.Section>
						{this.renderCreateButton()}
					</InputGroup>
					<ListFilters />
					<div style={{ height: 34, marginBottom: '2em' }}>
						{this.renderManagement()}
						{this.renderPagination()}
						<span style={{ clear: 'both', display: 'table' }} />
					</div>
				</Container>
			</div>
		);
	},

	// ==============================
	// TABLE
	// ==============================

	checkTableItem (item, e) {
		e.preventDefault();
		let newCheckedItems = this.state.checkedItems;
		let itemId = item.id;
		if (this.state.checkedItems[itemId]) {
			delete newCheckedItems[itemId];
		} else {
			newCheckedItems[itemId] = true;
		}
		this.setState({
			checkedItems: newCheckedItems
		});
	},
	checkAllTableItems () {
		let checkedItems = {};
		this.state.items.results.forEach(function(item) {
			checkedItems[item.id] = true;
		});
		this.setState({
			checkedItems: checkedItems
		});
	},
	uncheckAllTableItems () {
		this.setState({
			checkedItems: {}
		});
	},
	deleteTableItem (item, e) {
		if (!e.altKey && !confirm('Are you sure you want to delete ' + item.name + '?')) return;
		CurrentListStore.deleteItem(item);
	},
	toggleTableWidth () {
		this.setState({
			constrainTableWidth: !this.state.constrainTableWidth
		});
	},
	renderTableCols () {
		var cols = this.state.columns.map((col) => <col width={col.width} key={col.path} />);
		// add delete col when applicable
		if (!this.state.list.nodelete) {
			cols.unshift(<col width={TABLE_CONTROL_COLUMN_WIDTH} key="delete" />);
		}
		// add sort col when applicable
		if (this.state.list.sortable) {
			cols.unshift(<col width={TABLE_CONTROL_COLUMN_WIDTH} key="sortable" />);
		}
		return <colgroup>{cols}</colgroup>;
	},
	renderTableHeaders () {
		var cells = this.state.columns.map((col, i) => {
			// span first col for controls when present
			var span = 1;
			if (!i) {
				if (this.state.list.sortable) span++;
				if (!this.state.list.nodelete) span++;
			}
			return <th key={col.path} colSpan={span}>{col.label}</th>;
		});
		return <thead><tr>{cells}</tr></thead>;
	},
	renderTableRow (item) {
		let itemId = item.id;
		let rowClassname = classnames({
			'ItemList__row--selected': this.state.checkedItems[itemId],
			'ItemList__row--manage': this.state.manageMode,
		});
		var cells = this.state.columns.map((col, i) => {
			var ColumnType = Columns[col.type] || Columns.__unrecognised__;
			var linkTo = !i ? `/keystone/${this.state.list.path}/${itemId}` : undefined;
			return <ColumnType key={col.path} list={this.state.list} col={col} data={item} linkTo={linkTo} />;
		});
		// add sortable icon when applicable
		if (this.state.list.sortable) {
			cells.unshift(<ListControl key="_sort" onClick={this.reorderItems} type="sortable" />);
		}
		// add delete/check icon when applicable
		if (!this.state.list.nodelete) {
			cells.unshift(this.state.manageMode ? (
				<ListControl key="_check" type="check" active={this.state.checkedItems[itemId]} />
			) : (
				<ListControl key="_delete" onClick={(e) => this.deleteTableItem(item, e)} type="delete" />
			));
		}
		return <tr key={'i' + item.id} onClick={this.state.manageMode ? (e) => this.checkTableItem(item, e) : null} className={rowClassname}>{cells}</tr>;
	},
	renderTable () {
		if (!this.state.items.results.length) return null;

		return (
			<div className="ItemList-wrapper">
				<table cellPadding="0" cellSpacing="0" className="Table ItemList">
					{this.renderTableCols()}
					{this.renderTableHeaders()}
					<tbody>
						{this.state.items.results.map(this.renderTableRow)}
					</tbody>
				</table>
			</div>
		);
	},


	// ==============================
	// COMMON
	// ==============================

	toggleCreateModal (visible) {
		this.setState({
			showCreateForm: visible
		});
	},
	renderBlankStateCreateButton () {
		var props = { type: 'success' };
		if (this.state.list.nocreate) return null;
		if (this.state.list.autocreate) {
			props.href = '?new' + this.props.csrfQuery;
		} else {
			props.onClick = this.toggleCreateModal.bind(this, true);
		}
		return (
			<Button {...props}>
				<span className="octicon octicon-plus" />
				Create {this.state.list.singular}
			</Button>
		);
	},
	renderBlankState () {
		if (!this.state.showBlankState) return null;
		return (
			<Container>
				<FlashMessages messages={this.props.messages} />
				<BlankState style={{ marginTop: 40 }}>
					<BlankState.Heading>No {this.state.list.plural.toLowerCase()} found&hellip;</BlankState.Heading>
					{this.renderBlankStateCreateButton()}
				</BlankState>
			</Container>
		);
	},
	renderActiveState () {
		if (this.state.showBlankState) return null;

		let containerStyle = {
			transition: 'max-width 160ms ease-out',
			msTransition: 'max-width 160ms ease-out',
			MozTransition: 'max-width 160ms ease-out',
			WebkitTransition: 'max-width 160ms ease-out',
		};
		if (!this.state.constrainTableWidth) containerStyle['maxWidth'] = '100%';

		return (
			<div>
				{this.renderHeader()}
				<Container style={containerStyle}>
					<FlashMessages messages={this.props.messages} />
					{this.renderTable()}
					{this.renderNoSearchResults()}
				</Container>
			</div>
		);
	},
	renderNoSearchResults () {
		if (this.state.items.results.length) return null;
		let matching = this.state.search;
		if (this.state.filters.length) {
			matching += (matching ? ' and ' : '') + plural(this.state.filters.length, '* filter', '* filters');
		}
		matching = matching ? ' found matching ' + matching : '.';
		return (
			<BlankState style={{ marginTop: 20, marginBottom: 20 }}>
				<span className="octicon octicon-search" style={{ fontSize: 32, marginBottom: 20 }} />
				<BlankState.Heading>No {this.state.list.plural.toLowerCase()}{matching}</BlankState.Heading>
			</BlankState>
		);
	},
	render () {
		return !this.state.ready ? (
			<div className="view-loading-indicator"><Spinner size="md" /></div>
		) : (
			<div className="keystone-wrapper">
				<header className="keystone-header">
					<MobileNavigation
						brand={this.props.brand}
						currentListKey={this.state.list.path}
						currentSectionKey={this.props.nav.currentSection.key}
						sections={this.props.nav.sections}
						signoutUrl={this.props.signoutUrl}
						/>
					<PrimaryNavigation
						brand={this.props.brand}
						currentSectionKey={this.props.nav.currentSection.key}
						sections={this.props.nav.sections}
						signoutUrl={this.props.signoutUrl} />
					<SecondaryNavigation
						currentListKey={this.state.list.path}
						lists={this.props.nav.currentSection.lists} />
				</header>
				<div className="keystone-body">
					{this.renderBlankState()}
					{this.renderActiveState()}
				</div>
				<Footer
					appversion={this.props.appversion}
					backUrl={this.props.backUrl}
					brand={this.props.brand}
					User={this.props.User}
					user={this.props.user}
					version={this.props.version} />
				<CreateForm
					err={this.props.createFormErrors}
					isOpen={this.state.showCreateForm}
					list={this.state.list}
					onCancel={this.toggleCreateModal.bind(this, false)}
					values={this.props.createFormData} />
				<UpdateForm
					isOpen={this.state.showUpdateForm}
					itemIds={Object.keys(this.state.checkedItems)}
					list={this.state.list}
					onCancel={this.toggleUpdateModal.bind(this, false)} />
			</div>
		);
	}

});

ReactDOM.render(
	<ListView
		appversion={Keystone.appversion}
		backUrl={Keystone.backUrl}
		brand={Keystone.brand}
		createFormData={Keystone.createFormData}
		createFormErrors={Keystone.createFormErrors}
		csrfQuery={Keystone.csrf.query}
		messages={Keystone.messages}
		nav={Keystone.nav}
		signoutUrl={Keystone.signoutUrl}
		user={Keystone.user}
		User={Keystone.User}
		version={Keystone.version}
	/>,
	document.getElementById('list-view')
);
