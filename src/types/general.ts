import type { Tagged } from "type-fest";

import type { BotConversationId } from "#/types/notebook";

export type StreamUuid = `BOT_CONVERSATION_${BotConversationId}`;
export type ISODateString = Tagged<string, "ISODateString">;
export type PageOffset = Tagged<number, "PageOffset">;
export type PageLimit = Tagged<number, "PageLimit">;
export type AwsBucket = Tagged<string, "AwsBucket">;
export type AwsKey = Tagged<string, "AwsKey">;
export type UUID = Tagged<string, "UUID">;

export type Nullable<T> = { [P in keyof T]: T[P] | null };
