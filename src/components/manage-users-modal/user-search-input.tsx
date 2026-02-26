import { Search } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Input } from "#/components/ui/input";
import { useSearchUserByEmail } from "#/hooks/mutation/use-search-user-by-email";
import type { User } from "#/types/user";
import { LOADER } from "#/components/loader";

type SearchUsersProps = {
	memberToAdd: User | undefined;
	setMemberToAdd: React.Dispatch<React.SetStateAction<User | undefined>>;
	setEmailToInvite: React.Dispatch<React.SetStateAction<string | null>>;
};

const TIMEOUT_TO_SEARCH_USERS = 400;

export function UserSearchInput({
	memberToAdd,
	setEmailToInvite,
	setMemberToAdd,
}: SearchUsersProps) {
	const [searchUserResults, setSearchUserResults] = useState<User[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [searchString, setSearchString] = useState("");

	const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

	const searchForUserByEmail = useSearchUserByEmail().mutateAsync;

	useLayoutEffect(() => {
		const searchStringTrimmed = searchString.trim().toLocaleLowerCase();

		async function fetchSearchResults() {
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
		}

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
			<fieldset>
				<label className="text-sm text-primary">
					Type an email of a user to add to your organization:
				</label>

				<search className="relative h-10 flex items-center">
					<span className="absolute bottom-0 flex size-10 items-center justify-center">
						{isSearching ? (
							LOADER
						) : (
							<Search className="size-4 stroke-primary/50" />
						)}
					</span>

					<Input
						onChange={(e) =>
							setSearchString(e.target.value.toLocaleLowerCase())
						}
						placeholder="ex. hello@world.com"
						className="pl-10 h-10"
						value={searchString}
						type="email"
						required
					/>
				</search>
			</fieldset>

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
						const name = `${user.first_name} ${user.last_name}`;
						const email = user.email.toLowerCase();

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
										{user.first_name[0]}
										{user.last_name?.[0] ?? user.first_name[1]}
									</AvatarFallback>
								</Avatar>

								<div className="grid [grid-template-rows:1fr_1fr] grid-cols-1 place-items-star pr-2 items-start overflow-hidden">
									<span className="font-bold text-left h-full" title={name}>
										{name}
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
}
