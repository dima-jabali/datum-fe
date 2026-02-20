import { MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { log } from "#/lib/utils";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			experimental_prefetchInRender: true,
			staleTime: 60_000,
			gcTime: 120_000,
			retry: false,
			throwOnError(error, query) {
				log("Query error:", {
					queryKeys: query.queryKey,
					msg: error.message,
					query,
					error,
				});

				return true;
			},
		},

		mutations: {
			retry: false,
		},
	},

	mutationCache: new MutationCache({
		onSuccess(_data, _variables, _context, mutation) {
			const { successMessage, successTitle, skipToast } = mutation.meta ?? {};

			if (!skipToast && successMessage) {
				toast.success(successTitle, {
					description: successMessage,
				});
			}
		},

		async onMutate(_variables, mutation) {
			const { cancelQuery } = mutation.meta ?? {};

			if (cancelQuery) {
				await queryClient.cancelQueries(cancelQuery);
			}
		},

		onError(error, _variables, _context, mutation) {
			const { errorMessage, errorTitle, skipToast } = mutation.meta ?? {};

			if (!skipToast) {
				toast.error(errorTitle, {
					description: errorMessage ?? error.message,
				});
			}
		},

		async onSettled(_data, _error, _variables, _context, mutation) {
			if (mutation.meta?.invalidateQuery) {
				if (Array.isArray(mutation.meta.invalidateQuery)) {
					await Promise.allSettled(
						mutation.meta.invalidateQuery.map((queryKey) =>
							queryClient.invalidateQueries(queryKey),
						),
					);
				} else {
					await queryClient.invalidateQueries(mutation.meta.invalidateQuery);
				}
			}
		},
	}),
});
