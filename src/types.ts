import type { DefaultTextContainerConfiguration } from 'fontoxml-base-flow/src/types';

/**
 * @remarks
 * The options accepted by {@link configureAsTeiTableElements}. Please see
 * {@link TableElementsSharedOptions} for more information on the other
 * options accepted by this function.
 *
 * @fontosdk
 */
export type TableElementsTeiOptions = {
	/**
	 * @remarks
	 * Options for the table element.
	 *
	 * @fontosdk
	 */
	table?: {
		/**
		 * @remarks
		 * The namespace URI for this table.
		 *
		 * @fontosdk
		 */
		namespaceURI?: string | null;
	};
	/**
	 * @remarks
	 * Configuration options for the row element.
	 *
	 * @fontosdk
	 */
	row?: {
		/**
		 * @remarks
		 * Configuration options for an attribute to be set on a
		 * row element when it is a header row.
		 *
		 * @fontosdk
		 */
		headerAttribute?: {
			/**
			 * @remarks
			 * The attribute name.
			 *
			 * @fontosdk
			 */
			name?: string;
			/**
			 * @remarks
			 * The value to set.
			 *
			 * @fontosdk
			 */
			value?: string;
		};
		/**
		 * @remarks
		 * Configuration options for an attribute to be set on a
		 * row element when it is not a header row.
		 *
		 * @fontosdk
		 */
		regularAttribute?: {
			/**
			 * @remarks
			 * The attribute name.
			 *
			 * @fontosdk
			 */
			name?: string;
			/**
			 * @remarks
			 * The value to set.
			 *
			 * @fontosdk
			 */
			value?: string;
		};
	};
	/**
	 * @remarks
	 * Configuration options for the cell element.
	 *
	 * @fontosdk
	 */
	cell?: {
		/**
		 * @remarks
		 * The default text container for the cell element.
		 *
		 * @fontosdk
		 */
		defaultTextContainer?:
			| DefaultTextContainerConfiguration
			| string
			| null
			| undefined;
		/**
		 * @remarks
		 * Configuration options for an attribute to be set on a
		 * cell element when it is a header cell.
		 *
		 * @fontosdk
		 */
		headerAttribute?: {
			/**
			 * @remarks
			 * The attribute name.
			 *
			 * @fontosdk
			 */
			name?: string;
			/**
			 * @remarks
			 * The value to set.
			 *
			 * @fontosdk
			 */
			value?: string;
		};
		/**
		 * @remarks
		 * Configuration options for an attribute to be set on a
		 * cell element when it is not a header cell.
		 *
		 * @fontosdk
		 */
		regularAttribute?: {
			/**
			 * @remarks
			 * The attribute name.
			 *
			 * @fontosdk
			 */
			name?: string;
			/**
			 * @remarks
			 * The value to set.
			 *
			 * @fontosdk
			 */
			value?: string;
		};
	};
};
