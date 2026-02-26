import {
	Briefcase,
	Cable,
	ChevronLeft,
	Clock8,
	Columns3,
	Database,
	File,
	FileText,
	Folder,
	FolderSearch,
	Globe,
	HatGlasses,
	Image,
	ImageIcon,
	List,
	MessageSquareText,
	MessagesSquare,
	NotebookPen,
	Presentation,
	Square,
	SquareArrowOutUpRight,
	TextSearch,
} from "lucide-react";

import { LocalMimeType } from "#/hooks/get/use-get-file-by-id";
import { AirtableIcon } from "#/icons/airtable-icon";
import { ClickUpIcon } from "#/icons/click-up-icon";
import { CsvIcon } from "#/icons/csv-icon";
import { DocxIcon } from "#/icons/docx-icon";
import { ExcelIcon } from "#/icons/excel-icon";
import { GoogleDriveLogoIcon } from "#/icons/google-drive-logo-icon";
import { PdfIcon } from "#/icons/pdf-icon";
import { PostgresDarkIcon } from "#/icons/postgres-dark-icon";
import { PptxIcon } from "#/icons/pptx-icon";
import { SlackIcon } from "#/icons/slack-icon";
import { SnowflakeIcon } from "#/icons/snowflake-icon";
import { cn } from "#/lib/utils";
import { SourceForUserType } from "#/types/chat";
import { ClickUpEntityType, DatabaseConnectionType } from "#/types/databases";
import { GeneralFileType } from "#/types/file";
import { ChatTools } from "#/types/notebook";

const DEFAULT_CLASSNAME =
	"size-4 flex-none stroke-primary stroke-1 fill-primary";

