import * as vscode from 'vscode';

// Iterface for objects with any strings
interface StringObject {
	[key: string]: string
}

// Constants
const BACKGROUND_COLOR = "green";
// eslint-disable-next-line @typescript-eslint/naming-convention
const BLOCK_COMMENT_DELIMITERS: StringObject = {"/*": "*/"};
const BORDER = "1px solid green";
const COLOR = "transparent";
const DECORATION_TYPE = vscode.window.createTextEditorDecorationType({});
const DECORATION_TYPE2 = vscode.window.createTextEditorDecorationType({});
const ENABLED = false;
const ESCAPABLE_CHARS = "\\\"'";
const INLINE_COMMENT_DELIMTERS: string[] = ["//"];
const MAX_COMMENT_LINE_LENGTH = 80;
const MULTI_LINE_STRING_DELIMITERS: string[] = [];
const SINGLE_LINE_STRING_DELIMITERS: string[] = ['"', "'"];

// Global settings
let backgroundColor = BACKGROUND_COLOR;
let blockCommentDelimiters = BLOCK_COMMENT_DELIMITERS;
let border = BORDER;
let color = COLOR;
let enabled = ENABLED;
let escapableChars = ESCAPABLE_CHARS;
let inlineCommentDelimiters = INLINE_COMMENT_DELIMTERS;
let maxCommentLineLength = MAX_COMMENT_LINE_LENGTH;
let multiLineStringDelimiters = MULTI_LINE_STRING_DELIMITERS;
let singleLineStringDelimiters = SINGLE_LINE_STRING_DELIMITERS;

// Comment status
let blockCommentStart = 0;
let inBlockComment: string | null = null;
let inMultiLineString = -1;

function activate(_: vscode.ExtensionContext) {
	drawCommentLines();
	vscode.workspace.onDidChangeConfiguration(drawCommentLines);
	vscode.workspace.onDidOpenTextDocument(drawCommentLines);
	vscode.window.onDidChangeActiveTextEditor(drawCommentLines);
	vscode.workspace.onDidChangeTextDocument(drawCommentLines);
}

function updateSettings(languageId: string) {
	for (let getConfig of [vscode.workspace.getConfiguration('comment-rulers').get, vscode.workspace.getConfiguration('comment-rulers', { languageId: languageId }).get]) {
		backgroundColor = getConfig<string>('backgroundColor', BACKGROUND_COLOR);
		blockCommentDelimiters = getConfig<StringObject>('blockCommentDelimiters', BLOCK_COMMENT_DELIMITERS);
		border = getConfig<string>('border', BORDER);
		color = getConfig<string>('color', COLOR);
		enabled = getConfig<boolean>('enabled', ENABLED);
		escapableChars = getConfig<string>('escapableChars', ESCAPABLE_CHARS);
		inlineCommentDelimiters = getConfig<string[]>('inlineCommentDelimiters', INLINE_COMMENT_DELIMTERS);
		maxCommentLineLength = getConfig<number>('maxCommentLineLength', MAX_COMMENT_LINE_LENGTH);
		multiLineStringDelimiters = getConfig<string[]>('multiLineStringDelimiters', MULTI_LINE_STRING_DELIMITERS);
		singleLineStringDelimiters = getConfig<string[]>('singleLineStringDelimiters', SINGLE_LINE_STRING_DELIMITERS);
	}
}

function parseLine(line: string) {
	let commentStart = Infinity;
	let inSingleLineString = -1;
	if (inBlockComment !== null) {
		commentStart = blockCommentStart;
	}
	for (let i = 0; i < line.length; i++) {
		if (line[i] === "\\" && escapableChars.includes(line[++i])) {
			continue;
		} // else
		if (inBlockComment !== null) {
			if (line.substring(i, i + blockCommentDelimiters[inBlockComment].length) === blockCommentDelimiters[inBlockComment]) {
				inBlockComment = null;
			}
			continue;
		} // else
		if (inMultiLineString !== -1) {
			if (line.substring(i, i + multiLineStringDelimiters[inMultiLineString].length) === multiLineStringDelimiters[inMultiLineString]) {
				inMultiLineString = -1;
			}
			continue;
		} // else
		if (inSingleLineString !== -1) {
			if (line.substring(i, i + singleLineStringDelimiters[inSingleLineString].length) === singleLineStringDelimiters[inSingleLineString]) {
				inSingleLineString = -1;
			}
			continue;
		} // else
		for (const value of inlineCommentDelimiters) {
			if (line.substring(i, i + value.length) === value) {
				return Math.min(i, commentStart);
			}
		}
		for (const key in blockCommentDelimiters) {
			if (line.substring(i, i + key.length) !== key || key === "") {
				continue;
			} // else
			inBlockComment = key;
			blockCommentStart = i;
			commentStart = Math.min(i, commentStart);
			i += key.length - 1;
			break;
		}
		if (inBlockComment !== null) {
			continue;
		} // else
		for (let j = 0; j < multiLineStringDelimiters.length; j++) {
			const value = multiLineStringDelimiters[j];
			if (line.substring(i, i + value.length) !== value || value === "") {
				continue;
			}
			inMultiLineString = j;
			i += value.length - 1;
			break;
		}
		if (inMultiLineString !== -1) {
			continue;
		} // else
		for (let j = 0; j < singleLineStringDelimiters.length; j++) {
			const value = singleLineStringDelimiters[j];
			if (line.substring(i, i + value.length) !== value || value === "") {
				continue;
			}
			inSingleLineString = j;
			i += value.length - 1;
			break;
		}
	}
	return commentStart;
}

function drawCommentLines() {
	if (!vscode.window.activeTextEditor) {
		return;
	}
	updateSettings(vscode.window.activeTextEditor.document.languageId);
	if (!enabled) {
		vscode.window.activeTextEditor.setDecorations(DECORATION_TYPE, []);
		vscode.window.activeTextEditor.setDecorations(DECORATION_TYPE2, []);
		return;
	}
	blockCommentStart = 0;
	let decorations: vscode.DecorationOptions[] = [];
	let decorations2: vscode.DecorationOptions[] = [];
	const document = vscode.window.activeTextEditor.document;
	inBlockComment = null;
	inMultiLineString = -1;
	for (let i = 0; i < document.lineCount; i++) {
		const line = document.lineAt(i).text;
		let start = Math.max(0, parseLine("\n" + line + "\n") - 1);
		if (start === Infinity) {
			continue;
		}
		if (start + maxCommentLineLength > line.length) {
			decorations.push({
				range: new vscode.Range(i, line.length, i, start + maxCommentLineLength),
				renderOptions: {
					after: {
						color: color,
						contentText: "_".repeat(start + maxCommentLineLength - line.length)
					}
				}
			});
		}
		decorations2.push({
			range: new vscode.Range(i, start + maxCommentLineLength, i, start + maxCommentLineLength),
			renderOptions: {
				after: {
					backgroundColor: backgroundColor,
					border: border,
					contentText: ""
				}
			}
		});
	}
	vscode.window.activeTextEditor.setDecorations(DECORATION_TYPE, decorations);
	vscode.window.activeTextEditor.setDecorations(DECORATION_TYPE2, decorations2);
}

export { activate };
