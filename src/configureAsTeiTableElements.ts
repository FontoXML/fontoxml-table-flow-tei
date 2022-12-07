import type { SxModule } from 'fontoxml-modular-schema-experience/src/sxManager';
import configureAsTableElements from 'fontoxml-table-flow/src/configureAsTableElements';
import type { TableElementsSharedOptions } from 'fontoxml-table-flow/src/types';

import TeiTableDefinition from './table-definition/TeiTableDefinition';
import type { TableElementsTeiOptions } from './types';

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
 * {@link ContextualOperation | contextual operations} on cell level. Make sure that only cell-specific
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
 */
export default function configureAsTeiTableElements(
	sxModule: SxModule,
	options?: TableElementsSharedOptions & TableElementsTeiOptions
): void {
	options = options || {};
	const tableDefinition = new TeiTableDefinition(options);
	configureAsTableElements(sxModule, options, tableDefinition);
}
