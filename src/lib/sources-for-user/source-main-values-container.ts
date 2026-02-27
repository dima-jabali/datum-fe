import type { SourceForUserType, SourceID } from "#/types/chat";
import { functionThatReturnsNull } from "#/lib/utils";
import type { NormalizedSource } from "#/lib/sources-for-user/normalize-sources";

type ExtractedSource<
	S extends SourceForUserType,
	V extends NormalizedSource["values_type"],
> = Extract<NormalizedSource, { source_type: S; values_type: V }>;

type SourceMainValues<
	SourceType extends SourceForUserType,
	ValuesType extends NormalizedSource["values_type"],
> = {
	normalizedSource: ExtractedSource<SourceType, ValuesType>;
	descriptionJSX: React.ReactNode;
	titleJSX: React.ReactNode;
	descriptionString: string;
	titleString: string;
	relevance: number;
	id: SourceID;
};

/**
 * This locks the Hidden Class (Shape) for every instance.
 */
export class SourceMainValuesContainer<
	SourceType extends SourceForUserType,
	ValuesType extends NormalizedSource["values_type"],
> implements SourceMainValues<SourceType, ValuesType>
{
	// Backing fields for lazy calculation
	private _descriptionJSX: React.ReactNode | undefined = undefined;
	private _titleJSX: React.ReactNode | undefined = undefined;

	constructor(
		public readonly id: SourceID,
		public readonly relevance: number,
		public readonly titleString: string,
		public readonly descriptionString: string,
		public readonly normalizedSource: ExtractedSource<SourceType, ValuesType>,
		public readonly _titleResolver: () => React.ReactNode,
		public readonly _descriptionResolver: () => React.ReactNode = functionThatReturnsNull,
	) {
		// By using 'public' in the constructor, V8 initializes the shape
		// in the order of the arguments.
	}

	/**
	 * Instead of re-defining the property, we use a getter that
	 * performs a simple assignment. This does NOT change the Hidden Class.
	 */
	get titleJSX(): React.ReactNode {
		if (this._titleJSX === undefined) {
			this._titleJSX = this._titleResolver();
		}

		return this._titleJSX;
	}

	get descriptionJSX(): React.ReactNode {
		if (this._descriptionJSX === undefined) {
			this._descriptionJSX = this._descriptionResolver();
		}

		return this._descriptionJSX;
	}
}
