import readOnlyBlueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import * as slimdom from 'slimdom';
import TeiTableDefinition from 'fontoxml-table-flow-tei/table-definition/TeiTableDefinition';

describe('TeiTableDefinition', () => {
	let documentNode;
	let tableDefinition;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		tableDefinition = new TeiTableDefinition({});
	});

	describe('TeiTableDefinition()', () => {
		it('can be initialized', () => {});
	});

	describe('isTable()', () => {
		it('can recognize a table element',
			() => chai.assert.isTrue(tableDefinition.isTable(documentNode.createElement('table'), readOnlyBlueprint)));
	});

	describe('isTableCell()', () => {
		it('can recognize a cell element',
			() => chai.assert.isTrue(tableDefinition.isTableCell(documentNode.createElement('cell'), readOnlyBlueprint)));
	});

	describe('isTablePart()', () => {
		it('can recognize a table part',
			() => chai.assert.isTrue(tableDefinition.isTablePart(documentNode.createElement('row'), readOnlyBlueprint)));
	});
});
