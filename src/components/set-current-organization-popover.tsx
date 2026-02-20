import { Check, ChevronDownIcon, Pencil, PlusIcon } from "lucide-react";
import { memo, useRef, useState } from "react";

import { generalCtx } from "#/contexts/general/ctx";
import {
	useGetAllOrganizations,
	userRoleInOrg,
	useUserRoleInCurrOrg,
} from "#/hooks/get/use-get-all-organizations";
import { useGetUser } from "#/hooks/get/use-get-user";
import {
	OrganizationMemberRole,
	type Organization,
} from "#/types/organization";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import { useWithCurrentOrg } from "#/hooks/use-current-organization";
import {
	NativeDialog,
	NativeDialogContent,
	NativeDialogFooter,
	NativeDialogHeader,
	NativeDialogTitle,
	NativeDialogTrigger,
} from "#/components/native-dialog";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import { ManageUsersModal } from "#/components/manage-users-modal/manage-users-modal";
import { CreateNewOrganizationModal } from "#/components/create-new-organization-modal";
import { useMutateOrganization } from "#/hooks/mutation/use-mutate-organization";

export const SetCurrentOrganizationPopover = memo(
	function SetCurrentOrganizationPopover() {
		const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
		const [isOpen, setIsOpen] = useState(false);

		const userRoleInCurrOrg = useUserRoleInCurrOrg();
		const currentOrganization = useWithCurrentOrg();
		const allOrgs = useGetAllOrganizations();
		const user = useGetUser();

		function handleSetCurrentOrganization(org: Organization) {
			if (currentOrganization.id === org.id) {
				setIsOpen(false);

				return;
			}

			generalCtx.setState({
				botConversationId: null,
				organizationId: org.id,
				notebookId: null,
			});

			setIsOpen(false);
		}

		const isUserAdminInCurrOrg =
			userRoleInCurrOrg === OrganizationMemberRole.Admin;

		return (
			<Popover onOpenChange={setIsOpen} open={isOpen}>
				<PopoverTrigger
					className="relative flex max-w-[180px] flex-nowrap items-center justify-between gap-2 truncate rounded-lg border border-border-smooth px-2 py-1 text-xs button-hover data-[state=open]:bg-button-hover data-[state=open]:text-primary group"
					onClick={() => setIsOpen((prev) => !prev)}
					title="Set current organization"
				>
					<span className="truncate whitespace-nowrap">
						{currentOrganization.name}
					</span>

					<ChevronDownIcon className="size-4 flex-none" />
				</PopoverTrigger>

				{isOpen ? (
					<PopoverContent
						className="flex flex-col gap-1 overflow-hidden max-h-[min(24rem,90dvh)] min-w-(--radix-popover-trigger-width) rounded-lg max-w-[min(36rem,95vw)]"
						onOpenAutoFocus={(e) => e.preventDefault()}
						collisionPadding={10}
						avoidCollisions
						sideOffset={5}
						align="start"
						side="bottom"
					>
						<ol className="flex w-full flex-col simple-scrollbar gap-1 text-sm fade-scroll">
							{allOrgs.map((org) => {
								const isUserAdminOnThisOrg =
									userRoleInOrg(org, user.id) === OrganizationMemberRole.Admin;
								const isActive = org.id === currentOrganization.id;

								return (
									<div
										className="flex w-full items-center gap-2 rounded-[5px] transition-none data-[is-active=true]:bg-button-hover hover:bg-button-hover"
										title={`${org.name} (${org.id})`}
										data-is-active={isActive}
										key={org.id}
									>
										<button
											ref={(ref) => scrollActiveItemIntoView(ref, isActive)}
											onClick={() => handleSetCurrentOrganization(org)}
											className="flex items-center gap-2 p-2 w-full"
										>
											<span className="truncate" title="Organization's name">
												{org.name}
											</span>

											<span
												className="text-xs text-muted"
												title="Organization's ID"
											>
												({org.id})
											</span>
										</button>

										<div className="flex items-center gap-0">
											{isUserAdminOnThisOrg ? (
												<MutateOrganizationDialog org={org} />
											) : null}

											{isActive ? (
												<div className="rounded-md h-8 aspect-square flex items-center justify-center">
													<Check className="size-5 stroke-1 text-primary flex-none" />
												</div>
											) : null}
										</div>
									</div>
								);
							})}

							{allOrgs.length === 0 ? (
								<div className="flex w-full h-10 items-center justify-center">
									No organizations found!
								</div>
							) : null}
						</ol>

						{isCreateOrgModalOpen ? (
							<CreateNewOrganizationModal setIsOpen={setIsCreateOrgModalOpen} />
						) : null}

						<div className="flex gap-1 border-t border-t-border-smooth pt-1 empty:hidden">
							{isUserAdminInCurrOrg ? (
								<>
									<ManageUsersModal key={currentOrganization.id} />

									<div className="border-border-smooth border-0 border-r [writing-mode:vertical-lr]"></div>
								</>
							) : null}

							{isUserAdminInCurrOrg ? (
								<button
									className="flex w-full gap-2 items-center justify-center rounded-[5px] p-2 button-hover text-xs"
									onPointerUp={() => setIsCreateOrgModalOpen(true)}
									title="Create new organization"
								>
									<PlusIcon className="size-5 stroke-primary stroke-1 flex-none" />

									<span className="@min-xs/html:whitespace-nowrap">
										Create new organization
									</span>
								</button>
							) : null}
						</div>
					</PopoverContent>
				) : null}
			</Popover>
		);
	},
);

