import { useLayoutEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

import { useSearchUserByEmail } from "#/hooks/mutation/use-search-user-by-email";
import type { BetterbrainUser } from "#/types/notebook";
import { LOADER } from "../Button";
import { Input } from "../Input";
import { getUserNameOrEmail } from "../layout/projects-helper";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar";

type SearchUsersProps = {
	memberToAdd: BetterbrainUser | undefined;
	setMemberToAdd: React.Dispatch<
		React.SetStateAction<BetterbrainUser | undefined>
	>;
	setEmailToInvite: React.Dispatch<React.SetStateAction<string | null>>;
};

const TIMEOUT_TO_SEARCH_USERS = 400;

export const UserSearchInput: React.FC<SearchUsersProps> = ({
	memberToAdd,
	setEmailToInvite,
	setMemberToAdd,
}) => {
	const [searchUserResults, setSearchUserResults] = useState<BetterbrainUser[]>(
		[],
	);
	const [isSearching, setIsSearching] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [searchString, setSearchString] = useState("");

	const timeoutRef = useRef<NodeJS.Timeout>(undefined);

	const searchForUserByEmail = useSearchUserByEmail().mutateAsync;

	useLayoutEffect(() => {
		const searchStringTrimmed = searchString.trim().toLocaleLowerCase();

		const fetchSearchResults = async () => {
			try {
				setHasSearched(false);
				setIsSearching(true);

				const searchResponse = await searchForUserByEmail({
					email: searchStringTrimmed,
				});

				const results = searchResponse.results;

				if (results.length > 0) {
					setSearchUserResults(results);
					setMemberToAdd(results[0]);
					setEmailToInvite(null);
				} else {
					setEmailToInvite(searchStringTrimmed);
				}
			} catch (error) {
				console.error("Error searching user:", error);
			} finally {
				setIsSearching(false);
				setHasSearched(true);
			}
		};

		if (searchStringTrimmed) {
			timeoutRef.current = setTimeout(
				fetchSearchResults,
				TIMEOUT_TO_SEARCH_USERS,
			);
		}

		setSearchUserResults([]);
		setEmailToInvite(null);

		return () => {
			clearTimeout(timeoutRef.current);
			setIsSearching(false);
			setHasSearched(false);
		};
	}, [searchString, setMemberToAdd, setEmailToInvite, searchForUserByEmail]);

	const hasResults = hasSearched && searchUserResults.length > 0;

	return (
		<div className="flex flex-col gap-4">
			<label>
				<p className="text-sm text-primary">
					Type an email of a user of BetterBrain to add to your organization:
				</p>

				<section className="relative">
					<span className="absolute bottom-0 flex h-full w-8 items-center justify-center">
						{isSearching ? (
							LOADER
						) : (
							<Search className="size-4 stroke-slate-400" />
						)}
					</span>

					<Input
						onChange={(e) =>
							setSearchString(e.target.value.toLocaleLowerCase())
						}
						placeholder="ex. hello@world.com"
						className="mt-3 pl-8"
						value={searchString}
						type="email"
						required
					/>
				</section>
			</label>

			<ul
				className="max-h-40 overflow-y-auto data-[has-results=true]:min-h-[4rem]"
				data-has-results={hasResults}
			>
				{hasSearched && !hasResults ? (
					<p className="text-center text-sm tracking-wider p-4 border-2 border-border-smooth rounded-lg">
						No users found! If you&apos;d like, you can send them an email
						invite.
					</p>
				) : (
					searchUserResults.map((user) => {
						const nameOrEmail = getUserNameOrEmail(user);
						const email = user.email.toLocaleLowerCase();

						return (
							<button
								className="grid grid-rows-1 [grid-template-columns:3rem_1fr] w-full items-center justify-start gap-2 rounded-sm data-[is-seleted=true]:bg-link/20 onfocus:bg-link/20 overflow-hidden"
								data-is-seleted={user.id === memberToAdd?.id}
								onPointerUp={() => setMemberToAdd(user)}
								type="button"
								key={user.id}
							>
								<Avatar className="rounded-full size-12 flex-none aspect-square">
									<AvatarImage src={user?.image_url ?? undefined} />

									<AvatarFallback className="rounded-sm bg-primary font-bold text-black">
										{nameOrEmail.slice(0, 2)}
									</AvatarFallback>
								</Avatar>

								<div className="grid [grid-template-rows:1fr_1fr] grid-cols-1 place-items-star pr-2 items-start overflow-hidden">
									<span
										className="font-bold text-left h-full"
										title={nameOrEmail}
									>
										{nameOrEmail}
									</span>

									<span
										className="text-sm text-muted-foreground truncate text-left h-full"
										title={email}
									>
										{email}
									</span>
								</div>
							</button>
						);
					})
				)}
			</ul>
		</div>
	);
};
