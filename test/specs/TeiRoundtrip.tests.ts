import * as slimdom from 'slimdom';

import Blueprint from 'fontoxml-blueprints/src/Blueprint';
import CoreDocument from 'fontoxml-core/src/Document';
import jsonMLMapper from 'fontoxml-dom-utils/src/jsonMLMapper';
import indicesManager from 'fontoxml-indices/src/indicesManager';
import mergeCells from 'fontoxml-table-flow/src/TableGridModel/mutations/merging/mergeCells';
import splitSpanningCell from 'fontoxml-table-flow/src/TableGridModel/mutations/splitting/splitSpanningCell';
import TeiTableDefinition from 'fontoxml-table-flow-tei/src/table-definition/TeiTableDefinition';

const mergeCellWithCellToTheRight = mergeCells.mergeCellWithCellToTheRight;
const mergeCellWithCellToTheLeft = mergeCells.mergeCellWithCellToTheLeft;
const mergeCellWithCellBelow = mergeCells.mergeCellWithCellBelow;
const mergeCellWithCellAbove = mergeCells.mergeCellWithCellAbove;

const splitCellIntoRows = splitSpanningCell.splitCellIntoRows;
const splitCellIntoColumns = splitSpanningCell.splitCellIntoColumns;

const stubFormat = {
	synthesizer: {
		completeStructure: () => true,
	},
	metadata: {
		get: (_option, _node) => false,
	},
	validator: {
		canContain: () => true,
		validateDown: () => [],
	},
};

