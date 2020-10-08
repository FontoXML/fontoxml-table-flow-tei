---
category: add-on/fontoxml-table-flow-tei
---

# TEI table support

Provide support for TEI compatible tables.

This packages exposes a single configureAsTeiTableElements function for configuring CALS table elements.

Use the configureAsTeiTableElements like this:

```
configureAsTeiTableElements(sxModule, {
	// Priority of the selectors used to select the table elements (optional)
	priority: 2,
	// The namespace uri for the table element and its descendant elements (optional)
	table: {
		namespaceURI: 'http://some-uri.com'
	}

	row: {
		// An attribute to set when a given row is a header row (optional)
		headerAttribute: {
			name: 'role',
			value: 'label'
		},
		// An attribute to set when a given row is not a header row (optional)
		normalAttribute: {
			name: 'role',
			value: 'data'
		}
	}

	cell: {
		// An attribute to set when a given cell is a header cell (optional)
		headerAttribute: {
			name: 'role',
			value: 'label'
		},
		// An attribute to set when a given cell is not a header cell (optional)
		normalAttribute: {
			name: 'role',
			value: 'data'
		}
	},

	// Use createIconWidget to add column icons before rows. Any widget can be added but only icon widget is supported.
	rowBefore: [
		createIconWidget('dot-circle-o', {
			clickOperation: 'do-nothing'
		})
	],

	// To add insertion buttons which insert a column or a row at a specific place, default false.
	showInsertionWidget: true,

	// To add highlighting bars which highlight columns and rows, and provide operations popover, default false.
	showHighlightingWidget: true,

	// In TEI table, there are some operations in the column/row widget menus as default. But they can be overridden.
 	columnWidgetMenuOperations: [{ name: 'column-delete-at-index' }],
 	rowWidgetMenuOperations:[
 		{ contents: [{ name: 'contextual-row-delete' }]	}
 	]
});
```

To configure the markup labels and contextual operations, use the {@link configureProperties} function.

The cell element menu button widgets are added based on the existence of contextual operations on cell level. Make sure that only cell-specific operations are added to the cell widget, so that users are only given options relevant to them.
Example on how you can add this element menu on the widget:

```
configureProperties(sxModule, 'self::cell', {
	contextualOperations: [
		{ name: 'contextual-set-total-cell', hideIn: ['context-menu'] }
	]
});
```
