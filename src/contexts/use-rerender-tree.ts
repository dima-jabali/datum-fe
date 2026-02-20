import { createZustandProvider } from "#/contexts/create-zustand-provider";
import { createUUID } from "#/lib/utils";

type RerenderTreeStore = {
	rerenderTree: () => void;
	key: string;
};

export const {
	Provider: RerenderTreeProvider,
	useStore: useRerenderTreeStore,
} = createZustandProvider<RerenderTreeStore>(
	(_get, set) => ({
		rerenderTree: () => set({ key: createUUID() }),
		key: "",
	}),
	{ name: "RerenderTreeProvider" },
);
