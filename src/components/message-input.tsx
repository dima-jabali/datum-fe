import { uniqBy } from "es-toolkit";
import {
	Check,
	FilePlus,
	Send,
	SlidersVertical,
	StopCircle,
	X,
} from "lucide-react";
import { useRef, useState } from "react";
import { titleCase } from "scule";
import { toast } from "sonner";

import {
	NativePopover,
	NativePopoverContent,
	NativePopoverTrigger,
} from "#/components/native-popover";
import {
	generalCtx,
	ToolSelectionType,
	useUserChatTools,
	useWithBotConversationId,
} from "#/contexts/general/ctx";
import { useWebsocketStore } from "#/contexts/websocket/context";
import {
	sendWebSocketMessage,
	type ExtraDataForEachMessage,
} from "#/contexts/websocket/websocket-state-machine";
import { useIsStreaming } from "#/hooks/get/use-get-bot-conversation";
import {
	MessageType,
	useAddBotConversationMessage,
} from "#/hooks/mutation/use-add-bot-conversation-message";
import { useIsCreatingNotebook } from "#/hooks/mutation/use-is-creating-notebook";
import { useSendChatFiles } from "#/hooks/mutation/use-send-chat-files";
import { useWithCurrentOrg } from "#/hooks/use-current-organization";
import { matchIcon } from "#/icons/match-icon";
import {
	createBotConversationMessageUuid,
	createRequestId,
	OPTIMISTIC_NEW_NOTEBOOK_ID,
} from "#/lib/utils";
import type { BotConversationId, ChatTools } from "#/types/notebook";
import {
	WebsocketAction,
	type WebSocketStopGenerationPayload,
} from "#/types/websocket";
import { LOADER } from "#/components/loader";