describe('TEI: XML to XML roundtrip', () => {
	let documentNode;
	let coreDocument;
	let blueprint;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		coreDocument = new CoreDocument(documentNode);

		blueprint = new Blueprint(coreDocument.dom);
	});

	function transformTable(
		jsonIn,
		jsonOut,
		options = {},
		mutateGridModel = () => {}
	) {
		coreDocument.dom.mutate(() => jsonMLMapper.parse(jsonIn, documentNode));

		const tableDefinition = new TeiTableDefinition(options);
		const tableNode = documentNode.firstChild;
		const gridModel = tableDefinition.buildTableGridModel(
			tableNode,
			blueprint
		);
		chai.assert.isUndefined(gridModel.error);

		mutateGridModel(gridModel);

		const success = tableDefinition.applyToDom(
			gridModel,
			tableNode,
			blueprint,
			stubFormat
		);
		chai.assert.isTrue(success);

		blueprint.realize();
		// The changes will be set to merge with the base index, this needs to be commited.
		indicesManager.getIndexSet().commitMerge();
		chai.assert.deepEqual(
			jsonMLMapper.serialize(documentNode.firstChild),
			jsonOut
		);
	}

	describe('Without changes', () => {
		it('can handle a 1x1 table, changing nothing', () => {
			const jsonIn = [
				'table',
				{
					cols: '1',
					rows: '1',
				},
				['row', ['cell']],
			];

			const jsonOut = [
				'table',
				{
					cols: '1',
					rows: '1',
				},
				['row', ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options);
		});

		it('can handle a 4x4 table, changing nothing', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const jsonOut = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options);
		});
	});

	describe('Header rows', () => {
		it('can handle a 4x4 table, increasing the header row count by 1', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.increaseHeaderRowCount(1);

			const jsonOut = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {
				cell: {
					headerAttribute: {
						name: 'role',
						value: 'label',
					},
				},
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, increasing the header row count by 1', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.increaseHeaderRowCount(1);

			const jsonOut = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {
				cell: {
					headerAttribute: {
						name: 'role',
						value: 'label',
					},
				},
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 2 header rows, decreasing the header row count by 1', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.decreaseHeaderRowCount();

			const jsonOut = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {
				cell: {
					headerAttribute: {
						name: 'role',
						value: 'label',
					},
				},
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, decreasing the header row count by 1', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.decreaseHeaderRowCount();

			const jsonOut = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {
				cell: {
					headerAttribute: {
						name: 'role',
						value: 'label',
					},
				},
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, increasing the header row count by 1, setting all role attributes', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.increaseHeaderRowCount(1);

			const jsonOut = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				[
					'row',
					{ role: 'label' },
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				[
					'row',
					{ role: 'data' },
					['cell', { role: 'data' }],
					['cell', { role: 'data' }],
					['cell', { role: 'data' }],
					['cell', { role: 'data' }],
				],
				[
					'row',
					{ role: 'data' },
					['cell', { role: 'data' }],
					['cell', { role: 'data' }],
					['cell', { role: 'data' }],
					['cell', { role: 'data' }],
				],
				[
					'row',
					{ role: 'data' },
					['cell', { role: 'data' }],
					['cell', { role: 'data' }],
					['cell', { role: 'data' }],
					['cell', { role: 'data' }],
				],
			];

			const options = {
				row: {
					headerAttribute: {
						name: 'role',
						value: 'label',
					},
					regularAttribute: {
						name: 'role',
						value: 'data',
					},
				},
				cell: {
					headerAttribute: {
						name: 'role',
						value: 'label',
					},
					regularAttribute: {
						name: 'role',
						value: 'data',
					},
				},
			};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Insert row', () => {
		it('can handle a 4x4 table, inserting a row before index 0', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertRow(0, false);

			const jsonOut = [
				'table',
				{
					cols: '4',
					rows: '5',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, inserting a row before index 2', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertRow(2, false);

			const jsonOut = [
				'table',
				{
					cols: '4',
					rows: '5',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, inserting a row after index 3', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.insertRow(3, true);

			const jsonOut = [
				'table',
				{
					cols: '4',
					rows: '5',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, inserting a row before index 0', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertRow(0, false);

			const jsonOut = [
				'table',
				{
					cols: '4',
					rows: '5',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 2 header rows, inserting a row after index 1', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.insertRow(1, true);

			const jsonOut = [
				'table',
				{
					cols: '4',
					rows: '5',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Delete row', () => {
		it('can handle a 4x4 table, deleting a row at index 0', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(0);

			const jsonOut = [
				'table',
				{
					cols: '4',
					rows: '3',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, deleting a row at index 2', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(2);

			const jsonOut = [
				'table',
				{
					cols: '4',
					rows: '3',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, deleting a row at index 3', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(3);

			const jsonOut = [
				'table',
				{
					cols: '4',
					rows: '3',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, deleting a row at index 0', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(0);

			const jsonOut = [
				'table',
				{
					cols: '4',
					rows: '3',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, deleting a row at index 0', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(0);

			const jsonOut = [
				'table',
				{
					cols: '4',
					rows: '3',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 2 header rows, deleting a row at index 1', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '3',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(1);

			const jsonOut = [
				'table',
				{
					cols: '4',
					rows: '3',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Insert column', () => {
		it('can handle a 4x4 table, adding 1 column before index 0', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertColumn(0, false);

			const jsonOut = [
				'table',
				{
					cols: '5',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, adding 1 column before index 2', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertColumn(2, false);

			const jsonOut = [
				'table',
				{
					cols: '5',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, adding 1 column after index 3', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertColumn(3, true);

			const jsonOut = [
				'table',
				{
					cols: '5',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, adding 1 column before index 0', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertColumn(0, false);

			const jsonOut = [
				'table',
				{
					cols: '5',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, adding 1 column before index 2', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertColumn(2, false);

			const jsonOut = [
				'table',
				{
					cols: '5',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, adding 1 column after index 3', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertColumn(3, true);

			const jsonOut = [
				'table',
				{
					cols: '5',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Delete column', () => {
		it('can handle a 4x4 table, deleting 1 column at index 0', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(0);

			const jsonOut = [
				'table',
				{
					cols: '3',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, deleting 1 column at index 2', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(2);

			const jsonOut = [
				'table',
				{
					cols: '3',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, deleting 1 column at index 3', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(3);

			const jsonOut = [
				'table',
				{
					cols: '3',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, deleting 1 column at index 0', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(0);

			const jsonOut = [
				'table',
				{
					cols: '3',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, deleting 1 column at index 2', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(2);

			const jsonOut = [
				'table',
				{
					cols: '3',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, deleting 1 column at index 3', () => {
			const jsonIn = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(3);

			const jsonOut = [
				'table',
				{
					cols: '3',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
				],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Merging cells', () => {
		it('can handle a 3x3 table, merging a cell with the cell above', () => {
			const jsonIn = [
				'table',
				{
					cols: '3',
					rows: '3',
				},
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				mergeCellWithCellAbove(
					gridModel,
					gridModel.getCellAtCoordinates(1, 1),
					blueprint
				);

			const jsonOut = [
				'table',
				{
					cols: '3',
					rows: '3',
				},
				['row', ['cell'], ['cell', { rows: '2' }], ['cell']],
				['row', ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 3x3 table, merging a cell with the cell to the right', () => {
			const jsonIn = [
				'table',
				{
					cols: '3',
					rows: '3',
				},
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				mergeCellWithCellToTheRight(
					gridModel,
					gridModel.getCellAtCoordinates(1, 1),
					blueprint
				);

			const jsonOut = [
				'table',
				{
					cols: '3',
					rows: '3',
				},
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell', { cols: '2' }]],
				['row', ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 3x3 table, merging a cell with the cell below', () => {
			const jsonIn = [
				'table',
				{
					cols: '3',
					rows: '3',
				},
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				mergeCellWithCellBelow(
					gridModel,
					gridModel.getCellAtCoordinates(1, 1),
					blueprint
				);

			const jsonOut = [
				'table',
				{
					cols: '3',
					rows: '3',
				},
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell', { rows: '2' }], ['cell']],
				['row', ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 3x3 table, merging a cell with a cell to the left', () => {
			const jsonIn = [
				'table',
				{
					cols: '3',
					rows: '3',
				},
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				mergeCellWithCellToTheLeft(
					gridModel,
					gridModel.getCellAtCoordinates(1, 1),
					blueprint
				);

			const jsonOut = [
				'table',
				{
					cols: '3',
					rows: '3',
				},
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell', { cols: '2' }], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Split cell', () => {
		it('can handle a 3x3 table, splitting a cell spanning over columns', () => {
			const jsonIn = [
				'table',
				{
					cols: '3',
					rows: '3',
				},
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell', { cols: '2' }]],
				['row', ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => {
				splitCellIntoColumns(
					gridModel,
					gridModel.getCellAtCoordinates(1, 1)
				);
			};

			const jsonOut = [
				'table',
				{
					cols: '3',
					rows: '3',
				},
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 3x3 table, splitting a cell spanning over rows', () => {
			const jsonIn = [
				'table',
				{
					cols: '3',
					rows: '3',
				},
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell', { rows: '2' }], ['cell']],
				['row', ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => {
				splitCellIntoRows(
					gridModel,
					gridModel.getCellAtCoordinates(1, 1)
				);
			};

			const jsonOut = [
				'table',
				{
					cols: '3',
					rows: '3',
				},
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('TEI specifics', () => {
		it('can handle a 4x4 table without rows and cols attributes', () => {
			const jsonIn = [
				'table',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const jsonOut = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const options = {};

			transformTable(jsonIn, jsonOut, options);
		});

		it('can handle a 4x4 table without role="data"', () => {
			const jsonIn = [
				'table',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const jsonOut = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				[
					'row',
					['cell', { role: 'data' }],
					['cell', { role: 'data' }],
					['cell', { role: 'data' }],
					['cell', { role: 'data' }],
				],
				[
					'row',
					['cell', { role: 'data' }],
					['cell', { role: 'data' }],
					['cell', { role: 'data' }],
					['cell', { role: 'data' }],
				],
				[
					'row',
					['cell', { role: 'data' }],
					['cell', { role: 'data' }],
					['cell', { role: 'data' }],
					['cell', { role: 'data' }],
				],
				[
					'row',
					['cell', { role: 'data' }],
					['cell', { role: 'data' }],
					['cell', { role: 'data' }],
					['cell', { role: 'data' }],
				],
			];

			const options = {
				cell: {
					regularAttribute: {
						name: 'role',
						value: 'data',
					},
				},
			};

			transformTable(jsonIn, jsonOut, options);
		});

		it('can handle a 4x4 table, without @role="data" on the rows', () => {
			const jsonIn = [
				'table',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const jsonOut = [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				[
					'row',
					{ role: 'data' },
					['cell'],
					['cell'],
					['cell'],
					['cell'],
				],
				[
					'row',
					{ role: 'data' },
					['cell'],
					['cell'],
					['cell'],
					['cell'],
				],
				[
					'row',
					{ role: 'data' },
					['cell'],
					['cell'],
					['cell'],
					['cell'],
				],
				[
					'row',
					{ role: 'data' },
					['cell'],
					['cell'],
					['cell'],
					['cell'],
				],
			];

			const options = {
				row: {
					regularAttribute: {
						name: 'role',
						value: 'data',
					},
				},
			};

			transformTable(jsonIn, jsonOut, options);
		});
	});
});
