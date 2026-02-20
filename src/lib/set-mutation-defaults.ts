import type { QueryClient } from "@tanstack/react-query";

import { setMutationDefaults_markGoodBadResponse } from "#/hooks/mutation/use-mark-good-bad-response";
import { setMutationDefaults_patchNotebookBlocks } from "#/hooks/mutation/use-patch-notebook-blocks";

export function setMutationDefaults(queryClient: QueryClient) {
	setMutationDefaults_markGoodBadResponse(queryClient);

	setMutationDefaults_patchNotebookBlocks(queryClient);
}
