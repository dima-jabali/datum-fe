import { generalCtx } from "#/contexts/general/ctx";
import { useGetUser } from "#/hooks/get/use-get-user";

export function HandleIfUserHasChanged({ children }: React.PropsWithChildren) {
	const prevUserId = generalCtx.use.userId();
	const user = useGetUser();

	const hasPrevUserId = !!prevUserId;

	if (hasPrevUserId && user.id !== prevUserId) {
		console.log("User has changed, resetting generalCtx", {
			prevUserId,
			user,
		});

		generalCtx.setState(generalCtx.getInitialState());
	} else if (!hasPrevUserId) {
		generalCtx.setState({ userId: user.id });
	}

	return children;
}
