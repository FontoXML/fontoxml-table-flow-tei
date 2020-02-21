import Blueprint from 'fontoxml-blueprints/src/Blueprint.js';
import CoreDocument from 'fontoxml-core/src/Document.js';
import jsonMLMapper from 'fontoxml-dom-utils/src/jsonMLMapper.js';
import indicesManager from 'fontoxml-indices/src/indicesManager.js';
import * as slimdom from 'slimdom';

import TeiTableDefinition from 'fontoxml-table-flow-tei/src/table-definition/TeiTableDefinition.js';

const stubFormat = {
	synthesizer: {
		completeStructure: () => true
	},
	metadata: {
		get: (_option, _node) => false
	},
	validator: {
		canContain: () => true
	}
};

describe('TEI: Grid model to XML', () => {
	let blueprint;
	let coreDocument;
	let createTable;
	let documentNode;
	let tableDefinition;
	let tableNode;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		coreDocument = new CoreDocument(documentNode);
		blueprint = new Blueprint(coreDocument.dom);

		tableNode = documentNode.createElement('table');

		tableDefinition = new TeiTableDefinition({
			cell: {
				headerAttribute: {
					name: 'role',
					value: 'label'
				}
			}
		});
		createTable = tableDefinition.getTableGridModelBuilder();

		coreDocument.dom.mutate(() => {
			documentNode.appendChild(tableNode);
		});
	});

	describe('Basics', () => {
		it('can serialize a 1x1 table', () => {
			const tableGridModel = createTable(1, 1, false, documentNode);
			chai.assert.isTrue(
				tableDefinition.applyToDom(tableGridModel, tableNode, blueprint, stubFormat)
			);

			blueprint.realize();
			indicesManager.getIndexSet().commitMerge();
			chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
				'table',
				{
					cols: '1',
					rows: '1'
				},
				['row', ['cell']]
			]);
		});

		it('can serialize a 4x4 table', () => {
			const tableGridModel = createTable(4, 4, false, documentNode);
			chai.assert.isTrue(
				tableDefinition.applyToDom(tableGridModel, tableNode, blueprint, stubFormat)
			);

			blueprint.realize();
			indicesManager.getIndexSet().commitMerge();
			chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
				'table',
				{
					cols: '4',
					rows: '4'
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			]);
		});
	});

	describe('Headers', () => {
		it('can serialize a 4x4 table', () => {
			const tableGridModel = createTable(4, 4, true, documentNode);
			chai.assert.isTrue(
				tableDefinition.applyToDom(tableGridModel, tableNode, blueprint, stubFormat)
			);

			blueprint.realize();
			indicesManager.getIndexSet().commitMerge();
			chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
				'table',
				{
					cols: '4',
					rows: '4'
				},
				[
					'row',
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }],
					['cell', { role: 'label' }]
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			]);
		});
	});

	describe('Spanning cells', () => {
		it('can serialize a 4x4 table with 1 column spanning cell', () => {
			const tableGridModel = createTable(4, 4, false, documentNode);
			const spanningCell = tableGridModel.getCellAtCoordinates(1, 1);
			spanningCell.size.columns = 2;

			tableGridModel.setCellAtCoordinates(spanningCell, 1, 1);
			tableGridModel.setCellAtCoordinates(spanningCell, 1, 2);

			chai.assert.isTrue(
				tableDefinition.applyToDom(tableGridModel, tableNode, blueprint, stubFormat)
			);

			blueprint.realize();
			indicesManager.getIndexSet().commitMerge();
			chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
				'table',
				{
					cols: '4',
					rows: '4'
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell', { cols: '2' }], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			]);
		});

		it('can serialize a 4x4 table with 1 row spanning cell', () => {
			const tableGridModel = createTable(4, 4, false, documentNode);
			const spanningCell = tableGridModel.getCellAtCoordinates(1, 1);
			spanningCell.size.rows = 2;

			tableGridModel.setCellAtCoordinates(spanningCell, 1, 1);
			tableGridModel.setCellAtCoordinates(spanningCell, 2, 1);

			const success = tableDefinition.applyToDom(
				tableGridModel,
				tableNode,
				blueprint,
				stubFormat
			);
			chai.assert.isTrue(success);

			blueprint.realize();
			indicesManager.getIndexSet().commitMerge();
			chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
				'table',
				{
					cols: '4',
					rows: '4'
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell', { rows: '2' }], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			]);
		});

		it('can serialize a 4x4 table with 1 column and row spanning cell', () => {
			const tableGridModel = createTable(4, 4, false, documentNode);

			const spanningCell = tableGridModel.getCellAtCoordinates(1, 1);
			spanningCell.size.columns = 2;
			spanningCell.size.rows = 2;

			tableGridModel.setCellAtCoordinates(spanningCell, 1, 1);
			tableGridModel.setCellAtCoordinates(spanningCell, 1, 2);
			tableGridModel.setCellAtCoordinates(spanningCell, 2, 1);
			tableGridModel.setCellAtCoordinates(spanningCell, 2, 2);

			const success = tableDefinition.applyToDom(
				tableGridModel,
				tableNode,
				blueprint,
				stubFormat
			);
			chai.assert.isTrue(success);

			blueprint.realize();
			indicesManager.getIndexSet().commitMerge();
			chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), [
				'table',
				{
					cols: '4',
					rows: '4'
				},
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell', { cols: '2', rows: '2' }], ['cell']],
				['row', ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			]);
		});
	});
});
