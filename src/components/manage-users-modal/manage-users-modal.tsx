import { Check, ChevronDownIcon, Loader, UserPlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
	NativePopover,
	NativePopoverContent,
	NativePopoverTrigger,
} from "#/components/native-popover";
import type { User } from "#/types/user";
import { useWithCurrentOrg } from "#/hooks/use-current-organization";
import { isMobile, noop, stopPropagation } from "#/lib/utils";
import { ORGANIZATION_MEMBER_ROLES, type OrganizationMemberRole, type OrgMemberWithRole } from "#/types/organization";
import { Button } from "#/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogTitle, DialogTrigger } from "#/components/ui/dialog";
import { UserSearchInput } from "#/components/manage-users-modal/user-search-input";
import { Input } from "#/components/ui/input";
import { useGetOrganizationUsersPage } from "#/hooks/get/use-get-org-users-page";
import { useRemoveUserFromOrganizationMutation } from "#/hooks/mutation/use-remove-user-from-org";
import { useInviteUserToOrganizationMutation } from "#/hooks/mutation/use-invite-user-to-org";
import { useUpdateOrgMember } from "#/hooks/mutation/use-update-org-member";

type Email = string;

enum Loading {
	SENDING_INVITE,
	REMOVING,
	ADDING,
	NONE,
}

