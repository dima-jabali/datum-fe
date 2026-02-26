import type { SerializedFilterGroup } from "./utilityTypes";

export function isSerializedFilterGroup(
	obj: Record<string, unknown>,
): obj is SerializedFilterGroup {
	return Boolean(
		(obj as SerializedFilterGroup).filterOperator &&
			(obj as SerializedFilterGroup).children,
	);
}

export function isUndefined(value: unknown): value is undefined {
	return value === undefined;
}
