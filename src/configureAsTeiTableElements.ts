import type {
	AllowExpansionInContentView,
	DefaultTextContainer,
	Widget,
	WidgetSubAreaByName,
} from 'fontoxml-families/src/types';
import type { SxModule } from 'fontoxml-modular-schema-experience/src/sxManager';
import type { ContextualOperation } from 'fontoxml-operations/src/types';
import type { XPathQuery } from 'fontoxml-selectors/src/types';
import configureAsTableElements from 'fontoxml-table-flow/src/configureAsTableElements';

import TeiTableDefinition from './table-definition/TeiTableDefinition';

/**
 * @remarks
 * Configure TEI tables.
 *
 * Check {@link
 * fonto-documentation/docs/configure/elements/configure-tables.xml#id-d8cde415-f9e0-ba0c-14a5-cdb5f92d647d
 * | our guide} for more information on table widgets. Example usage for the table
 * widgets:
 *
 * ```
 * configureAsTeiTableElements(sxModule, {
 * 	table: {
 * 		namespaceURI: 'http://www.tei-c.org/ns/1.0'
 * 	},
 * 	cell: {
 * 		defaultTextContainer: 'p'
 * 	},
 * 	row: {
 * 		headerAttribute: {
 * 			name: 'role',
 * 			value: 'label'
 * 		}
 * 	},
 * 	rowBefore: [
 * 		createIconWidget('dot-circle-o', {
 * 			clickOperation: 'do-nothing'
 * 		})
 * 	],
 * 	columnBefore: [
 * 		createIconWidget('clock-o', {
 * 			clickOperation: 'lcTime-value-edit',
 * 			tooltipContent: 'Click here to edit the duration'
 * 		})
 * 	],
 * 	showInsertionWidget: true,
 * 	showSelectionWidget: true,
 *	columnsWidgetMenuOperations: [
 *		{ contents: [{ name: 'columns-delete' }] }
 *	],
 *	rowsWidgetMenuOperations: [
 *		{ contents: [{ name: 'rows-delete' }] }
 *	]
 *	});
 * });
 * ```
 *
 * The cell element menu button widgets are added based on the existence of
 * contextual operations on cell level. Make sure that only cell-specific
 * operations are added to the cell widget, so that users are only given options
 * relevant to them. Example on how you can add this element menu on the widget:
 *
 * ```
 * configureProperties(sxModule, 'self::cell', {
 * 	contextualOperations: [
 * 		{ name: 'contextual-set-total-cell', hideIn: ['context-menu'] }
 * 	]
 * });
 * ```
 *
 * Tei tables can also be configured to be collapsible. Refer to {@link
 * fonto-documentation/docs/configure/elements/configure-tables.xml#id-6c3f43af-b40c-4fa3-ab47-f0fd2d4ab85c
 * | our guide} to learn more.
 *
 * @fontosdk importable
 *
 * @param sxModule                            -
 * @param options                             -
 * @param options.priority                    - Selector priority for all elements configured by this
 *                                              function.
 * @param options.allowExpansionInContentView - Defines the availability of expansion of a table.
 * @param options.showInsertionWidget         - To add insertion buttons which insert a column or a row
 *                                              to a specific place, default false.
 * @param options.showHighlightingWidget      - This is deprecated. Instead use showSelectionWidget.
 * @param options.showSelectionWidget         - To add selection bars which select columns and rows,
 *                                              and provide operations popover, default false.
 * @param options.rowBefore                   - Used to add a single icon widget before each row using
 *                                              {@link createIconWidget}. Row widgets are linked to the
 *                                              row elements of the table. Any widget can be added but
 *                                              only icon widget is supported.
 * @param options.columnBefore                - Used to add one or multiple widgets before each column.
 *                                              The context node of each column widget is the cell
 *                                              element in the first row. If there is even one merged
 *                                              cell (to left or right) in the first row, the widgets
 *                                              in columnBefore widget area are not rendered. {@link
 *                                              fonto-documentation/docs/generated-content/editor-api/index.xml#id-cd5577eb-9790-92d6-e3ac-8d1554fe6b12
 *                                              | All widgets} are supported.
 * @param options.columnWidgetMenuOperations  - This is deprecated. Use columnsWidgetMenuOperations instead.
 * @param options.columnsWidgetMenuOperations - To configure table widget menu for columns. It accepts an array of
 *                                              {@link ContextualOperation}s, but only supports "name" and "contents" properties.
 *                                              It is allowed to have only one layer of menu.
 * @param options.rowWidgetMenuOperations     - This is deprecated. Use rowsWidgetMenuOperations instead.
 * @param options.rowsWidgetMenuOperations    - To configure table widget menu for rows. It accepts an
 *                                              array of {@link ContextualOperation}s, but only supports
 *                                              "name" and "contents" properties. It is allowed to have
 *                                              only one layer of menu.
 * @param options.table                       - Options for the table element.
 * @param options.table.namespaceURI          - The namespace URI for this table.
 * @param options.row                         - Configuration options for the row element.
 * @param options.row.headerAttribute         - Configuration options for an attribute to be set on a
 *                                              row element when it is a header row.
 * @param options.row.headerAttribute.name    - The attribute name.
 * @param options.row.headerAttribute.value   - The value to set.
 * @param options.row.regularAttribute        - Configuration options for an attribute to be set on a
 *                                              row element when it is not a header row.
 * @param options.row.regularAttribute.name   - The attribute name.
 * @param options.row.regularAttribute.value  - The value to set.
 * @param options.cell                        - Configuration options for the cell element.
 * @param options.cell.defaultTextContainer   - The default text container for the cell element.
 * @param options.cell.headerAttribute        - Configuration options for an attribute to be set on a
 *                                              cell element when it is a header cell.
 * @param options.cell.headerAttribute.name   - The attribute name.
 * @param options.cell.headerAttribute.value  - The value to set.
 * @param options.cell.regularAttribute       - Configuration options for an attribute to be set on a
 *                                              cell element when it is not a header cell.
 * @param options.cell.regularAttribute.name  - The attribute name.
 * @param options.cell.regularAttribute.value - The value to set.
 * @param options.useDefaultContextMenu       - Whether or not to use a preconfigured context menu for
 *                                              elements within the table.
 * @param options.isCollapsibleQuery          - The {@link XPathQuery} to determine whether or not a
 *                                              table has the ability to be collapsible. Optional,
 *                                              defaults to 'false()'. $rowCount and $columnCount
 *                                              helper variables can optionally be used in this XPath
 *                                              expression which evaluate to the total rows and total
 *                                              columns in a table.
 * @param options.isInitiallyCollapsedQuery   - The {@link XPathQuery} to determine whether or not a
 *                                              table should initially start off as collapsed. Tables
 *                                              must first have the ability to be collapsible with
 *                                              isCollapsibleQuery. Optional, defaults to 'true()'.
 *                                              $rowCount and $columnCount helper variables can
 *                                              optionally be used in this XPath expression which
 *                                              evaluate to the total rows and total columns in a
 *                                              table.
 */
