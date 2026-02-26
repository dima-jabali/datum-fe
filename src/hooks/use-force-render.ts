import { useReducer } from "react";

export function useForceRender() {
	const [, forceRender] = useReducer((prev: boolean) => !prev, true);

	return forceRender;
}
