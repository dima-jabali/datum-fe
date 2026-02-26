import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "react-error-boundary";
import { prettifyError, z } from "zod/mini";

import {
	NativeDialog,
	NativeDialogContent,
	NativeDialogDescription,
	NativeDialogHeader,
	NativeDialogTitle,
} from "#/components/native-dialog";
import { useCreateNotebook } from "#/hooks/mutation/use-create-notebook";
import { useCreateOrganization } from "#/hooks/mutation/use-create-org";
import { useGetUser } from "#/hooks/get/use-get-user";
import { createNotebookUuid } from "#/lib/utils";
import { generalCtx } from "#/contexts/general/ctx";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";

type Props = {
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const ORGANIZATION_CREATION_VALUES = z.object({
	name: z.string().check(
		z.trim(),
		z.minLength(1, { message: "Organization name is required!" }),
		z.maxLength(128, {
			message: "Organization name is too long!",
		}),
	),
});

export function CreateNewOrganizationModal({ setIsOpen }: Props) {
	const [isCreating, setIsCreating] = useState(false);

	const formRef = useRef<HTMLFormElement>(null);
	const shouldCreateProjectRef = useRef(true);
	const reactId = useId();

	const createOrganization = useCreateOrganization();
	const createNotebook = useCreateNotebook();
	const user = useGetUser();

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.metaKey && e.shiftKey) {
				shouldCreateProjectRef.current = false;
			}
		}

		function handleKeyUp(e: KeyboardEvent) {
			if (e.metaKey && e.shiftKey) {
				shouldCreateProjectRef.current = true;
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, []);

	async function handleCreateOrganization(
		e: React.SubmitEvent<HTMLFormElement>,
	) {
		e.preventDefault();

		if (isCreating || !formRef.current || !user) return;

		const shouldCreateOrgWithProject = shouldCreateProjectRef.current;

		try {
			setIsCreating(true);

			const formData = new FormData(formRef.current);

			const data: Record<string, string> = {};

			for (const [key, value] of formData) {
				// @ts-expect-error => It's fine, we're not sending any files.
				data[key] = value;
			}

			const result = ORGANIZATION_CREATION_VALUES.safeParse(data);

			if (result.error) {
				throw new Error(prettifyError(result.error));
			}

			const newOrganization = await createOrganization.mutateAsync({
				name: result.data.name,
			});

			if (!newOrganization) {
				throw new Error("Failed to create organization!");
			}

			console.log({ shouldCreateOrgWithProject });

			if (shouldCreateOrgWithProject) {
				// Create a new project so the user already has a chat:
				const projectMetadata = await createNotebook.mutateAsync({
					metadata: {
						uuid: createNotebookUuid(),
						title: "New Chat",
					},
					organizationId: newOrganization.id,
					blocks: [],
				});

				if (!projectMetadata) {
					throw new Error("Failed to create project!");
				}

				generalCtx.setState({
					botConversationId:
						projectMetadata.metadata.bot_conversation?.id ?? null,
					notebookId: projectMetadata.metadata.id,
					organizationId: newOrganization.id,
				});
			} else {
				generalCtx.setState({
					organizationId: newOrganization.id,
					botConversationId: null,
					notebookId: null,
				});
			}

			setIsOpen(false);

			toast.success("New organization created successfully");
		} catch (error) {
			console.error(error);

			toast.error("Project creation error", {
				description: getErrorMessage(error),
			});
		} finally {
			setIsCreating(false);
		}
	}

	return (
		<NativeDialog onOpenChange={setIsOpen} isOpen>
			<NativeDialogContent className="w-sm justify-start">
				<NativeDialogHeader>
					<NativeDialogTitle className="mb-5 text-xl font-bold">
						Create organization
					</NativeDialogTitle>

					<NativeDialogDescription></NativeDialogDescription>
				</NativeDialogHeader>

				<form
					onSubmit={handleCreateOrganization}
					className="flex flex-col gap-8"
					ref={formRef}
				>
					<fieldset>
						<label className="pl-3 text-sm" htmlFor={reactId}>
							Organization name:
						</label>

						<Input name="name" placeholder="My org" id={reactId} autoFocus />
					</fieldset>

					<div className="flex w-full justify-center">
						<Button
							title="Create organization"
							isLoading={isCreating}
							type="submit"
						>
							Creat{isCreating ? "ing…" : "e"}
						</Button>
					</div>
				</form>
			</NativeDialogContent>
		</NativeDialog>
	);
}
