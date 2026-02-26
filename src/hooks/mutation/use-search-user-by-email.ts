import { useMutation } from "@tanstack/react-query";

import type { User } from "#/types/user";
import { queryKeyFactory } from "#/hooks/query-key-factory";
import { clientAPI_V1 } from "#/api/axios";

type SearchForUserByEmailRequest = {
	email: string;
};
type SearchForUserByEmailResponse = {
	result_count: number;
	results: User[];
};

const mutationKey = queryKeyFactory.get["search-user-by-email"].queryKey;

export function useSearchUserByEmail() {
	return useMutation({
		mutationKey,

		async mutationFn(arg: SearchForUserByEmailRequest) {
			const path = `/users?user_email=${encodeURIComponent(arg.email.toLocaleLowerCase())}`;

			return (await clientAPI_V1.get<SearchForUserByEmailResponse>(path)).data;
		},
	});
}
