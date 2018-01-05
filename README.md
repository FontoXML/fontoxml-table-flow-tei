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
	priority: 2
});
```

To configure the markup labels and contextual operations, use the {@link configureProperties} function.
