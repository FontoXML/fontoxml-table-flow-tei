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
	}
});
```

To configure the markup labels and contextual operations, use the {@link configureProperties} function.
