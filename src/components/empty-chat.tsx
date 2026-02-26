export function EmptyChat() {
	return (
		<div className="flex flex-col text-lg h-full w-full items-center justify-center">
			<span>No messages yet</span>

			<span className="text-xs text-muted">
				Send a message to start a conversation
			</span>
		</div>
	);
}
