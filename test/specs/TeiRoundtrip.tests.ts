import type Blueprint from 'fontoxml-blueprints/src/Blueprint';
import type { FontoElementNode, JsonMl } from 'fontoxml-dom-utils/src/types';
import xq from 'fontoxml-selectors/src/xq';
import { isTableGridModel } from 'fontoxml-table-flow/src/indexedTableGridModels';
import mergeCells from 'fontoxml-table-flow/src/TableGridModel/mutations/merging/mergeCells';
import splitSpanningCell from 'fontoxml-table-flow/src/TableGridModel/mutations/splitting/splitSpanningCell';
import type TableCell from 'fontoxml-table-flow/src/TableGridModel/TableCell';
import type TableGridModel from 'fontoxml-table-flow/src/TableGridModel/TableGridModel';
import type { TableElementsSharedOptions } from 'fontoxml-table-flow/src/types';
import TeiTableDefinition from 'fontoxml-table-flow-tei/src/table-definition/TeiTableDefinition';
import type { TableElementsTeiOptions } from 'fontoxml-table-flow-tei/src/types';
import { assertDocumentAsJsonMl } from 'fontoxml-unit-test-utils/src/unitTestAssertionHelpers';
import UnitTestEnvironment from 'fontoxml-unit-test-utils/src/UnitTestEnvironment';
import {
	findFirstNodeInDocument,
	runWithBlueprint,
} from 'fontoxml-unit-test-utils/src/unitTestSetupHelpers';

const mergeCellWithCellToTheRight = mergeCells.mergeCellWithCellToTheRight;
const mergeCellWithCellToTheLeft = mergeCells.mergeCellWithCellToTheLeft;
const mergeCellWithCellBelow = mergeCells.mergeCellWithCellBelow;
const mergeCellWithCellAbove = mergeCells.mergeCellWithCellAbove;

const splitCellIntoRows = splitSpanningCell.splitCellIntoRows;
const splitCellIntoColumns = splitSpanningCell.splitCellIntoColumns;

describe('TEI: XML to XML roundtrip', () => {
	let environment: UnitTestEnvironment;
	beforeEach(() => {
		environment = new UnitTestEnvironment();
	});
	afterEach(() => {
		environment.destroy();
	});

	function runTest(
		jsonIn: JsonMl,
		jsonOut: JsonMl,
		options: TableElementsSharedOptions & TableElementsTeiOptions = {},
		mutateGridModel: (
			gridModel: TableGridModel,
			blueprint: Blueprint
		) => void = () => {
			// Do nothing
		}
	): void {
		const documentId = environment.createDocumentFromJsonMl(jsonIn);
		const tableDefinition = new TeiTableDefinition(options);
		const tableNode = findFirstNodeInDocument(
			documentId,
			xq`//table`
		) as FontoElementNode;
		runWithBlueprint((blueprint, _, format) => {
			const gridModel = tableDefinition.buildTableGridModel(
				tableNode,
				blueprint
			);
			if (!isTableGridModel(gridModel)) {
				throw gridModel.error;
			}

			mutateGridModel(gridModel, blueprint);

			const success = tableDefinition.applyToDom(
				gridModel,
				tableNode,
				blueprint,
				format
			);
			chai.assert.isTrue(success);
		});

		assertDocumentAsJsonMl(documentId, jsonOut);
	}

	describe('Without changes', () => {
		it('can handle a 1x1 table, changing nothing', () => {
			const jsonIn: JsonMl = [
				'table',
				{
					cols: '1',
					rows: '1',
				},
				['row', ['cell']],
			];

			const jsonOut: JsonMl = [
				'table',
				{
					cols: '1',
					rows: '1',
				},
				['row', ['cell']],
			];

			const options = {};

			runTest(jsonIn, jsonOut, options);
		});

		it('can handle a 4x4 table, changing nothing', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options);
		});
	});

	describe('Header rows', () => {
		it('can handle a 4x4 table, increasing the header row count by 1', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, increasing the header row count by 1', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 2 header rows, decreasing the header row count by 1', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, decreasing the header row count by 1', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, increasing the header row count by 1, setting all role attributes', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Insert row', () => {
		it('can handle a 4x4 table, inserting a row before index 0', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, inserting a row before index 2', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, inserting a row after index 3', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, inserting a row before index 0', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 2 header rows, inserting a row after index 1', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Delete row', () => {
		it('can handle a 4x4 table, deleting a row at index 0', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, deleting a row at index 2', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, deleting a row at index 3', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, deleting a row at index 0', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, deleting a row at index 0', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 2 header rows, deleting a row at index 1', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Insert column', () => {
		it('can handle a 4x4 table, adding 1 column before index 0', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, adding 1 column before index 2', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, adding 1 column after index 3', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, adding 1 column before index 0', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, adding 1 column before index 2', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, adding 1 column after index 3', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Delete column', () => {
		it('can handle a 4x4 table, deleting 1 column at index 0', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, deleting 1 column at index 2', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table, deleting 1 column at index 3', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, deleting 1 column at index 0', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, deleting 1 column at index 2', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 4x4 table with 1 header row, deleting 1 column at index 3', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Merging cells', () => {
		it('can handle a 3x3 table, merging a cell with the cell above', () => {
			const jsonIn: JsonMl = [
				'table',
				{
					cols: '3',
					rows: '3',
				},
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (
				gridModel: TableGridModel,
				blueprint: Blueprint
			) => {
				mergeCellWithCellAbove(
					gridModel,
					gridModel.getCellAtCoordinates(1, 1) as TableCell,
					blueprint
				);
			};

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 3x3 table, merging a cell with the cell to the right', () => {
			const jsonIn: JsonMl = [
				'table',
				{
					cols: '3',
					rows: '3',
				},
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (
				gridModel: TableGridModel,
				blueprint: Blueprint
			) => {
				mergeCellWithCellToTheRight(
					gridModel,
					gridModel.getCellAtCoordinates(1, 1) as TableCell,
					blueprint
				);
			};

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 3x3 table, merging a cell with the cell below', () => {
			const jsonIn: JsonMl = [
				'table',
				{
					cols: '3',
					rows: '3',
				},
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (
				gridModel: TableGridModel,
				blueprint: Blueprint
			) => {
				mergeCellWithCellBelow(
					gridModel,
					gridModel.getCellAtCoordinates(1, 1) as TableCell,
					blueprint
				);
			};

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 3x3 table, merging a cell with a cell to the left', () => {
			const jsonIn: JsonMl = [
				'table',
				{
					cols: '3',
					rows: '3',
				},
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (
				gridModel: TableGridModel,
				blueprint: Blueprint
			) => {
				mergeCellWithCellToTheLeft(
					gridModel,
					gridModel.getCellAtCoordinates(1, 1) as TableCell,
					blueprint
				);
			};

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('Split cell', () => {
		it('can handle a 3x3 table, splitting a cell spanning over columns', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});

		it('can handle a 3x3 table, splitting a cell spanning over rows', () => {
			const jsonIn: JsonMl = [
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

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options, mutateGridModel);
		});
	});

	describe('TEI specifics', () => {
		it('can handle a 4x4 table without rows and cols attributes', () => {
			const jsonIn: JsonMl = [
				'table',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options);
		});

		it('can handle a 4x4 table without role="data"', () => {
			const jsonIn: JsonMl = [
				'table',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options);
		});

		it('can handle a 4x4 table, without @role="data" on the rows', () => {
			const jsonIn: JsonMl = [
				'table',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const jsonOut: JsonMl = [
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

			runTest(jsonIn, jsonOut, options);
		});
	});
});