export function matchIcon(
	name: string | undefined | null,
	className?: string | undefined,
) {
	if (typeof name === "string" && name.startsWith("image/")) {
		return <Image className="size-5 flex-none" />;
	}

	switch (name) {
		case ChatTools.ANSWER_QUESTION_BY_SEARCHING_ORGANIZATION_CONTEXT:
			return (
				<FolderSearch
					className={cn(
						DEFAULT_CLASSNAME,
						"fill-none stroke-1.5 group-hover:stroke-accent-foreground",
						className,
					)}
				/>
			);

		case ChatTools.WAIT_FOR_HUMAN_MESSAGE:
			return (
				<Clock8
					className={cn(
						DEFAULT_CLASSNAME,
						"fill-none stroke-1.5 group-hover:stroke-accent-foreground",
						className,
					)}
				/>
			);

		case ChatTools.ANSWER_QUESTION_USING_INTERNAL_AND_EXTERNAL_SEARCH:
			return (
				<Cable
					className={cn(
						DEFAULT_CLASSNAME,
						"fill-none stroke-1.5 group-hover:stroke-accent-foreground",
						className,
					)}
				/>
			);

		case ChatTools.ANSWER_QUESTION_USING_WEB_SEARCH:
			return (
				<Globe
					className={cn(
						DEFAULT_CLASSNAME,
						"fill-none stroke-1.5 group-hover:stroke-accent-foreground",
						className,
					)}
				/>
			);

		case ChatTools.ANSWER_QUESTION_USING_CONTEXT:
			return (
				<TextSearch
					className={cn(
						DEFAULT_CLASSNAME,
						"fill-none stroke-1.5 group-hover:stroke-accent-foreground",
						className,
					)}
				/>
			);

		case ChatTools.RETURN_NORMAL_TEXT_RESPONSE:
			return (
				<MessageSquareText
					className={cn(
						DEFAULT_CLASSNAME,
						"fill-none stroke-1.5 group-hover:stroke-accent-foreground",
						className,
					)}
				/>
			);

		case ChatTools.PERFORM_ACTION_IN_NOTEBOOK:
			return (
				<NotebookPen
					className={cn(
						DEFAULT_CLASSNAME,
						"fill-none stroke-1.5 group-hover:stroke-accent-foreground",
						className,
					)}
				/>
			);

		case ChatTools.ASK_CLARIFYING_QUESTION:
			return (
				<HatGlasses
					className={cn(
						DEFAULT_CLASSNAME,
						"fill-none stroke-1.5 group-hover:stroke-accent-foreground",
						className,
					)}
				/>
			);

		case ChatTools.PLANNER:
			return (
				<Presentation
					className={cn(
						DEFAULT_CLASSNAME,
						"fill-none stroke-1.5 group-hover:stroke-accent-foreground",
						className,
					)}
				/>
			);

		case GeneralFileType.GOOGLE_DRIVE_DOCUMENT:
		case GeneralFileType.GENERAL:
		case LocalMimeType.General:
		case "doc":
			return <File className={cn(DEFAULT_CLASSNAME, className, "fill-none")} />;

		case GeneralFileType.CSV:
		case "text/csv":
		case "csv":
			return (
				<CsvIcon className={cn(DEFAULT_CLASSNAME, className, "stroke-0")} />
			);

		case GeneralFileType.IMAGE:
		case "image":
		case GeneralFileType.JPEG:
		case "jpeg":
		case GeneralFileType.TIFF:
		case "tiff":
		case GeneralFileType.HEIF:
		case "heif":
		case GeneralFileType.HEIC:
		case "heic":
		case GeneralFileType.PNG:
		case "png":
			return (
				<ImageIcon className={cn(DEFAULT_CLASSNAME, "fill-none", className)} />
			);

		case GeneralFileType.XLSX:
		case "xlsx":
			return <ExcelIcon className={cn(DEFAULT_CLASSNAME, className)} />;

		case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
		case GeneralFileType.DOCX:
		case "application/msword":
		case "docx":
			return <DocxIcon className={cn(DEFAULT_CLASSNAME, className)} />;

		case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
		case "application/vnd.ms-powerpoint":
		case GeneralFileType.PPTX:
		case "pptx":
			return <PptxIcon className={cn(DEFAULT_CLASSNAME, className)} />;

		case SourceForUserType.Pdf:
		case GeneralFileType.PDF:
		case "application/pdf":
		case "pdf":
			return (
				<PdfIcon
					className={cn("size-4 flex-none fill-destructive", className)}
				/>
			);

		case "new-tab":
			return (
				<SquareArrowOutUpRight className={cn(DEFAULT_CLASSNAME, className)} />
			);

		case "back":
			return <ChevronLeft className={cn(DEFAULT_CLASSNAME, className)} />;

		case ClickUpEntityType.Workspace:
			return (
				<Briefcase className={cn(DEFAULT_CLASSNAME, "fill-none", className)} />
			);

		case ClickUpEntityType.ChatView:
			return (
				<MessagesSquare
					className={cn(DEFAULT_CLASSNAME, "fill-none", className)}
				/>
			);

		case GeneralFileType.GOOGLE_DRIVE_FOLDER:
		case ClickUpEntityType.Folder:
		case GeneralFileType.FOLDER:
			return (
				<Folder className={cn(DEFAULT_CLASSNAME, "fill-none", className)} />
			);

		case ClickUpEntityType.List:
			return <List className={cn(DEFAULT_CLASSNAME, "fill-none", className)} />;

		case ClickUpEntityType.Space:
			return (
				<Square className={cn(DEFAULT_CLASSNAME, "fill-none", className)} />
			);

		case SourceForUserType.Website:
		case SourceForUserType.Web:
		case "web":
			return (
				<Globe className={cn(DEFAULT_CLASSNAME, "fill-none", className)} />
			);

		case DatabaseConnectionType.Postgres:
		case SourceForUserType.SqlQuery:
			return (
				<PostgresDarkIcon
					className={cn(DEFAULT_CLASSNAME, "stroke-none", className)}
				/>
			);

		case DatabaseConnectionType.Snowflake:
			return (
				<SnowflakeIcon
					className={cn(DEFAULT_CLASSNAME, "stroke-none", className)}
				/>
			);

		case SourceForUserType.DataSchema: {
			return (
				<Columns3 className={cn(DEFAULT_CLASSNAME, "fill-none", className)} />
			);
		}

		case SourceForUserType.Affinity: {
			return (
				<img
					alt="Affinity, the relationship intelligence platform for dealmakers"
					className={cn(DEFAULT_CLASSNAME, "stroke-none", className)}
					src="/logos/affinity-logo.png"
					height={38}
					width={38}
				/>
			);
		}

		case DatabaseConnectionType.ExternalDatasource:
			return <Database className={cn(DEFAULT_CLASSNAME, className)} />;

		case DatabaseConnectionType.OracleDatabase:
			return (
				<span className={cn(DEFAULT_CLASSNAME, "-m-0.5 h-4 w-0", className)} />
			);

		case DatabaseConnectionType.Slack:
		case SourceForUserType.Slack:
			return (
				<SlackIcon
					className={cn(DEFAULT_CLASSNAME, "stroke-none", className)}
				/>
			);

		case DatabaseConnectionType.Airtable:
		case SourceForUserType.Airtable:
			return (
				<AirtableIcon
					className={cn(DEFAULT_CLASSNAME, "stroke-none", className)}
				/>
			);

		case DatabaseConnectionType.GoogleDrive:
		case SourceForUserType.GoogleDrive:
			return (
				<GoogleDriveLogoIcon
					className={cn(DEFAULT_CLASSNAME, "stroke-none", className)}
				/>
			);

		case SourceForUserType.StandardDocument: {
			return (
				<FileText className={cn(DEFAULT_CLASSNAME, "fill-none", className)} />
			);
		}

		case DatabaseConnectionType.ClickUp:
			return (
				<ClickUpIcon
					className={cn(DEFAULT_CLASSNAME, "stroke-none", className)}
				/>
			);

		case SourceForUserType.ModeDefinition:
		case SourceForUserType.ModeQuery: {
			return (
				<img
					className={cn(DEFAULT_CLASSNAME, "stroke-none", className)}
					alt="Green capital letter 'm'"
					src="/logos/mode-query.png"
				/>
			);
		}

		default:
			console.log("No icon:", name);

			return (
				<span className={cn(DEFAULT_CLASSNAME, "-m-0.5 h-4 w-0", className)} />
			);
	}
}
