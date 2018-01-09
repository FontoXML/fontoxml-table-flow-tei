define([
	'fontoxml-table-flow/configureAsTableElements',

	'./table-definition/TeiTableDefinition'
], function (
	configureAsTableElements,

	TeiTableDefinition
) {
	'use strict';

	/**
	 * Configure TEI tables.
	 *
	 * @fontosdk
	 *
	 * @category add-on/fontoxml-table-flow-tei
	 *
	 * @param  {Object}  sxModule
	 * @param  {Object}  [options]
	 * @param  {number}  [options.priority]                  Selector priorty for all elements configured by this function
	 * @param  {Object}  [options.table]                     Options for the table element
	 * @param  {string}  [options.table.namespaceURI='']     The namespace URI for this table
	 * @param  {Object}  [options.cell]                      Configuration options for the cell element
	 * @param  {string}  [options.cell.defaultTextContainer] The default text container for the cell element
	 */
	return function configureAsTeiTableElements (sxModule, options) {
		options = options || {};
		var tableDefinition = new TeiTableDefinition(options);
		configureAsTableElements(sxModule, options, tableDefinition);
	};
});
