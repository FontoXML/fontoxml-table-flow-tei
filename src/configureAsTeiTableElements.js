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
	 * @param  {number}  [options.priority]                    Selector priorty for all elements configured by this function
	 * @param  {Object}  [options.table]                       Options for the table element
	 * @param  {string}  [options.table.namespaceURI='']       The namespace URI for this table
	 * @param  {Object}  [options.row]                         Configuration options for the row element
	 * @param  {Object}  [options.row.headerAttribute]         Configuration options for an attribute to be set on a row element when it is a header row
	 * @param  {string}  [options.row.headerAttribute.name]    The attribute name
	 * @param  {string}  [options.row.headerAttribute.value]   The value to set
	 * @param  {Object}  [options.row.regularAttribute]        Configuration options for an attribute to be set on a row element when it is not a header row
	 * @param  {string}  [options.row.regularAttribute.name]   The attribute name
	 * @param  {string}  [options.row.regularAttribute.value]  The value to set
	 * @param  {Object}  [options.cell]                        Configuration options for the cell element
	 * @param  {string}  [options.cell.defaultTextContainer]   The default text container for the cell element
	 * @param  {Object}  [options.cell.headerAttribute]        Configuration options for an attribute to be set on a cell element when it is a header cell
	 * @param  {string}  [options.cell.headerAttribute.name]   The attribute name
	 * @param  {string}  [options.cell.headerAttribute.value]  The value to set
	 * @param  {Object}  [options.cell.regularAttribute]       Configuration options for an attribute to be set on a cell element when it is not a header cell
	 * @param  {string}  [options.cell.regularAttribute.name]  The attribute name
	 * @param  {string}  [options.cell.regularAttribute.value] The value to set
	 */
	return function configureAsTeiTableElements (sxModule, options) {
		options = options || {};
		var tableDefinition = new TeiTableDefinition(options);
		configureAsTableElements(sxModule, options, tableDefinition);
	};
});
