import { CSVBlock } from "#/components/blocks/csv-block";
import { ImageBlock } from "#/components/blocks/image-block";
import { PdfBlock } from "#/components/blocks/pdf-block";
import { PythonBlock } from "#/components/blocks/python-block";
import { SqlBlock } from "#/components/blocks/sql-block";
import { TableBlock } from "#/components/blocks/table-block";
import { DefaultSuspenseAndErrorBoundary } from "#/components/default-suspense-and-error-boundary";
import {
	type BlockCsv,
	type BlockImage,
	type BlockPDF,
	type BlockPython,
	type BlockSql,
	type BlockTable,
	BlockType,
	type NotebookBlock,
} from "#/types/notebook";

export function renderNotebookBlock(notebookBlock: NotebookBlock) {
	const { uuid } = notebookBlock;
	let node = null;

	switch (notebookBlock.type) {
		case BlockType.Pdf: {
			node = <PdfBlock key={uuid} pdfBlock={notebookBlock as BlockPDF} />;
			break;
		}

		case BlockType.Image: {
			node = <ImageBlock key={uuid} imageBlock={notebookBlock as BlockImage} />;
			break;
		}

		case BlockType.Sql: {
			node = <SqlBlock key={uuid} sqlBlock={notebookBlock as BlockSql} />;
			break;
		}

		case BlockType.Python: {
			node = (
				<PythonBlock key={uuid} pythonBlock={notebookBlock as BlockPython} />
			);
			break;
		}

		case BlockType.Csv: {
			node = <CSVBlock key={uuid} csvBlock={notebookBlock as BlockCsv} />;
			break;
		}

		case BlockType.Table: {
			node = <TableBlock key={uuid} tableBlock={notebookBlock as BlockTable} />;
			break;
		}

		default: {
			console.log("Can't render this notebook block type:", notebookBlock);

			break;
		}
	}

	if (node === null) return null;

	return (
		<DefaultSuspenseAndErrorBoundary
			failedText="Error rendering notebook block"
			fallbackFor="RenderNotebookBlock"
			key={uuid}
		>
			{node}
		</DefaultSuspenseAndErrorBoundary>
	);
}