export function MessageInput() {
	const [files, setFiles] = useState<File[]>([]);

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const addBotConversationMessage = useAddBotConversationMessage();
	const toolSelectionType = generalCtx.use.toolSelectionType();
	const botConversationId = useWithBotConversationId();
	const scrollContainer = generalCtx.use.chatListRef();
	const isCreatingNotebook = useIsCreatingNotebook();
	const currentOrganization = useWithCurrentOrg();
	const websocketStore = useWebsocketStore();
	const sendChatFiles = useSendChatFiles();
	const toolsToUse = useUserChatTools();
	const isStreaming = useIsStreaming();

	const isSendingMsg =
		addBotConversationMessage.isPending || sendChatFiles.isPending;

	const isDefaultToolsSelected =
		currentOrganization.default_chat_tools && toolsToUse
			? currentOrganization.default_chat_tools.length === toolsToUse.length &&
				toolsToUse.every((tool) =>
					currentOrganization.default_chat_tools?.includes(tool),
				)
			: false;

	function handleOnChangeFiles(e: React.ChangeEvent<HTMLInputElement>) {
		if (e.target.files) {
			const files = Array.from(e.target.files);

			for (const file of e.target.files) {
				if (file.type.startsWith("image/")) {
					Reflect.set(file, "previewUrl", URL.createObjectURL(file));
				}
			}

			setFiles((prev) => uniqBy([...prev, ...files], (file) => file.name));
		}
	}

	function removeAllFiles() {
		setFiles((prev) => {
			for (const file of prev) {
				const previewUrl = Reflect.get(file, "previewUrl");

				if (previewUrl) {
					URL.revokeObjectURL(previewUrl);
				}
			}

			return [];
		});

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}

	function scrollToBottom() {
		if (scrollContainer) {
			requestAnimationFrame(() => {
				if (scrollContainer) {
					Reflect.set(
						scrollContainer,
						"scrollTop",
						scrollContainer.scrollHeight,
					);
				}
			});
		}
	}

	function handleStopStreaming() {
		const request_id = createRequestId();
		const messagePayload: WebSocketStopGenerationPayload &
			ExtraDataForEachMessage = {
			message_payload: { stream_uuid: `BOT_CONVERSATION_${botConversationId}` },
			message_type: WebsocketAction.StopStreamingGeneration,
			request_id,
		};

		sendWebSocketMessage(
			websocketStore.actorRef.getSnapshot().context,
			messagePayload,
		);
	}

	function removeFile(file: File) {
		setFiles((prev) => {
			const next: typeof prev = [];

			prev.filter((f) => f !== file);

			for (const f of prev) {
				if (f !== file) {
					next.push(f);
				} else {
					const previewUrl = Reflect.get(file, "previewUrl");

					if (previewUrl) {
						URL.revokeObjectURL(previewUrl);
					}
				}
			}

			return next;
		});
	}

	async function handleSendMsg() {
		if (isSendingMsg) {
			console.log("Already sending a message");

			return;
		}

		if (isStreaming) {
			const msg = "Wait for chat to finish streaming";

			toast.error(msg);
			console.log(msg);

			return;
		}

		const isOptimisticBotConversation =
			botConversationId ===
			(OPTIMISTIC_NEW_NOTEBOOK_ID as unknown as BotConversationId);
		if (isCreatingNotebook || isOptimisticBotConversation) {
			const msg = "Wait for chat to finish being created";

			console.log(msg, { botConversationId, isCreatingNotebook });
			toast.error(msg);

			return;
		}

		const textarea = textareaRef.current;

		if (!textarea) {
			console.error("No textarea found");

			return;
		}

		const message = textarea.value.trim();

		if (!message && files.length === 0) {
			console.log("Message is empty and no files selected");

			return;
		}

		if (files.length > 0) {
			console.log("Sending files...");

			await sendChatFiles.mutateAsync({ files });
		}

		if (message) {
			console.log("Sending text msg...");

			let tools_to_use: typeof toolsToUse = undefined;

			if (toolSelectionType === ToolSelectionType.SINGLE_SELECT) {
				if (toolsToUse?.[0]) {
					tools_to_use = [toolsToUse[0]];
				}
			} else if (toolSelectionType === ToolSelectionType.MULTI_SELECT) {
				tools_to_use = toolsToUse;
			}

			addBotConversationMessage.mutate({
				uuid: createBotConversationMessageUuid(),
				botConversationId,
				tools_to_use,
				messages: [
					{
						uuid: createBotConversationMessageUuid(),
						type: MessageType.Text,
						text: message,
					},
				],
			});
		}

		// Clear all:
		textarea.value = "";
		scrollToBottom();
		removeAllFiles();
	}

	function handleClickOnTool(tool: ChatTools) {
		generalCtx.setState((prev) => {
			const orgId = currentOrganization.id;

			if (toolSelectionType === ToolSelectionType.SINGLE_SELECT) {
				return {
					userChatTools: {
						...prev.userChatTools,
						[orgId]: [tool],
					},
				};
			} else {
				const newSet = new Set(prev.userChatTools[orgId]);

				if (newSet.has(tool)) {
					newSet.delete(tool);
				} else {
					newSet.add(tool);
				}

				return {
					userChatTools: {
						...prev.userChatTools,
						[orgId]: [...newSet],
					},
				};
			}
		});
	}

	function selectDefaultChatToolsToUse() {
		generalCtx.setState((prev) => ({
			userChatTools: {
				...prev.userChatTools,
				[currentOrganization.id]: currentOrganization.default_chat_tools,
			},
		}));
	}

	function focusOnTextarea() {
		textareaRef.current?.focus();
	}

	function openFilePicker(e: React.MouseEvent<HTMLButtonElement>) {
		e.stopPropagation();

		fileInputRef.current?.click();
	}

	function handleOnKeyDownOnTextarea(
		e: React.KeyboardEvent<HTMLTextAreaElement>,
	) {
		if (!e.metaKey && e.key === "Enter") {
			handleSendMsg();
		}
	}

	return (
		<>
			<input
				onChange={handleOnChangeFiles}
				accept=".csv,.pdf,image/*"
				ref={fileInputRef}
				className="hidden"
				type="file"
				multiple
			/>

			<div
				className="relative rounded-2xl border border-primary/20 flex flex-col gap-2 overflow-hidden chat-content p-2"
				onClick={focusOnTextarea}
			>
				<div
					className="absolute inset-0 backdrop-blur-sm bg-black/20 hidden data-[is-sending=true]:flex items-center justify-center z-2 gap-2"
					data-is-sending={sendChatFiles.isPending}
				>
					Sending and analysing…
					{LOADER}
				</div>

				{files.length === 0 ? null : (
					<div className="flex gap-2 max-w-full simple-scrollbar">
						{files.map((file) => {
							const isImg = file.type.startsWith("image/");
							const previewUrl: string | undefined =
								isImg && Reflect.get(file, "previewUrl");

							return (
								<div
									className="relative rounded-xl size-20 overflow-hidden flex-none bg-primary/15 p-3 w-32 group flex flex-col gap-1 justify-between"
									title={file.name}
									key={file.name}
								>
									<button
										className="absolute top-2 right-2 rounded-full button-hover bg-background flex items-center justify-center p-1 invisible group-hover:visible"
										onClick={() => removeFile(file)}
										title="Remove file"
										type="button"
									>
										<X className="size-4 stroke-1" />
									</button>

									{isImg ? (
										<img
											className="max-w-[75%] max-h-[calc(100%-1.5rem)] object-cover rounded-sm"
											src={previewUrl}
											alt={file.name}
										/>
									) : (
										matchIcon(file.type)
									)}

									<span className="text-xs truncate text-muted">
										{file.name}
									</span>
								</div>
							);
						})}
					</div>
				)}

				<textarea
					className="field-sizing-content simple-scrollbar resize-none min-h-[2lh] max-h-[50dvh] w-full focus-visible:outline-none p-3"
					onKeyDown={handleOnKeyDownOnTextarea}
					maxLength={50_000}
					ref={textareaRef}
				/>

				<div className="flex items-center justify-between flex-none">
					<div className="flex items-center gap-2">
						<button
							className="rounded-lg size-10 button-hover p-2 flex items-center justify-center"
							onClick={openFilePicker}
							type="button"
						>
							<FilePlus className="size-5 text-primary stroke-1" />
						</button>

						{currentOrganization.all_tool_options && toolsToUse ? (
							<NativePopover>
								<NativePopoverTrigger
									className="flex items-center justify-center h-10 min-w-10 button-hover gap-2 p-2 text-sm rounded-lg border-none shadow-none max-w-full disabled:pointer-events-none"
									disabled={isStreaming || isSendingMsg}
									title="Mode"
								>
									{toolSelectionType === ToolSelectionType.MULTI_SELECT &&
									isDefaultToolsSelected ? (
										<>
											<SlidersVertical className="size-4 text-primary stroke-1" />

											<span className="text-muted text-xs">Default</span>
										</>
									) : toolSelectionType === ToolSelectionType.MULTI_SELECT &&
										toolsToUse.length > 1 ? (
										<>
											<SlidersVertical className="size-4 text-primary stroke-1" />

											<span className="text-xs text-muted whitespace-nowrap truncate">
												{toolsToUse.length} Modes In Use
											</span>
										</>
									) : toolsToUse[0] ? (
										<>
											<span className="capitalize text-xs text-muted whitespace-nowrap truncate">
												{titleCase(toolsToUse[0].toLowerCase())}
											</span>
										</>
									) : (
										<>
											<SlidersVertical className="size-4 text-primary stroke-1" />

											<span>Mode</span>
										</>
									)}
								</NativePopoverTrigger>

								<NativePopoverContent
									position="top span-right"
									className="text-sm"
								>
									{currentOrganization.all_tool_options.map(function (tool) {
										const isActive = toolsToUse.includes(tool);

										return (
											<button
												className="flex flex-row items-center gap-2 group button-hover group px-2 py-1 rounded-md"
												onClick={() => handleClickOnTool(tool)}
												data-is-active={isActive}
												key={tool}
											>
												{isActive ? (
													<Check className="size-4 flex-none stroke-primary group-hover:stroke-accent-foreground group-active:stroke-accent-foreground" />
												) : (
													<span className="size-4 flex-none"></span>
												)}

												<div className="flex flex-row items-center gap-2 text-left">
													<span className="capitalize">
														{titleCase(tool.toLowerCase())}
													</span>
												</div>
											</button>
										);
									})}

									{toolSelectionType === ToolSelectionType.MULTI_SELECT ? (
										<button
											className="flex flex-row items-center gap-2 group button-hover group px-2 py-1 rounded-md"
											data-is-active={isDefaultToolsSelected}
											onClick={selectDefaultChatToolsToUse}
										>
											{isDefaultToolsSelected ? (
												<Check className="size-4 flex-none stroke-primary group-hover:stroke-accent-foreground group-active:stroke-accent-foreground" />
											) : (
												<span className="size-4 flex-none"></span>
											)}

											<span>Default</span>
										</button>
									) : null}
								</NativePopoverContent>
							</NativePopover>
						) : null}
					</div>

					<button
						className="rounded-lg size-10 button-hover flex items-center justify-center"
						title={isStreaming ? "Stop" : "Send"}
						type="button"
						onClick={
							isSendingMsg
								? undefined
								: isStreaming
									? handleStopStreaming
									: handleSendMsg
						}
					>
						{isSendingMsg ? (
							LOADER
						) : isStreaming ? (
							<StopCircle className="size-5 stroke-1" />
						) : (
							<Send className="size-5 stroke-1" />
						)}
					</button>
				</div>
			</div>
		</>
	);
}
