define([
	'fontoxml-table-flow/TableDefinition',
	'fontoxml-table-flow/Width',

	'fontoxml-table-flow/setAttributeStrategies',

	'fontoxml-table-flow/createCreateRowStrategy'
], function (
	TableDefinition,
	Width,

	setAttributeStrategies,

	createCreateRowStrategy
) {
	'use strict';

	/**
	 * Configures the table definition for TEI tables.
	 *
	 * @param {TeiTableOptions} options
	 */
	function TeiTableDefinition (options) {
		var namespaceURI = options.table && options.table.namespaceURI ? options.table.namespaceURI : '';

		var shouldSetAttributeForHeaderRows = options.row && options.row.headerAttribute;
		var headerRowAttributeName = shouldSetAttributeForHeaderRows ?
				options.row.headerAttribute.name : '';
		var headerRowAttributeValue = shouldSetAttributeForHeaderRows ?
				options.row.headerAttribute.value : '';

		var shouldSetAttributeForNormalRows = options.row && options.row.regularAttribute;
		var normalRowAttributeName = shouldSetAttributeForNormalRows ?
				options.row.regularAttribute.name : '';
		var normalRowAttributeValue = shouldSetAttributeForNormalRows ?
				options.row.regularAttribute.value : '';

		var shouldSetAttributeForHeaderCells = options.cell && options.cell.headerAttribute;
		var headerCellAttributeName = shouldSetAttributeForHeaderCells ?
				options.cell.headerAttribute.name : '';
		var headerCellAttributeValue = shouldSetAttributeForHeaderCells ?
				options.cell.headerAttribute.value : '';

		var shouldSetAttributeForNormalCells = options.cell && options.cell.regularAttribute;
		var normalCellAttributeName = shouldSetAttributeForNormalCells ?
				options.cell.regularAttribute.name : '';
		var normalCellAttributeValue = shouldSetAttributeForNormalCells ?
				options.cell.regularAttribute.value : '';

		var namespaceSelector = 'Q{' + namespaceURI + '}';
		var selectorParts = {
			table: namespaceSelector + 'table' + (options.table && options.table.tableFilterSelector ?
					'[' + options.table.tableFilterSelector + ']' :
					''),
			row: namespaceSelector + 'row',
			cell: namespaceSelector + 'cell'
		};

		// Alias selector parts
		var table = selectorParts.table;
		var row = selectorParts.row;
		var cell = selectorParts.cell;

		// Properties object
		var properties = {
			selectorParts: selectorParts,
			namespaceURI: namespaceURI,
			cellLocalName: 'cell',

			tableDefiningNodeSelector: 'self::' + table,
			cellDefiningNodeSelector: 'self::' + cell,
			tablePartsNodeSelector: Object.keys(selectorParts).map(function (key) {
					return 'self::' + selectorParts[key];
				}.bind(this)).join(' or '),

			// Finds
			findHeaderRowNodesXPathQuery: './' + row + '[descendant::' + cell + '[@role="label"]]',
			findBodyRowNodesXPathQuery: './' + row + '[descendant::' + cell + '[(@role="label") => not()]]',

			findCellNodesXPathQuery: './' + cell,

			findNonTableNodesPrecedingRowsXPathQuery: './*[self::' + row + ' => not() and following-sibling::' + row + ']',
			findNonTableNodesFollowinggRowsXPathQuery: './*[self::' + row + ' => not() and preceding-sibling::' + row + ']',

			// Data
			getNumberOfColumnsXPathQuery: 'let $cols := ./@cols => number() return if ($cols) then $cols else ' +
				'(let $cells := (.//' + row + ')[1]/' + cell + ' return for $node in $cells return let $cols := $node/@cols => number() return if ($cols) then $cols else 1) => sum()',
			getRowSpanForCellNodeXPathQuery: 'let $rows := ./@rows => number() return if ($rows) then $rows else 1',
			getColumnSpanForCellNodeXPathQuery: 'let $cols := ./@cols => number() return if ($cols) then $cols else 1',

			// Default values
			getDefaultColumnSpecificationStrategy: function (context) {
					return {
						columnName: 'column-' + context.columnIndex,
						columnNumber: context.columnIndex,
						columnWidth: new Width('1*')
					};
				},
			getDefaultCellSpecificationStrategy: function (context) {
					return {
						rows: '1',
						cols: '1',
						width: new Width('1*')
					};
				},

			// Creates
			createRowStrategy: createCreateRowStrategy(namespaceURI, 'row'),

			// Set attributes
			setTableNodeAttributeStrategies: [
					setAttributeStrategies.createColumnCountAsAttributeStrategy('cols'),
					setAttributeStrategies.createRowCountAsAttributeStrategy('rows')
				],

			setRowNodeAttributeStrategies: [],

			setCellNodeAttributeStrategies: [
					setAttributeStrategies.createColumnSpanAsAttributeStrategy('cols'),
					setAttributeStrategies.createRowSpanAsAttributeStrategy('rows')
				],
		};

		if (shouldSetAttributeForHeaderRows) {
			properties.setRowNodeAttributeStrategies.push(
				setAttributeStrategies.createHeaderDefinitionAsAttributeStrategy(
					headerRowAttributeName,
					headerRowAttributeValue));
		}

		if (shouldSetAttributeForNormalRows) {
			properties.setRowNodeAttributeStrategies.push(
				setAttributeStrategies.createNormalDefinitionAsAttributeStrategy(
					normalRowAttributeName,
					normalRowAttributeValue));
		}

		if (shouldSetAttributeForHeaderCells) {
			properties.setCellNodeAttributeStrategies.push(
				setAttributeStrategies.createHeaderDefinitionAsAttributeStrategy(
					headerCellAttributeName,
					headerCellAttributeValue));
		}

		if (shouldSetAttributeForNormalCells) {
			properties.setCellNodeAttributeStrategies.push(
				setAttributeStrategies.createNormalDefinitionAsAttributeStrategy(
					normalCellAttributeName,
					normalCellAttributeValue));
		}

		TableDefinition.call(this, properties);
	}

	TeiTableDefinition.prototype = Object.create(TableDefinition.prototype);
	TeiTableDefinition.prototype.constructor = TeiTableDefinition;

	return TeiTableDefinition;
});
