import type { Tagged } from "type-fest";

export type UserId = Tagged<number, "UserId">;

export type User = {
	last_name: string | null;
	image_url: string | null;
	first_name: string;
	email: string;
	id: UserId;
};