export function ManageUsersModal() {
	const [emailToInvite, setEmailToInvite] = useState<Email | null>(null);
	const [shouldFetchOrgUsers, setShouldFetchOrgUsers] = useState(false);
	const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
	const [memberToRemove, setMemberToRemove] = useState<User>();
	const [memberToAdd, setMemberToAdd] = useState<User>();
	const [loading, setLoading] = useState(Loading.NONE);
	const [fullName, setFullName] = useState("");
	const [isOpen, setIsOpen] = useState(false);

	const fetchOrgUsersPageQuery =
		useGetOrganizationUsersPage(shouldFetchOrgUsers);
	const removeUserFromOrganizationMutation =
		useRemoveUserFromOrganizationMutation();
	const inviteUserToOrganizationMutation =
		useInviteUserToOrganizationMutation();
	const currentOrganization = useWithCurrentOrg();
	const updateOrgMember = useUpdateOrgMember();

	const isSendingInvite = loading === Loading.SENDING_INVITE;
	const isRemoving = loading === Loading.REMOVING;
	const isAdding = loading === Loading.ADDING;
	const isLoading = loading !== Loading.NONE;
	const orgId = currentOrganization?.id;

	const hasMoreUsersToLoad =
		currentOrganization &&
		currentOrganization.members.total >
			currentOrganization.members.users.length;

	async function handleRemoveMemberFromOrg() {
		if (isLoading) return;

		if (!orgId) {
			toast.error("Invalid organization");

			return;
		}
		if (!memberToRemove) {
			toast.error("Select a member to remove");

			return;
		}

		try {
			setLoading(Loading.REMOVING);

			await removeUserFromOrganizationMutation.mutateAsync({
				userId: `${memberToRemove.id}`,
				orgId: `${orgId}`,
			});

			setMemberToRemove(undefined);

			toast.success("Removal successfull");
		} catch (error) {
			console.error("Error at handleRemoveMemberFromOrg:", error);

			toast.error("Removal unsuccessfull");
		} finally {
			setLoading(Loading.NONE);
		}
	}

	async function handleAddMemberToOrg() {
		if (isLoading) return;

		if (!memberToAdd) {
			toast.error("Select a member to add");

			return;
		}

		try {
			setLoading(Loading.ADDING);

			await updateOrgMember.mutateAsync({
				userId: memberToAdd.id,
				orgId: orgId,
			});

			setMemberToAdd(undefined);
			setIsAddMemberOpen(false);
		} catch (error) {
			console.error(error);

			toast.error("Could not add member to organization");
		} finally {
			setLoading(Loading.NONE);
		}
	}

	async function handleSendInvite() {
		if (isLoading || !emailToInvite) return;

		if (!orgId) {
			toast.error("Invalid organization");

			return;
		}

		const fullNameTrimmed = fullName.trim();

		if (!fullNameTrimmed) {
			toast.error("Full name should not be empty");

			return;
		}

		const [firstName, ...restOfName] = fullNameTrimmed.trim().split(" ");
		const lastName = restOfName.join(" ");

		try {
			setLoading(Loading.SENDING_INVITE);

			await inviteUserToOrganizationMutation.mutateAsync({
				email: emailToInvite.toLocaleLowerCase(),
				first_name: firstName ?? "",
				last_name: lastName,
				orgId,
			});

			setIsAddMemberOpen(false);
			setFullName("");
		} catch (error) {
			console.error(error);

			toast.error("Could not add member to organization");
		} finally {
			setLoading(Loading.NONE);
		}
	}

	function handleLoadMoreUsers() {
		if (shouldFetchOrgUsers) {
			fetchOrgUsersPageQuery.fetchNextPage().catch(noop);
		} else {
			setShouldFetchOrgUsers(true);
		}
	}

	function handleChangeUserRole(
		newRole: OrganizationMemberRole,
		user: OrgMemberWithRole,
	) {
		updateOrgMember.mutate({
			orgId: currentOrganization.id,
			userId: user.id,
			role: newRole,
		});
	}

	const orgOwnerId = currentOrganization?.owner?.id;
	function mapToUserButton(user: OrgMemberWithRole) {
		const email = user.email.toLowerCase();
		const isOwner = user.id === orgOwnerId;
		const userRole = user.role;

		return (
			<div
				className="member-lg-grid mobile:member-xs-grid w-full max-w-full items-center justify-start gap-2 pr-2 mobile:pr-0 rounded-sm"
				key={user.id}
			>
				<Avatar className="rounded-full size-12 flex-none aspect-square member-avatar">
					<AvatarImage src={user.image_url ?? undefined} />

					<AvatarFallback className="rounded-full bg-primary font-bold text-secondary">
						{email.slice(0, 2)}
					</AvatarFallback>
				</Avatar>

				<div className="grid [grid-template-rows:1fr_1fr] grid-cols-1 place-content-center overflow-hidden member-name">
					<span
						className="font-semibold text-left h-full truncate"
						title={email}
					>
						{email}
					</span>

					<span
						className="text-sm text-muted-foreground truncate text-left h-full"
						title={email}
					>
						{email}
					</span>
				</div>

				<div className="member-actions">
					<NativePopover>
						<NativePopoverTrigger
							className="flex items-center justify-center rounded-lg w-full gap-2 text-xs bg-badge-orange text-badge-orange-foreground capitalize py-0.5 px-2 button-hover shadow-xs shadow-black/20 border border-border-smooth/50"
							title="Change user type"
						>
							{userRole.toLowerCase()}

							<ChevronDownIcon className="size-4 flex-none text-badge-orange-foreground" />
						</NativePopoverTrigger>

						<NativePopoverContent className="data-[is-open=true]:grid grid-rows-2 grid-cols-[auto_16px] text-xs">
							{ORGANIZATION_MEMBER_ROLES.map(function (role) {
								const isActive = role === userRole;

								return (
									<button
										className="flex items-center justify-between gap-2 py-1 px-2 capitalize button-hover rounded-md"
										onClick={() => handleChangeUserRole(role, user)}
										data-is-active={isActive}
										type="button"
										key={role}
									>
										{role.toLowerCase()}

										{isActive ? (
											<Check className="size-4 stroke-1 stroke-primary" />
										) : null}
									</button>
								);
							})}
						</NativePopoverContent>
					</NativePopover>

					{isOwner ? (
						<span className="h-8 px-2 flex items-center justify-center text-sm text-link text-right">
							Owner
						</span>
					) : (
						<Button
							className="text-sm hover:underline h-8 px-2"
							onPointerUp={() => setMemberToRemove(user)}
							variant="destructive"
							type="button"
						>
							Remove
						</Button>
					)}
				</div>
			</div>
		);
	}

	return (
		<>
			<Dialog onOpenChange={setIsOpen} open={isOpen}>
				<DialogOverlay onClick={stopPropagation} />

				<DialogTrigger className="flex w-full gap-2 items-center justify-center rounded-[5px] p-2 button-hover text-xs">
					<UserPlusIcon className="size-4 stroke-1 flex-none" />

					<span>Manage users</span>
				</DialogTrigger>

				{isOpen ? (
					<DialogContent
						className="flex h-[80dvh] max-w-3xl flex-col gap-6"
						onPointerDownOutside={(e) => {
							// On mobile, when a Select is open, clicking outside the Select closes everything.
							// This prevents it.

							if (isMobile()) {
								e.preventDefault();
							}
						}}
					>
						<DialogHeader className="flex flex-col gap-6 mobile:gap-2">
							<DialogTitle className="w-[80%] tracking-wider text-left mobile:text-lg font-bold">
								Manage users of&nbsp;
								<i className="font-light">#{currentOrganization?.name}</i>
							</DialogTitle>

							<DialogDescription asChild>
								<div className="flex items-center justify-between gap-4">
									<p className="mobile:text-left text-xs">
										Make changes to your organization&apos;s members here.
									</p>

									{updateOrgMember.isPending ? <Loader /> : null}
								</div>
							</DialogDescription>
						</DialogHeader>

						<div className="flex flex-col gap-6 max-h-full overflow-hidden">
							<h6 className="font-semibold text-sm">
								{currentOrganization?.members?.total || 0}
								&nbsp;Members
							</h6>

							<Dialog onOpenChange={setIsAddMemberOpen} open={isAddMemberOpen}>
								<DialogOverlay onClick={stopPropagation} />

								<DialogTrigger asChild>
									<button
										className="grid grid-rows-1 [grid-template-columns:3rem_1fr] w-full items-center justify-start gap-2 rounded-sm hover:bg-link/15 active:bg-link/25"
										type="button"
									>
										<div className="relative size-12 overflow-hidden rounded-full dark:bg-gray-500">
											<svg
												className="absolute size-14 -left-1 text-primary"
												xmlns="http://www.w3.org/2000/svg"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
													fillRule="evenodd"
													clipRule="evenodd"
												></path>
											</svg>
										</div>

										<span className="font-semibold text-left">Add member</span>
									</button>
								</DialogTrigger>

								<hr className="w-full border-slate-400" />

								<DialogContent className="max-w-xl h-[60dvh] mobile:h-dvh mobile:w-dvw flex flex-col justify-between simple-scrollbar">
									<div className="flex flex-col gap-6">
										<DialogHeader>
											<DialogTitle className="text-xl font-bold text-left">
												Add a member to&nbsp;
												<span className="font-light">
													#{currentOrganization?.name}
												</span>
											</DialogTitle>

											<DialogDescription className="size-0"></DialogDescription>
										</DialogHeader>

										<UserSearchInput
											setEmailToInvite={setEmailToInvite}
											setMemberToAdd={setMemberToAdd}
											memberToAdd={memberToAdd}
										/>

										{emailToInvite ? (
											<label className="flex flex-col gap-2">
												<span className="text-sm text-primary">
													Type the user&apos;s full name in order to invite
													them:
												</span>

												<Input
													onChange={(e) => setFullName(e.target.value)}
													placeholder="New member's full name"
													value={fullName}
													required
													min={1}
												/>
											</label>
										) : null}
									</div>

									<DialogFooter>
										{emailToInvite ? (
											<Button
												onPointerUp={handleSendInvite}
												isLoading={isSendingInvite}
												disabled={isLoading}
											>
												Send{isSendingInvite ? "ing" : ""} invite by email
												{isSendingInvite ? "…" : ""}
											</Button>
										) : (
											<Button
												disabled={
													Boolean(emailToInvite) || !memberToAdd || isLoading
												}
												onPointerUp={handleAddMemberToOrg}
												isLoading={isAdding}
											>
												Add{isAdding ? "ing…" : ""}
											</Button>
										)}
									</DialogFooter>
								</DialogContent>
							</Dialog>

							<ul className="flex flex-col gap-6 max-h-full simple-scrollbar">
								{currentOrganization?.members?.users.map(mapToUserButton)}

								<div className="w-full flex items-center justify-center mt-3.5">
									<button
										className="disabled:opacity-50 p-2 text-xs not-disabled:link not-disabled:hover:underline flex gap-2 items-center disabled:pointer-events-none"
										disabled={!hasMoreUsersToLoad}
										onClick={handleLoadMoreUsers}
									>
										{fetchOrgUsersPageQuery.fetchStatus === "fetching" ? (
											<>
												<Loader />

												<span>Loading more users…</span>
											</>
										) : hasMoreUsersToLoad ? (
											"Load more users"
										) : (
											"No more users to load"
										)}
									</button>
								</div>
							</ul>

							<div className="size-1 flex-none"></div>
						</div>

						{memberToRemove ? (
							<Dialog
								onOpenChange={(newIsOpen) =>
									!newIsOpen && setMemberToRemove(undefined)
								}
								open
							>
								<DialogOverlay onClick={stopPropagation} />

								<DialogContent className="gap-10">
									<DialogHeader className="gap-10">
										<DialogTitle>Confirm removal from organization</DialogTitle>

										<DialogDescription className="">
											Are you sure you want to remove{" "}
											<span className="font-bold underline">
												{(memberToRemove.email)}
											</span>{" "}
											from&nbsp;
											<span className="inline font-light italic">
												{currentOrganization?.name}{" "}
											</span>
											?
										</DialogDescription>
									</DialogHeader>

									<Button
										onPointerUp={handleRemoveMemberFromOrg}
										aria-disabled={isLoading}
										isLoading={isRemoving}
										variant="destructive"
										type="submit"
									>
										Remov{isAdding ? "ing…" : "e"}
									</Button>
								</DialogContent>
							</Dialog>
						) : null}
					</DialogContent>
				) : null}
			</Dialog>
		</>
	);
}
