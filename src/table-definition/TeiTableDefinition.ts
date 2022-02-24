import xq, { ensureXQExpression } from 'fontoxml-selectors/src/xq';
import createCreateCellNodeStrategy from 'fontoxml-table-flow/src/createCreateCellNodeStrategy';
import createCreateRowStrategy from 'fontoxml-table-flow/src/createCreateRowStrategy';
import {
	createColumnCountAsAttributeStrategy,
	createColumnSpanAsAttributeStrategy,
	createHeaderDefinitionAsAttributeStrategy,
	createNormalDefinitionAsAttributeStrategy,
	createRowCountAsAttributeStrategy,
	createRowSpanAsAttributeStrategy,
} from 'fontoxml-table-flow/src/setAttributeStrategies';
import TableDefinition from 'fontoxml-table-flow/src/TableDefinition';
import type {
	TableDefinitionProperties,
	TableElementsSharedOptions,
	TablePartSelectors,
} from 'fontoxml-table-flow/src/types';

import type { TableElementsTeiOptions } from '../types';

/**
 * @remarks
 * Configures the table definition for TEI tables.
 */
class TeiTableDefinition extends TableDefinition {
	/**
	 * @param options -
	 */
	public constructor(
		options: TableElementsSharedOptions & TableElementsTeiOptions
	) {
		const namespaceURI =
			options.table && options.table.namespaceURI
				? options.table.namespaceURI
				: '';

		const shouldSetAttributeForHeaderRows =
			options.row && options.row.headerAttribute;
		const headerRowAttributeName = shouldSetAttributeForHeaderRows
			? options.row.headerAttribute.name
			: '';
		const headerRowAttributeValue = shouldSetAttributeForHeaderRows
			? options.row.headerAttribute.value
			: '';

		const shouldSetAttributeForNormalRows =
			options.row && options.row.regularAttribute;
		const normalRowAttributeName = shouldSetAttributeForNormalRows
			? options.row.regularAttribute.name
			: '';
		const normalRowAttributeValue = shouldSetAttributeForNormalRows
			? options.row.regularAttribute.value
			: '';

		const shouldSetAttributeForHeaderCells =
			options.cell && options.cell.headerAttribute;
		const headerCellAttributeName = shouldSetAttributeForHeaderCells
			? options.cell.headerAttribute.name
			: '';
		const headerCellAttributeValue = shouldSetAttributeForHeaderCells
			? options.cell.headerAttribute.value
			: '';

		const shouldSetAttributeForNormalCells =
			options.cell && options.cell.regularAttribute;
		const normalCellAttributeName = shouldSetAttributeForNormalCells
			? options.cell.regularAttribute.name
			: '';
		const normalCellAttributeValue = shouldSetAttributeForNormalCells
			? options.cell.regularAttribute.value
			: '';

		const tablePartSelectors: TablePartSelectors = {
			table: ensureXQExpression(`self::Q{${namespaceURI}}table`),
			row: ensureXQExpression(`self::Q{${namespaceURI}}row`),
			cell: ensureXQExpression(`self::Q{${namespaceURI}}cell`),
		};

		let headerRowFilter = xq`true()`;
		let bodyRowFilter = xq`true()`;

		const headerRowAttributeQuery = headerRowAttributeName
			? ensureXQExpression(`attribute::*:${headerRowAttributeName}`)
			: xq`()`;

		if (shouldSetAttributeForHeaderRows) {
			headerRowFilter = xq`${headerRowAttributeQuery}=${headerRowAttributeValue}`;
			bodyRowFilter = xq`(${headerRowAttributeQuery}=${headerRowAttributeValue}) => not()`;
		}

		if (shouldSetAttributeForHeaderCells) {
			headerRowFilter = xq`${
				shouldSetAttributeForHeaderRows ? headerRowFilter : xq`false()`
			} or child::*[${
				tablePartSelectors.cell
			}]/@*[name(.)=${headerCellAttributeName}]=${headerCellAttributeValue}`;

			bodyRowFilter = xq`${
				shouldSetAttributeForHeaderRows ? headerRowFilter : xq`false()`
			} or (child::*[${
				tablePartSelectors.cell
			}]/@*[name(.)=${headerCellAttributeName}]=${headerCellAttributeValue}) => not()`;
		}

		// Alias selector parts
		const row = tablePartSelectors.row;
		const cell = tablePartSelectors.cell;

		// Properties object
		const properties: TableDefinitionProperties = {
			tablePartSelectors,

			// Header row node selector
			headerRowNodeSelector:
				shouldSetAttributeForHeaderRows ||
				shouldSetAttributeForHeaderCells
					? xq`${row}[${headerRowFilter}]`
					: undefined,

			// Finds
			findHeaderRowNodesXPathQuery:
				shouldSetAttributeForHeaderRows ||
				shouldSetAttributeForHeaderCells
					? xq`child::*[${row}[${headerRowFilter}]]`
					: xq`()`,
			findBodyRowNodesXPathQuery: xq`child::*[${row}[${bodyRowFilter}]]`,

			findCellNodesXPathQuery: xq`child::*[${cell}]`,

			findNonTableNodesPrecedingRowsXPathQuery: xq`child::*[${row} => not() and following-sibling::*[${row}]]`,
			findNonTableNodesFollowingRowsXPathQuery: xq`child::*[${row} => not() and preceding-sibling::*[${row}]]`,

			// Data
			getNumberOfColumnsXPathQuery: xq`let $cols := ./@cols => number()
			return if ($cols)
				then $cols
				else (
					let $cells := descendant::*[${row}][1]/child::*[${cell}]
						return for $node in $cells
							return let $cols := $node/@cols => number()
								return if ($cols)
									then $cols
									else 1
				) => sum()`,
			getRowSpanForCellNodeXPathQuery: xq`let $rows := ./@rows => number() return if ($rows) then $rows else 1`,
			getColumnSpanForCellNodeXPathQuery: xq`let $cols := ./@cols => number() return if ($cols) then $cols else 1`,

			// Creates
			createCellNodeStrategy: createCreateCellNodeStrategy(
				namespaceURI,
				'cell'
			),
			createRowStrategy: createCreateRowStrategy(namespaceURI, 'row'),

			// Set attributes
			setTableNodeAttributeStrategies: [
				createColumnCountAsAttributeStrategy('cols'),
				createRowCountAsAttributeStrategy('rows'),
			],

			setRowNodeAttributeStrategies: [],

			setCellNodeAttributeStrategies: [
				createColumnSpanAsAttributeStrategy('cols'),
				createRowSpanAsAttributeStrategy('rows'),
			],

			// Deprecated
			columnWidgetMenuOperations: options.columnWidgetMenuOperations,
			rowWidgetMenuOperations: options.rowWidgetMenuOperations,
			// Widget menu operations
			// Widget menu operations
			columnsWidgetMenuOperations:
				options.columnsWidgetMenuOperations || [
					{ contents: [{ name: 'columns-delete' }] },
				],
			rowsWidgetMenuOperations: options.rowsWidgetMenuOperations || [
				{ contents: [{ name: 'rows-delete' }] },
			],
		};

		if (shouldSetAttributeForHeaderRows) {
			properties.setRowNodeAttributeStrategies.push(
				createHeaderDefinitionAsAttributeStrategy(
					headerRowAttributeName,
					headerRowAttributeValue
				)
			);
		}

		if (shouldSetAttributeForNormalRows) {
			properties.setRowNodeAttributeStrategies.push(
				createNormalDefinitionAsAttributeStrategy(
					normalRowAttributeName,
					normalRowAttributeValue
				)
			);
		}

		if (shouldSetAttributeForHeaderCells) {
			properties.setCellNodeAttributeStrategies.push(
				createHeaderDefinitionAsAttributeStrategy(
					headerCellAttributeName,
					headerCellAttributeValue
				)
			);
		}

		if (shouldSetAttributeForNormalCells) {
			properties.setCellNodeAttributeStrategies.push(
				createNormalDefinitionAsAttributeStrategy(
					normalCellAttributeName,
					normalCellAttributeValue
				)
			);
		}

		super(properties);
	}
}

export default TeiTableDefinition;
