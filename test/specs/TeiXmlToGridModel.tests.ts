import * as slimdom from 'slimdom';

import Blueprint from 'fontoxml-blueprints/src/Blueprint';
import CoreDocument from 'fontoxml-core/src/Document';
import jsonMLMapper from 'fontoxml-dom-utils/src/jsonMLMapper';
import TeiTableDefinition from 'fontoxml-table-flow-tei/src/table-definition/TeiTableDefinition';

describe('TEI: XML to GridModel', () => {
	let documentNode;
	let coreDocument;
	let blueprint;
	let tableDefinition;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		coreDocument = new CoreDocument(documentNode);

		blueprint = new Blueprint(coreDocument.dom);
		tableDefinition = new TeiTableDefinition({
			cell: {
				headerAttribute: {
					name: 'role',
					value: 'label',
				},
			},
		});
	});

	describe('Basics', () => {
		it('can deserialize a 1x1 table', () => {
			coreDocument.dom.mutate(() =>
				jsonMLMapper.parse(
					[
						'table',
						{
							cols: '1',
							rows: '1',
						},
						['row', ['cell']],
					],
					documentNode
				)
			);

			const tableElement = documentNode.firstChild;
			const gridModel = tableDefinition.buildTableGridModel(
				tableElement,
				blueprint
			);
			chai.assert.isUndefined(gridModel.error);

			chai.assert.equal(gridModel.getHeight(), 1);
			chai.assert.equal(gridModel.getWidth(), 1);
			chai.assert.equal(gridModel.headerRowCount, 0);
		});

		it('can deserialize a 4x4 table', () => {
			coreDocument.dom.mutate(() =>
				jsonMLMapper.parse(
					[
						'table',
						{
							cols: '4',
							rows: '4',
						},
						['row', ['cell'], ['cell'], ['cell'], ['cell']],
						['row', ['cell'], ['cell'], ['cell'], ['cell']],
						['row', ['cell'], ['cell'], ['cell'], ['cell']],
						['row', ['cell'], ['cell'], ['cell'], ['cell']],
					],
					documentNode
				)
			);

			const tableElement = documentNode.firstChild;
			const gridModel = tableDefinition.buildTableGridModel(
				tableElement,
				blueprint
			);
			chai.assert.isUndefined(gridModel.error);

			chai.assert.equal(gridModel.getHeight(), 4);
			chai.assert.equal(gridModel.getWidth(), 4);
			chai.assert.equal(gridModel.headerRowCount, 0);
		});

		it('can deserialize a 4x4 table containing processing instructions and comments', () => {
			coreDocument.dom.mutate(() =>
				jsonMLMapper.parse(
					[
						'table',
						{
							cols: '4',
							rows: '4',
						},
						[
							'row',
							['cell'],
							['?someProcessingInstruction', 'someContent'],
							['cell'],
							['cell'],
							['cell'],
						],
						['row', ['cell'], ['cell'], ['cell'], ['cell']],
						[
							'row',
							['cell'],
							['cell'],
							['!', 'some comment'],
							['cell'],
							['cell'],
						],
						['row', ['cell'], ['cell'], ['cell'], ['cell']],
					],
					documentNode
				)
			);

			const tableElement = documentNode.firstChild;
			const gridModel = tableDefinition.buildTableGridModel(
				tableElement,
				blueprint
			);
			chai.assert.isUndefined(gridModel.error);

			chai.assert.equal(gridModel.getHeight(), 4);
			chai.assert.equal(gridModel.getWidth(), 4);
			chai.assert.equal(gridModel.headerRowCount, 0);
		});
	});

	describe('Headers and footers', () => {
		it('can deserialize a 4x4 table with 1 header row', () => {
			coreDocument.dom.mutate(() =>
				jsonMLMapper.parse(
					[
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
					],
					documentNode
				)
			);

			const tableElement = documentNode.firstChild;
			const gridModel = tableDefinition.buildTableGridModel(
				tableElement,
				blueprint
			);
			chai.assert.isUndefined(gridModel.error);

			chai.assert.equal(gridModel.getHeight(), 4);
			chai.assert.equal(gridModel.getWidth(), 4);
			chai.assert.equal(gridModel.headerRowCount, 1);
		});

		it('can deserialize a 4x4 table with 2 header rows', () => {
			coreDocument.dom.mutate(() =>
				jsonMLMapper.parse(
					[
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
					],
					documentNode
				)
			);

			const tableElement = documentNode.firstChild;
			const gridModel = tableDefinition.buildTableGridModel(
				tableElement,
				blueprint
			);
			chai.assert.isUndefined(gridModel.error);

			chai.assert.equal(gridModel.getHeight(), 4);
			chai.assert.equal(gridModel.getWidth(), 4);
			chai.assert.equal(gridModel.headerRowCount, 2);
		});
	});

	describe('Spanning cells', () => {
		describe('Column spanning cells', () => {
			it('can deserialize a 4x4 table with a column spanning cell on the first row', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(
						[
							'table',
							{
								cols: '4',
								rows: '4',
							},
							[
								'row',
								['cell', { cols: '2' }],
								['cell'],
								['cell'],
							],
							['row', ['cell'], ['cell'], ['cell'], ['cell']],
							['row', ['cell'], ['cell'], ['cell'], ['cell']],
							['row', ['cell'], ['cell'], ['cell'], ['cell']],
						],
						documentNode
					)
				);

				const tableElement = documentNode.firstChild;
				const gridModel = tableDefinition.buildTableGridModel(
					tableElement,
					blueprint
				);
				chai.assert.isUndefined(gridModel.error);

				chai.assert.equal(gridModel.getHeight(), 4);
				chai.assert.equal(gridModel.getWidth(), 4);
				chai.assert.equal(gridModel.headerRowCount, 0);
			});

			it('can deserialize a 4x4 table with a column spanning cell on the first header row', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(
						[
							'table',
							{
								cols: '4',
								rows: '4',
							},
							[
								'row',
								['cell', { role: 'label', cols: '2' }],
								['cell', { role: 'label' }],
								['cell', { role: 'label' }],
							],
							['row', ['cell'], ['cell'], ['cell'], ['cell']],
							['row', ['cell'], ['cell'], ['cell'], ['cell']],
							['row', ['cell'], ['cell'], ['cell'], ['cell']],
						],
						documentNode
					)
				);

				const tableElement = documentNode.firstChild;
				const gridModel = tableDefinition.buildTableGridModel(
					tableElement,
					blueprint
				);
				chai.assert.isUndefined(gridModel.error);

				chai.assert.equal(gridModel.getHeight(), 4);
				chai.assert.equal(gridModel.getWidth(), 4);
				chai.assert.equal(gridModel.headerRowCount, 1);
			});

			it('throws when building a gridModel from a table containing incorrect colspans', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(
						[
							'table',
							{
								cols: '4',
								rows: '4',
							},
							[
								'row',
								['cell', { cols: '2' }],
								['cell'],
								['cell'],
								['cell'],
							],
							['row', ['cell'], ['cell'], ['cell'], ['cell']],
							['row', ['cell'], ['cell'], ['cell'], ['cell']],
							['row', ['cell'], ['cell'], ['cell'], ['cell']],
						],
						documentNode
					)
				);

				const tableElement = documentNode.firstChild;

				chai.assert.property(
					tableDefinition.buildTableGridModel(
						tableElement,
						blueprint
					),
					'error'
				);
			});
		});

		describe('Row spanning cells', () => {
			it('can deserialize a 4x4 table with a row spanning cell on the first row', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(
						[
							'table',
							{
								cols: '4',
								rows: '4',
							},
							[
								'row',
								['cell', { rows: '2' }],
								['cell'],
								['cell'],
								['cell'],
							],
							['row', ['cell'], ['cell'], ['cell']],
							['row', ['cell'], ['cell'], ['cell'], ['cell']],
							['row', ['cell'], ['cell'], ['cell'], ['cell']],
						],
						documentNode
					)
				);

				const tableElement = documentNode.firstChild;
				const gridModel = tableDefinition.buildTableGridModel(
					tableElement,
					blueprint
				);
				chai.assert.isUndefined(gridModel.error);

				chai.assert.equal(gridModel.getHeight(), 4);
				chai.assert.equal(gridModel.getWidth(), 4);
				chai.assert.equal(gridModel.headerRowCount, 0);
			});

			it('throws when building a gridModel from a table containing incorrect rowspans', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(
						[
							'table',
							{
								cols: '4',
								rows: '4',
							},
							[
								'row',
								['cell', { rows: '2' }],
								['cell'],
								['cell'],
								['cell'],
							],
							['row', ['cell'], ['cell'], ['cell'], ['cell']],
							['row', ['cell'], ['cell'], ['cell'], ['cell']],
							['row', ['cell'], ['cell'], ['cell'], ['cell']],
						],
						documentNode
					)
				);

				const tableElement = documentNode.firstChild;

				chai.assert.property(
					tableDefinition.buildTableGridModel(
						tableElement,
						blueprint
					),
					'error'
				);
			});
		});

		describe('Row and column spanning cells', () => {
			it('can deserialize a 4x4 table with a column and row spanning cell on the first row', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(
						[
							'table',
							{
								cols: '4',
								rows: '4',
							},
							[
								'row',
								['cell', { cols: '2', rows: '2' }],
								['cell'],
								['cell'],
							],
							['row', ['cell'], ['cell']],
							['row', ['cell'], ['cell'], ['cell'], ['cell']],
							['row', ['cell'], ['cell'], ['cell'], ['cell']],
						],
						documentNode
					)
				);

				const tableElement = documentNode.firstChild;
				const gridModel = tableDefinition.buildTableGridModel(
					tableElement,
					blueprint
				);
				chai.assert.isUndefined(gridModel.error);

				chai.assert.equal(gridModel.getHeight(), 4);
				chai.assert.equal(gridModel.getWidth(), 4);
				chai.assert.equal(gridModel.headerRowCount, 0);
			});

			it('throws when building a gridModel from a table containing incorrect rowspans and colspans', () => {
				coreDocument.dom.mutate(() =>
					jsonMLMapper.parse(
						[
							'table',
							{
								cols: '4',
								rows: '4',
							},
							[
								'row',
								['cell', { cols: '2', rows: '2' }],
								['cell'],
								['cell'],
								['cell'],
							],
							['row', ['cell'], ['cell'], ['cell'], ['cell']],
							['row', ['cell'], ['cell'], ['cell'], ['cell']],
							['row', ['cell'], ['cell'], ['cell'], ['cell']],
						],
						documentNode
					)
				);

				const tableElement = documentNode.firstChild;

				chai.assert.property(
					tableDefinition.buildTableGridModel(
						tableElement,
						blueprint
					),
					'error'
				);
			});
		});
	});
});
