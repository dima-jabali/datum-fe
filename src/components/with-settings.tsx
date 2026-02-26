import { useJustFetchSettings } from "#/hooks/get/use-get-settings";

export function WithSettings({ children }: React.PropsWithChildren) {
	useJustFetchSettings();

	return children;
}
