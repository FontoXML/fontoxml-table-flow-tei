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

	// Use createIconWidget to add an icon before each row. Any widget can be added but only icon widget is supported.
	rowBefore: [
		createIconWidget('dot-circle-o', {
			clickOperation: 'do-nothing'
		})
	],

    // This widgets are before columns. All widgets are supported. Column widgets are linked to the cell elements in the first row. If there is even one merged cell (to left or right) in the first row, the widgets in columnBefore widget area are not rendered. Optional, defaults to an empty array.
	columnBefore: [
		createIconWidget('clock-o', {
			clickOperation: 'lcTime-value-edit',
			tooltipContent: 'Click here to edit the duration'
		})
	],

	// To add insertion buttons which insert a column or a row at a specific place, default false.
	showInsertionWidget: true,

	// To add highlighting bars which highlight columns and rows, and provide operations popover, default false.
	showHighlightingWidget: true,

	// This XPath expression determines whether or not a table has the ability to be collapsed. Optional, defaults to 'false()'.
	// $rowCount and $columnCount helper variables can also optionally be used in the XPath expression to make it easier to configure
	// when the table should collapse i.e. '$rowCount > 5' which will allow tables with rows more than 5 to be able to be collapsed/uncollapsed
	isCollapsibleQuery: 'false()'

	// This XPath expression determines whether a table that has the ability to be collapsed should start off as collapsed on initial load. Optional, defaults to 'true()'.
	// $rowCount and $columnCount helper variables can also optionally be used in the XPath expression to make it easier to configure
	// when the table should start off as collapsed i.e. '$rowCount > 10' means that tables that have more than 10 rows will initially start off as collapsed
	// Note: This query is only evaluated on tables which have the ability to be collapsed using isCollapsibleQuery
	isInitiallyCollapsedQuery: 'true()'

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
