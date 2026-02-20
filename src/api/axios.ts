import axios, {
	isAxiosError,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";

import { isRecord } from "#/lib/utils";

const BACKEND_API = import.meta.env.VITE_BACKEND_API;

if (!BACKEND_API) {
	throw new Error("VITE_BACKEND_API is not defined");
}

export const clientAPI_V1 = axios.create({
	baseURL: `${BACKEND_API}/api/v1`,
});

export const clientBareAPI = axios.create({
	baseURL: BACKEND_API,
});

async function putAuthTokenOnHeader(config: InternalAxiosRequestConfig<any>) {
	try {
		const headerAuth = await getHeaderAuth();

		Object.assign(config.headers, headerAuth);
	} catch (error) {
		console.error("Error getting token on clientAPI interceptor!", error);
	}

	return config;
}
function putAuthTokenOnHeaderError(error: any) {
	return Promise.reject(error);
}

function showUserNotfications(res: AxiosResponse) {
	const hasUserNotifications = Boolean(
		res?.data &&
			isRecord(res.data) &&
			"user_notifications" in res.data &&
			Array.isArray(res.data.user_notifications) &&
			res.data.user_notifications.length > 0,
	);

	if (hasUserNotifications) {
		const notifications = res.data.user_notifications as string[];

		for (const notification of notifications) {
			toast(notification);
		}
	}
}

function showErrors(res: AxiosResponse) {
	const hasErrorsOnData = Boolean(
		res?.data && isRecord(res.data) && "error" in res.data && res.data.error,
	);

	if (hasErrorsOnData) {
		toast.error(res.data.error);
	}

	const hasErrorsOnActionOutput = Boolean(
		res?.data &&
			isRecord(res.data) &&
			"action_output" in res.data &&
			isRecord(res.data.action_output) &&
			"error" in res.data.action_output &&
			res.data.action_output.error,
	);

	if (hasErrorsOnActionOutput) {
		toast.error(res.data.action_output.error);
	}
}

function errorsAndNotificationsOnResponse(res: AxiosResponse) {
	showUserNotfications(res);
	showErrors(res);

	return res;
}

function handleNetworkErrors(error: unknown) {
	console.error("[handleNetworkErrors]", error);

	// Pass the error along so we can show it to the user.
	if (isAxiosError(error)) {
		{
			const { config, response } = error;

			if (config) {
				const url = config.url;
				const method = config.method?.toUpperCase();
				const headers = config.headers;

				// The body sent to the server is in config.data
				// Note: Axios usually stores this as a stringified JSON if it was an object
				let requestBody = config.data;
				try {
					if (typeof requestBody === "string") {
						requestBody = JSON.parse(requestBody);
					}
				} catch {
					// Fallback if it's not valid JSON (e.g. FormData or plain text)
				}

				console.group("--- API ERROR DEBUGGER ---");
				console.error(`Request: ${method} ${url}`);
				console.log("Request Body:", requestBody);
				console.log("Request Headers:", headers);

				if (response) {
					console.log("Response Status:", response.status);
					console.log("Response Data:", response.data);
				}
				console.groupEnd();
			}
		}

		if (error.response) {
			showUserNotfications(error.response);
		}

		const hasError =
			error.response?.data &&
			isRecord(error.response.data) &&
			"error" in error.response.data &&
			error.response.data.error;

		if (hasError && error.response?.data.error) {
			error.message = error.response.data.error;
		}
	}

	throw error;
}

export async function getHeaderAuth() {
	const headers: Record<string, string> = {};

	const token = await getAuthToken();

	headers.Authorization = `Bearer ${token}`;

	return headers;
}

export async function getAuthToken() {
	if (!window?.Clerk) {
		throw new Error("Clerk is not defined on window.");
	}

	const clerkToken = await window.Clerk.session?.getToken({
		template: "basicToken",
	});

	return clerkToken;
}

clientAPI_V1.interceptors.request.use(
	putAuthTokenOnHeader,
	putAuthTokenOnHeaderError,
);
clientAPI_V1.interceptors.response.use(
	errorsAndNotificationsOnResponse,
	handleNetworkErrors,
);
