import type {
	FontoDocumentNode,
	FontoElementNode,
	JsonMl,
} from 'fontoxml-dom-utils/src/types';
import xq from 'fontoxml-selectors/src/xq';
import type TableCell from 'fontoxml-table-flow/src/TableGridModel/TableCell';
import type TableGridModel from 'fontoxml-table-flow/src/TableGridModel/TableGridModel';
import TeiTableDefinition from 'fontoxml-table-flow-tei/src/table-definition/TeiTableDefinition';
import { assertDocumentAsJsonMl } from 'fontoxml-unit-test-utils/src/unitTestAssertionHelpers';
import UnitTestEnvironment from 'fontoxml-unit-test-utils/src/UnitTestEnvironment';
import {
	findFirstNodeInDocument,
	runWithBlueprint,
} from 'fontoxml-unit-test-utils/src/unitTestSetupHelpers';

describe('TEI: Grid model to XML', () => {
	let environment: UnitTestEnvironment;
	beforeEach(() => {
		environment = new UnitTestEnvironment();
	});
	afterEach(() => {
		environment.destroy();
	});

	function runTest(
		numberOfRows: number,
		numberOfColumns: number,
		hasHeader: boolean,
		modifyGridModel: ((gridModel: TableGridModel) => void) | undefined,
		expected: JsonMl
	): void {
		const documentId = environment.createDocumentFromJsonMl(['table']);
		const documentNode = findFirstNodeInDocument(
			documentId,
			xq`self::node()`
		) as FontoDocumentNode;
		const tableDefinition = new TeiTableDefinition({
			cell: {
				headerAttribute: {
					name: 'role',
					value: 'label',
				},
			},
		});
		const tableNode = findFirstNodeInDocument(
			documentId,
			xq`/table`
		) as FontoElementNode;
		runWithBlueprint((blueprint, _, format) => {
			const tableGridModel = tableDefinition.getTableGridModelBuilder()(
				numberOfRows,
				numberOfColumns,
				hasHeader,
				documentNode
			);
			if (modifyGridModel) {
				modifyGridModel(tableGridModel);
			}
			chai.assert.isTrue(
				tableDefinition.applyToDom(
					tableGridModel,
					tableNode,
					blueprint,
					format
				)
			);
		});
		assertDocumentAsJsonMl(documentId, expected);
	}

	describe('Basics', () => {
		it('can serialize a 1x1 table', () => {
			runTest(1, 1, false, undefined, [
				'table',
				{
					cols: '1',
					rows: '1',
				},
				['row', ['cell']],
			]);
		});

		it('can serialize a 4x4 table', () => {
			runTest(4, 4, false, undefined, [
				'table',
				{
					cols: '4',
					rows: '4',
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			]);
		});
	});

	describe('Headers', () => {
		it('can serialize a 4x4 table', () => {
			runTest(4, 4, true, undefined, [
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
			]);
		});
	});

	describe('Spanning cells', () => {
		it('can serialize a 4x4 table with 1 column spanning cell', () => {
			runTest(
				4,
				4,
				false,
				(tableGridModel) => {
					const spanningCell = tableGridModel.getCellAtCoordinates(
						1,
						1
					) as TableCell;
					spanningCell.size.columns = 2;

					tableGridModel.setCellAtCoordinates(spanningCell, 1, 1);
					tableGridModel.setCellAtCoordinates(spanningCell, 1, 2);
				},
				[
					'table',
					{
						cols: '4',
						rows: '4',
					},
					['row', ['cell'], ['cell'], ['cell'], ['cell']],
					['row', ['cell'], ['cell', { cols: '2' }], ['cell']],
					['row', ['cell'], ['cell'], ['cell'], ['cell']],
					['row', ['cell'], ['cell'], ['cell'], ['cell']],
				]
			);
		});

		it('can serialize a 4x4 table with 1 row spanning cell', () => {
			runTest(
				4,
				4,
				false,
				(tableGridModel) => {
					const spanningCell = tableGridModel.getCellAtCoordinates(
						1,
						1
					) as TableCell;
					spanningCell.size.rows = 2;

					tableGridModel.setCellAtCoordinates(spanningCell, 1, 1);
					tableGridModel.setCellAtCoordinates(spanningCell, 2, 1);
				},
				[
					'table',
					{
						cols: '4',
						rows: '4',
					},
					['row', ['cell'], ['cell'], ['cell'], ['cell']],
					[
						'row',
						['cell'],
						['cell', { rows: '2' }],
						['cell'],
						['cell'],
					],
					['row', ['cell'], ['cell'], ['cell']],
					['row', ['cell'], ['cell'], ['cell'], ['cell']],
				]
			);
		});

		it('can serialize a 4x4 table with 1 column and row spanning cell', () => {
			runTest(
				4,
				4,
				false,
				(tableGridModel) => {
					const spanningCell = tableGridModel.getCellAtCoordinates(
						1,
						1
					) as TableCell;
					spanningCell.size.columns = 2;
					spanningCell.size.rows = 2;

					tableGridModel.setCellAtCoordinates(spanningCell, 1, 1);
					tableGridModel.setCellAtCoordinates(spanningCell, 1, 2);
					tableGridModel.setCellAtCoordinates(spanningCell, 2, 1);
					tableGridModel.setCellAtCoordinates(spanningCell, 2, 2);
				},
				[
					'table',
					{
						cols: '4',
						rows: '4',
					},
					['row', ['cell'], ['cell'], ['cell'], ['cell']],
					[
						'row',
						['cell'],
						['cell', { cols: '2', rows: '2' }],
						['cell'],
					],
					['row', ['cell'], ['cell']],
					['row', ['cell'], ['cell'], ['cell'], ['cell']],
				]
			);
		});
	});
});
