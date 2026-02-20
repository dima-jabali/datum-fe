import { PanelLeft } from "lucide-react";

import { generalCtx } from "#/contexts/general/ctx";
import { EmptyFallbackSuspense } from "#/components/empty-fallback-suspense";
import { WithOrganizationIdAndList } from "#/components/with-organization-id-and-list";
import { NotebookListWrapper } from "#/components/notebook-list-wrapper";
import { SetCurrentOrganizationPopover } from "#/components/set-current-organization-popover";

function handleToggleSidebarOpen() {
	generalCtx.setState((prev) => ({
		isSidebarOpen: !prev.isSidebarOpen,
	}));
}

export function Aside() {
	const isSidebarOpen = generalCtx.use.isSidebarOpen();
	const orgId = generalCtx.use.organizationId();

	return (
		<aside
			className="@container/aside bg-sidebar h-dvh max-h-dvh max-w-dvw w-(--closed-aside-width) data-[is-open=true]:w-(--open-aside-width) [grid-area:aside] overflow-hidden flex items-center flex-col gap-4 border-r border-border group/aside"
			data-is-open={isSidebarOpen}
			data-no-print
		>
			<div className="flex items-center justify-between flex-none h-(--main-header-height) overflow-hidden gap-4 px-1">
				<button
					className="flex items-center justify-center button-hover rounded-lg w-12 p-2 mobile:p-1 flex-none mobile:visible"
					onClick={handleToggleSidebarOpen}
					title="Keep menu opened"
				>
					<PanelLeft className="size-5 stroke-1 text-muted-foreground" />
				</button>

				<div className="aside-closed:hidden">
					<EmptyFallbackSuspense key={orgId}>
						<WithOrganizationIdAndList>
							<SetCurrentOrganizationPopover />
						</WithOrganizationIdAndList>
					</EmptyFallbackSuspense>
				</div>
			</div>

			<EmptyFallbackSuspense key={orgId}>
				<WithOrganizationIdAndList>
					<NotebookListWrapper />
				</WithOrganizationIdAndList>
			</EmptyFallbackSuspense>

			<ul className="flex flex-wrap gap-2 w-(--closed-aside-width) not-aside-closed:w-(--open-aside-width)">
				<div className="w-(--closed-aside-width) h-9 flex items-center justify-center flex-none">
					{/* <UserButton /> */}
				</div>
			</ul>
		</aside>
	);
}
