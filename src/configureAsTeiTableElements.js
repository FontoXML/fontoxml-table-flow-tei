import configureAsTableElements from 'fontoxml-table-flow/src/configureAsTableElements.js';
import TeiTableDefinition from './table-definition/TeiTableDefinition.js';

/**
 * Configure TEI tables.
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
 *		columnBefore: [
 *			createIconWidget('clock-o', {
 *				clickOperation: 'lcTime-value-edit',
 *				tooltipContent: 'Click here to edit the duration'
 *			})
 *		],
 *		showInsertionWidget: true,
 *		showHighlightingWidget: true,
 *		columnWidgetMenuOperations: [
 *			{ contents: [{ name: 'column-delete-at-index' }] }
 *		],
 *		rowWidgetMenuOperations: [
 *			{ contents: [{ name: 'contextual-row-delete' }] }
 *		]
 *	});
 *```
 *
 * The cell element menu button widgets are added based on the existence of contextual operations on
 * cell level. Make sure that only cell-specific operations are added to the cell widget, so that
 * users are only given options relevant to them.
 * Example on how you can add this element menu on the widget:
 *
 * ```
 *	configureProperties(sxModule, 'self::cell', {
 *		contextualOperations: [
 *			{ name: 'contextual-set-total-cell', hideIn: ['context-menu'] }
 *		]
 *	});
 * ```
 *
 * Tei tables can also be configured to be collapsible. Refer to {@link fonto-documentation/docs/editor/fontoxml-editor-documentation/quickstarts/configure-tables.xml#id-6c3f43af-b40c-4fa3-ab47-f0fd2d4ab85c our guide} to learn more.
 *
 * @fontosdk
 *
 * @category add-on/fontoxml-table-flow-tei
 *
 * @param  {Object}          sxModule
 * @param  {Object}          [options]
 * @param  {number}          [options.priority]                          Selector priority for all elements configured by this function
 * @param  {boolean}         [options.showInsertionWidget]               To add insertion buttons which insert a column or a row to a specific place, default false.
 * @param  {boolean}         [options.showHighlightingWidget]            To add highlighting bars which highlight columns and rows, and provide operations popover, default false.
 * @param  {Widget[]|null}   [options.rowBefore]                         To add a single icon widget
 * before each row by using {@link createIconWidget}. Row widgets are linked to the row elements of the table. Any widget can be added but only icon widget is supported.
 * @param  {Widget[]|null}   [options.columnBefore]                      To add one or multiple
 * widgets before each column. Column widgets are linked to the cell elements in the first row. If
 * there is even one merged cell (to left or right) in the first row, the widgets in columnBefore
 * widget area are not rendered.
 * {@link fonto-documentation/docs/editor/api/index.xml#id-9d2b1ad5-bbc1-6c44-d491-16dc213c53f2 | All widgets} are supported.
 * @param  {Object[]|null}   [options.columnWidgetMenuOperations]        To configure table widget menu for columns. It accepts an array of {@link ContextualOperation}s, but only supports "name" and "contents" properties. It is allowed to have only one layer of menu.
 * @param  {Object[]|null}   [options.rowWidgetMenuOperations]           To configure table widget menu for rows. It accepts an array of {@link ContextualOperation}s, but only supports "name" and "contents" properties. It is allowed to have only one layer of menu.
 * @param  {Object}          [options.table]                             Options for the table element
 * @param  {string}          [options.table.namespaceURI='']             The namespace URI for this table
 * @param  {Object}          [options.row]                               Configuration options for the row element
 * @param  {Object}          [options.row.headerAttribute]               Configuration options for an attribute to be set on a row element when it is a header row
 * @param  {string}          [options.row.headerAttribute.name]          The attribute name
 * @param  {string}          [options.row.headerAttribute.value]         The value to set
 * @param  {Object}          [options.row.regularAttribute]              Configuration options for an attribute to be set on a row element when it is not a header row
 * @param  {string}          [options.row.regularAttribute.name]         The attribute name
 * @param  {string}          [options.row.regularAttribute.value]        The value to set
 * @param  {Object}          [options.cell]                              Configuration options for the cell element
 * @param  {string}          [options.cell.defaultTextContainer]         The default text container for the cell element
 * @param  {Object}          [options.cell.headerAttribute]              Configuration options for an attribute to be set on a cell element when it is a header cell
 * @param  {string}          [options.cell.headerAttribute.name]         The attribute name
 * @param  {string}          [options.cell.headerAttribute.value]        The value to set
 * @param  {Object}          [options.cell.regularAttribute]             Configuration options for an attribute to be set on a cell element when it is not a header cell
 * @param  {string}          [options.cell.regularAttribute.name]        The attribute name
 * @param  {string}          [options.cell.regularAttribute.value]       The value to set
 * @param  {boolean}         [options.useDefaultContextMenu=true]        Whether or not to use a preconfigured context menu for elements within the table
 * @param  {XPathQuery}      [options.isCollapsibleQuery=false()]        The {@link XPathQuery} to determine whether or not a table has the ability to be collapsible. Optional, defaults to 'false()'. $rowCount and $columnCount helper variables can optionally be used in this XPath expression which evaluate to the total rows and total columns in a table.
 * @param  {XPathQuery}      [options.isInitiallyCollapsedQuery=true()]  The {@link XPathQuery} to determine whether or not a table should initially start off as collapsed. Tables must first have the ability to be collapsible with isCollapsibleQuery. Optional, defaults to 'true()'. $rowCount and $columnCount helper variables can optionally be used in this XPath expression which evaluate to the total rows and total columns in a table.
 */
export default function configureAsTeiTableElements(sxModule, options) {
	options = options || {};
	const tableDefinition = new TeiTableDefinition(options);
	configureAsTableElements(sxModule, options, tableDefinition);
}
