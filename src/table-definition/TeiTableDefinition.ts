import createCreateCellNodeStrategy from 'fontoxml-table-flow/src/createCreateCellNodeStrategy';
import createCreateRowStrategy from 'fontoxml-table-flow/src/createCreateRowStrategy';
import setAttributeStrategies from 'fontoxml-table-flow/src/setAttributeStrategies';
import TableDefinition from 'fontoxml-table-flow/src/TableDefinition';
import type { TeiTableOptions } from 'fontoxml-typescript-migration-debt/src/types';

/**
 * @remarks
 * Configures the table definition for TEI tables.
 */
class TeiTableDefinition extends TableDefinition {
	/**
	 * @param options -
	 */
	constructor(options: TeiTableOptions) {
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

		const namespaceSelector = `Q{${namespaceURI}}`;
		const selectorParts = {
			table: `${namespaceSelector}table${
				options.table && options.table.tableFilterSelector
					? `[${options.table.tableFilterSelector}]`
					: ''
			}`,
			row: `${namespaceSelector}row`,
			cell: `${namespaceSelector}cell`,
		};

		let headerRowFilter = '';
		let bodyRowFilter = '';

		if (shouldSetAttributeForHeaderRows) {
			headerRowFilter += `[@${headerRowAttributeName}="${headerRowAttributeValue}"`;
			bodyRowFilter += `[(@${headerRowAttributeName}="${headerRowAttributeValue}") => not()`;
		}

		if (shouldSetAttributeForHeaderCells) {
			headerRowFilter += `${
				headerRowFilter !== '' ? ' or ' : '['
			}child::${
				selectorParts.cell
			}/@${headerCellAttributeName}="${headerCellAttributeValue}"`;
			bodyRowFilter += `${bodyRowFilter !== '' ? ' or ' : '['}(child::${
				selectorParts.cell
			}/@${headerCellAttributeName}="${headerCellAttributeValue}") => not()`;
		}

		if (
			shouldSetAttributeForHeaderRows ||
			shouldSetAttributeForHeaderCells
		) {
			headerRowFilter += ']';
			bodyRowFilter += ']';
		}

		// Alias selector parts
		const row = selectorParts.row;
		const cell = selectorParts.cell;

		// Properties object
		const properties = {
			selectorParts,

			// Header row node selector
			headerRowNodeSelector:
				shouldSetAttributeForHeaderRows ||
				shouldSetAttributeForHeaderCells
					? `self::${row + headerRowFilter}`
					: undefined,

			// Finds
			findHeaderRowNodesXPathQuery:
				shouldSetAttributeForHeaderRows ||
				shouldSetAttributeForHeaderCells
					? `./${row}${headerRowFilter}`
					: '()',
			findBodyRowNodesXPathQuery: `./${row}${bodyRowFilter}`,

			findCellNodesXPathQuery: `./${cell}`,

			findNonTableNodesPrecedingRowsXPathQuery: `./*[self::${row} => not() and following-sibling::${row}]`,
			findNonTableNodesFollowingRowsXPathQuery: `./*[self::${row} => not() and preceding-sibling::${row}]`,

			// Data
			getNumberOfColumnsXPathQuery: `${
				'let $cols := ./@cols => number() return if ($cols) then $cols else ' +
				'(let $cells := (.//'
			}${row})[1]/${cell} return for $node in $cells return let $cols := $node/@cols => number() return if ($cols) then $cols else 1) => sum()`,
			getRowSpanForCellNodeXPathQuery:
				'let $rows := ./@rows => number() return if ($rows) then $rows else 1',
			getColumnSpanForCellNodeXPathQuery:
				'let $cols := ./@cols => number() return if ($cols) then $cols else 1',

			// Creates
			createCellNodeStrategy: createCreateCellNodeStrategy(
				namespaceURI,
				'cell'
			),
			createRowStrategy: createCreateRowStrategy(namespaceURI, 'row'),

			// Set attributes
			setTableNodeAttributeStrategies: [
				setAttributeStrategies.createColumnCountAsAttributeStrategy(
					'cols'
				),
				setAttributeStrategies.createRowCountAsAttributeStrategy(
					'rows'
				),
			],

			setRowNodeAttributeStrategies: [],

			setCellNodeAttributeStrategies: [
				setAttributeStrategies.createColumnSpanAsAttributeStrategy(
					'cols'
				),
				setAttributeStrategies.createRowSpanAsAttributeStrategy('rows'),
			],

			// Widget menu operations
			columnWidgetMenuOperations: options.columnWidgetMenuOperations || [
				{ contents: [{ name: 'column-delete-at-index' }] },
			],
			rowWidgetMenuOperations: options.rowWidgetMenuOperations || [
				{ contents: [{ name: 'contextual-row-delete' }] },
			],
		};

		if (shouldSetAttributeForHeaderRows) {
			properties.setRowNodeAttributeStrategies.push(
				setAttributeStrategies.createHeaderDefinitionAsAttributeStrategy(
					headerRowAttributeName,
					headerRowAttributeValue
				)
			);
		}

		if (shouldSetAttributeForNormalRows) {
			properties.setRowNodeAttributeStrategies.push(
				setAttributeStrategies.createNormalDefinitionAsAttributeStrategy(
					normalRowAttributeName,
					normalRowAttributeValue
				)
			);
		}

		if (shouldSetAttributeForHeaderCells) {
			properties.setCellNodeAttributeStrategies.push(
				setAttributeStrategies.createHeaderDefinitionAsAttributeStrategy(
					headerCellAttributeName,
					headerCellAttributeValue
				)
			);
		}

		if (shouldSetAttributeForNormalCells) {
			properties.setCellNodeAttributeStrategies.push(
				setAttributeStrategies.createNormalDefinitionAsAttributeStrategy(
					normalCellAttributeName,
					normalCellAttributeValue
				)
			);
		}

		super(properties);
	}
}

export default TeiTableDefinition;
