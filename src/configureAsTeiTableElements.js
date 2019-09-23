import configureAsTableElements from 'fontoxml-table-flow/src/configureAsTableElements.js';
import TeiTableDefinition from './table-definition/TeiTableDefinition.js';

/**
 * Configure TEI tables.
 *
 * As TEI tables do not use elements to define columns, the columnBefore widget area is not
 * supported.
 *
 * Example usage for the table widgets:
 *
 *```
 *	configureAsTeiTableElements(sxModule, {
 *		table: {
 *			namespaceURI: 'http://www.tei-c.org/ns/1.0'
 *		},
 *		cell: {
 *			defaultTextContainer: 'p'
 *		},
 *		row: {
 *			headerAttribute: {
 *				name: 'role',
 *				value: 'label'
 *			}
 *		},
 *		rowBefore: [
 *			createIconWidget('dot-circle-o', {
 *				clickOperation: 'do-nothing'
 *			})
 *		],
 *		showInsertionWidget: true,
 *		showHighlightingWidget: true
 *	});
 *```
 *
 * @fontosdk
 *
 * @category add-on/fontoxml-table-flow-tei
 *
 * @param  {Object}          sxModule
 * @param  {Object}          [options]
 * @param  {number}          [options.priority]                    Selector priority for all elements configured by this function
 * @param  {boolean}         [options.showInsertionWidget]         To add insertion buttons which insert a column or a row to a specific place, default false.
 * @param  {boolean}         [options.showHighlightingWidget]      To add highlighting bars which highlight columns and rows, and provide operations popover, default false.
 * @param  {Widget[]|null}   [options.rowBefore]                   To add row icon widgets by using {@link createIconWidget}. Row widgets are linked to the row elements of the table. Any widget can be added but only icon widget is supported.
 * @param  {Object}          [options.table]                       Options for the table element
 * @param  {string}          [options.table.namespaceURI='']       The namespace URI for this table
 * @param  {Object}          [options.row]                         Configuration options for the row element
 * @param  {Object}          [options.row.headerAttribute]         Configuration options for an attribute to be set on a row element when it is a header row
 * @param  {string}          [options.row.headerAttribute.name]    The attribute name
 * @param  {string}          [options.row.headerAttribute.value]   The value to set
 * @param  {Object}          [options.row.regularAttribute]        Configuration options for an attribute to be set on a row element when it is not a header row
 * @param  {string}          [options.row.regularAttribute.name]   The attribute name
 * @param  {string}          [options.row.regularAttribute.value]  The value to set
 * @param  {Object}          [options.cell]                        Configuration options for the cell element
 * @param  {string}          [options.cell.defaultTextContainer]   The default text container for the cell element
 * @param  {Object}          [options.cell.headerAttribute]        Configuration options for an attribute to be set on a cell element when it is a header cell
 * @param  {string}          [options.cell.headerAttribute.name]   The attribute name
 * @param  {string}          [options.cell.headerAttribute.value]  The value to set
 * @param  {Object}          [options.cell.regularAttribute]       Configuration options for an attribute to be set on a cell element when it is not a header cell
 * @param  {string}          [options.cell.regularAttribute.name]  The attribute name
 * @param  {string}          [options.cell.regularAttribute.value] The value to set
 */
export default function configureAsTeiTableElements(sxModule, options) {
	options = options || {};
	var tableDefinition = new TeiTableDefinition(options);
	configureAsTableElements(sxModule, options, tableDefinition);
}