function MutateOrganizationDialog({ org }: { org: Organization }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<NativeDialog isOpen={isOpen} onOpenChange={setIsOpen}>
			<NativeDialogTrigger
				className="button-hover rounded-md h-8 aspect-square flex items-center justify-center"
				title="Edit organization"
			>
				<Pencil className="size-4 stroke-1 flex-none" />
			</NativeDialogTrigger>

			{isOpen ? (
				<MutateOrganizationDialogContent setIsOpen={setIsOpen} org={org} />
			) : null}
		</NativeDialog>
	);
}

function MutateOrganizationDialogContent({
	org,
	setIsOpen,
}: {
	org: Organization;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const mutateOrganization = useMutateOrganization();

	const changesRef = useRef({ ...org });

	async function handleMutateOrganization() {
		try {
			await mutateOrganization.mutateAsync({
				body: {
					name: changesRef.current.name,
				},
				pathParams: {
					organizationId: org.id,
				},
			});

			setIsOpen(false);
		} catch {
			// do nothing
		}
	}

	return (
		<NativeDialogContent className="@min-xs/html:max-h-[90dvh] mobile:h-dvh mobile:max-h-dvh mobile:max-w-dvw mobile:w-dvw simple-scrollbar">
			<NativeDialogHeader className="mt-2">
				<NativeDialogTitle>
					Change organization&apos;s metadata
				</NativeDialogTitle>
			</NativeDialogHeader>

			<fieldset>
				<label className="font-semibold text-sm" htmlFor="name">
					Name
				</label>

				<Input
					onChange={(e) => (changesRef.current.name = e.target.value)}
					defaultValue={org.name}
				/>
			</fieldset>

			<fieldset>
				<label className="font-semibold text-sm" htmlFor="name">
					White label name
				</label>

				<Input
					onChange={(e) =>
						(changesRef.current.whitelabel_name = e.target.value)
					}
					defaultValue={org.whitelabel_name}
				/>
			</fieldset>

			<NativeDialogFooter>
				<Button
					isLoading={mutateOrganization.isPending}
					onClick={handleMutateOrganization}
				>
					Sav
					{mutateOrganization.isPending ? "ing…" : "e"}
				</Button>
			</NativeDialogFooter>
		</NativeDialogContent>
	);
}

function scrollActiveItemIntoView(
	ref: HTMLButtonElement | null,
	isActive: boolean,
) {
	if (ref && isActive) {
		ref.scrollIntoView({ behavior: "instant", block: "center" });
	}
}
