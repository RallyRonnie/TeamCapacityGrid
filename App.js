// IMPORTANT NOTE: If you rebuild this app, you must add "var app;" to the new 
// deploy/App...html files just above "Rally.onReady(function () {"
// Source Code Here: https://github.com/RallyRonnie/TeamCapacityGrid
//
Ext.define('CustomApp', {
    extend: 'Rally.app.TimeboxScopedApp',
    componentCls: 'app',
    scopeType: 'iteration',
	html:'<table><tr><td>' +
	'<div title="Create a task and assign it with estimate or enter initial capacity on the Team Status page.">' +
	'<b style="text-align:left;float:left;">' +
	'Create and assign a task with estimate or goto Track->Team Status to enter capacities' +
	'</b></div></td><td><div>' +
	'<input type="button" style="text-align:right;float:right;" value="Refresh" onClick="javascript: app._loadGrid();"/></div>' +
	'</td></tr></table>',
    comboboxConfig: {
        fieldLabel: 'Select an Iteration:</div>',
        width: 400
    },
	onScopeChange: function() {
		if (this.getContext().getTimeboxScope().getRecord() === null) {
			alert("You must specify a valid Iteration/Sprint. Unscheduled is not supported.");
		} else {
			this._showMask('Updating');
			this._loadGrid();
		}
	},
	_loadGrid: function () {
		var context = this.getContext();
		pageSize = 25;
		fetch = 'User,Capacity,TaskEstimates,Load';
		iOID = this.getContext().getTimeboxScope().getRecord().get("ObjectID");
		if ( this._myGrid ) { this._myGrid.destroy(); }
        this._myGrid = Ext.create("Rally.ui.grid.Grid", {
			xtype: 'rallygrid',
			layout: 'fit',
			enableColumnHide: false,
			showRowActionsColumn: false,
			enableEditing: true,
			context: this.getContext(),
			storeConfig: {
				fetch: fetch,
				model: 'UserIterationCapacity',
				filters: this._getFilters(iOID),
				pageSize: pageSize,
				listeners: {
					datachanged: function() {
//						console.log("datachange");
//						this._loadGrid();
					},
					scope: this
				},
				sorters: [
					{ property: 'User', direction: 'ASC' }
				]
			},
			columnCfgs: [
				{
					text: 'User',
					dataIndex: 'User',
					flex: 1,
					editor: false
				},
				{
					text: 'Capacity',
					dataIndex: 'Capacity'
				},
				{
					text: 'Task Estimates',
					dataIndex: 'TaskEstimates'
				},
				{
					text: 'Load',
					xtype: 'templatecolumn',
					tpl: Ext.create('Rally.ui.renderer.template.progressbar.ProgressBarTemplate', {
						percentDoneName: 'Load',
						calculateColorFn: function(recordData) {
							if (recordData.Load < 0.8) {
								colVal = "#B2E3B6"; // Green
							} else if (recordData.Load < 1.0) {
								colVal = "#FBDE98"; // Orange
							} else {
								colVal = "#FCB5B1"; // Red
							}
						return colVal;
						}
					})
				}
			],
			pagingToolbarCfg: {
				pageSizes: [pageSize]
			}
		});
		this._hideMask();
		app = this;
		this.add(this._myGrid);
	},
	_getFilters: function (iName) {
		var filters = [];
		filters.push({
			property: 'Iteration.ObjectID',
			operator: '=',
			value: iName
		});
//		filters.push({
//			property: 'Capacity',
//			operator: '>',
//			value: 0
//		});
		return filters;
	},
	_showMask: function(msg) {
		if ( this.getEl() ) { 
			this.getEl().unmask();
			this.getEl().mask(msg);
		}
	},
	_hideMask: function() {
		this.getEl().unmask();
	}
});