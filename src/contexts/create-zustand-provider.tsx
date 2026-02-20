import { createContext, use, useState, type PropsWithChildren } from "react";
import { createStore, type StoreApi, type UseBoundStore } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { useStoreWithEqualityFn } from "zustand/traditional";

// Type gotten from lib itself:
export type StoreSubscribeWithSelector<T> = {
	subscribe: {
		(
			listener: (selectedState: T, previousSelectedState: T) => void,
		): () => void;
		<U>(
			selector: (state: T) => U,
			listener: (selectedState: U, previousSelectedState: U) => void,
			options?: {
				equalityFn?: (a: U, b: U) => boolean;
				fireImmediately?: boolean;
			},
		): () => void;
	};
};

export type ZustandContextStore<T> = Omit<StoreApi<T>, "subscribe"> &
	StoreSubscribeWithSelector<T> & {
		use: { [K in keyof T]: () => T[K] };
	};

export function createZustandProvider<
	InitialState extends Record<string, unknown>,
	ExtraInitialParams extends Record<string, unknown> = Partial<InitialState>,
>(
	initialState: (
		get: StoreApi<InitialState>["getState"],
		set: StoreApi<InitialState>["setState"],
		extraInitialParams?: ExtraInitialParams,
	) => InitialState,
	config: {
		runAfterCreation?: (store: ZustandContextStore<InitialState>) => void;
		shallowComparison?: boolean;
		name: string;
	},
) {
	const Context = createContext<ZustandContextStore<InitialState> | null>(null);

	function Provider({
		extraInitialParams,
		children,
	}: PropsWithChildren<{
		extraInitialParams?: ExtraInitialParams;
	}>) {
		const [store] = useState(() => {
			const storeBase = createStore(
				subscribeWithSelector<InitialState>(function (set, get) {
					return { ...initialState(get, set), ...extraInitialParams };
				}),
			);

			const store = createVanillaSelectors(storeBase, config.shallowComparison);

			config.runAfterCreation?.(store);

			return store;
		});

		return <Context.Provider value={store}>{children}</Context.Provider>;
	}

	function useStore() {
		const store = use(Context);

		if (!store) {
			throw new Error(
				`\`useStore\` must be used within a Provider (${config.name})`,
			);
		}

		return store;
	}

	return { Provider, useStore };
}

type WithReactSelectors<S> = S extends { getState: () => infer T }
	? S & { use: { [K in keyof T]: () => T[K] } }
	: never;

export function createReactSelectors<S extends UseBoundStore<StoreApi<object>>>(
	_store: S,
) {
	const store = _store as WithReactSelectors<typeof _store>;

	store.use = {};

	for (const k of Object.keys(store.getState())) {
		(store.use as any)[k] = function () {
			return store((s) => s[k as keyof typeof s]);
		};
	}

	return store;
}

type WithVanillaSelectors<S> = S extends { getState: () => infer T }
	? S & { use: { [K in keyof T]: () => T[K] } }
	: never;

export function createVanillaSelectors<S extends StoreApi<object>>(
	_store: S,
	shallowComparison = true,
) {
	const store = _store as WithVanillaSelectors<typeof _store>;

	store.use = {};

	for (const k of Object.keys(store.getState())) {
		(store.use as any)[k] = function () {
			return useStoreWithEqualityFn(
				_store,
				(s) => s[k as keyof typeof s],
				shallowComparison ? shallow : undefined,
			);
		};
	}

	return store;
}