export default function configureAsTeiTableElements(
	sxModule: SxModule,
	options?: {
		priority?: number;
		allowExpansionInContentView?: AllowExpansionInContentView;
		showInsertionWidget?: boolean;
		/**
		 * @deprecated Instead use showSelectionWidget.
		 */
		showHighlightingWidget?: boolean;
		showSelectionWidget?: boolean;
		rowBefore?: Widget[] | WidgetSubAreaByName | null;
		columnBefore?: Widget[] | WidgetSubAreaByName | null;
		/**
		 * @deprecated
		 * Instead use columnsWidgetMenuOperations.
		 */
		columnWidgetMenuOperations?: ContextualOperation[] | null;
		columnsWidgetMenuOperations?: ContextualOperation[] | null;
		/**
		 * @deprecated
		 * Instead use rowsWidgetMenuOperations.
		 */
		rowWidgetMenuOperations?: ContextualOperation[] | null;
		rowsWidgetMenuOperations?: ContextualOperation[] | null;
		table?: {
			namespaceURI?: string | null;
		};
		row?: {
			headerAttribute?: {
				name?: string;
				value?: string;
			};
			regularAttribute?: {
				name?: string;
				value?: string;
			};
		};
		cell?: {
			defaultTextContainer?: DefaultTextContainer;
			headerAttribute?: {
				name?: string;
				value?: string;
			};
			regularAttribute?: {
				name?: string;
				value?: string;
			};
		};
		useDefaultContextMenu?: boolean;
		isCollapsibleQuery?: XPathQuery;
		isInitiallyCollapsedQuery?: XPathQuery;
	}
): void {
	options = options || {};
	const tableDefinition = new TeiTableDefinition(options);
	configureAsTableElements(sxModule, options, tableDefinition);
}
