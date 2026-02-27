import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { SourceForUserType } from "#/types/chat";
import type { NormalizedSource } from "#/lib/sources-for-user/normalize-sources";

type Props = {
	normalizedSource: Extract<
		NormalizedSource,
		{ source_type: SourceForUserType.Slack }
	>;
};

export function SlackConversations({
	normalizedSource: {
		values: { messages },
	},
}: Props) {
	return (
		<section className="simple-scrollbar max-h-96 flex flex-col [&_article:nth-child(even)]:bg-alt-row text-xs border border-border-smooth rounded-lg">
			{messages.map((msg) => {
				const sentAt = new Date(msg.sent_at).toLocaleDateString();

				return (
					<article className="flex flex-col gap-2 p-2" key={msg.message_id}>
						<div className="flex gap-2 items-center">
							<Avatar className="size-8 border-none" title={msg.sender}>
								<AvatarImage src={undefined} />

								<AvatarFallback className="border-none bg-muted-strong text-primary">
									{msg.sender.slice(-2)}
								</AvatarFallback>
							</Avatar>

							<div className="flex flex-col max-w-full gap-1 text-xs">
								<b title={`Sent by ${msg.sender}`}>{msg.sender}</b>

								<span title={`Sent at ${sentAt}`} className="">
									{sentAt}
								</span>
							</div>
						</div>

						<pre className="max-w-full break-all font-inter whitespace-pre-wrap">
							{msg.text}
						</pre>
					</article>
				);
			})}
		</section>
	);
}
