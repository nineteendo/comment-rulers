import * as vscode from 'vscode';

// Iterface for delimiters
interface Delimiters {
	[key: string]: string
}

// Constants
const DECORATION_TYPE = vscode.window.createTextEditorDecorationType({});
const DECORATION_TYPE2 = vscode.window.createTextEditorDecorationType({});
const DECORATION_TYPE3 = vscode.window.createTextEditorDecorationType({});
const DECORATION_TYPE4 = vscode.window.createTextEditorDecorationType({});

// Default settings
// eslint-disable-next-line @typescript-eslint/naming-convention
const BLOCK_COMMENT_DELIMITERS: Delimiters = {"/*": "*/"};
const ENABLED = false;
const ESCAPABLE_CHARS = "\\\"'";
const INLINE_COMMENT_DELIMTERS: string[] = ["//"];
const MAX_COMMENT_LINE_LENGTH = 80;
// eslint-disable-next-line @typescript-eslint/naming-convention
const MULTI_LINE_STRING_DELIMITERS: Delimiters = {};
const PLACEHOLDER_CHAR = "_";
const PLACEHOLDER_COLOR = "transparent";
const RULER_COLOR = "green";
const RULER_WIDTH = "1px";
// eslint-disable-next-line @typescript-eslint/naming-convention
const SINGLE_LINE_STRING_DELIMITERS: Delimiters = {'"': '"', "'": "'"};

// Global settings
let blockCommentDelimiters = BLOCK_COMMENT_DELIMITERS;
let enabled = ENABLED;
let escapableChars = ESCAPABLE_CHARS;
let inlineCommentDelimiters = INLINE_COMMENT_DELIMTERS;
let maxCommentLineLength = MAX_COMMENT_LINE_LENGTH;
let multiLineStringDelimiters = MULTI_LINE_STRING_DELIMITERS;
let placeholderChar = PLACEHOLDER_CHAR;
let placeholderColor = PLACEHOLDER_COLOR;
let rulerColor = RULER_COLOR;
let rulerWidth = RULER_WIDTH;
let singleLineStringDelimiters = SINGLE_LINE_STRING_DELIMITERS;

// Comment status
let blockCommentStart = 0;
let inBlockComment: string | null = null;
let inMultiLineString: string | null = null;

function activate(_: vscode.ExtensionContext) {
	drawCommentLines();
	vscode.workspace.onDidChangeConfiguration(drawCommentLines);
	vscode.workspace.onDidOpenTextDocument(drawCommentLines);
	vscode.window.onDidChangeActiveTextEditor(drawCommentLines);
	vscode.workspace.onDidChangeTextDocument(drawCommentLines);
}

function updateSettings(languageId: string) {
	for (let getConfig of [vscode.workspace.getConfiguration('comment-rulers').get, vscode.workspace.getConfiguration('comment-rulers', { languageId: languageId }).get]) {
		blockCommentDelimiters = getConfig<Delimiters>('blockCommentDelimiters', BLOCK_COMMENT_DELIMITERS);
		enabled = getConfig<boolean>('enabled', ENABLED);
		escapableChars = getConfig<string>('escapableChars', ESCAPABLE_CHARS);
		inlineCommentDelimiters = getConfig<string[]>('inlineCommentDelimiters', INLINE_COMMENT_DELIMTERS);
		maxCommentLineLength = getConfig<number>('maxCommentLineLength', MAX_COMMENT_LINE_LENGTH);
		multiLineStringDelimiters = getConfig<Delimiters>('multiLineStringDelimiters', MULTI_LINE_STRING_DELIMITERS);
		placeholderChar = getConfig<string>('placeholderChar', PLACEHOLDER_CHAR);
		placeholderColor = getConfig<string>('placeholderColor', PLACEHOLDER_COLOR);
		rulerColor = getConfig<string>('rulerColor', RULER_COLOR);
		rulerWidth = getConfig<string>('rulerWidth', RULER_WIDTH);
		singleLineStringDelimiters = getConfig<Delimiters>('singleLineStringDelimiters', SINGLE_LINE_STRING_DELIMITERS);
	}
}

function parseLine(line: string) { // Line starts and ends with \n
	let commentStart = Infinity;
	let inSingleLineString: string | null = null;
	if (inBlockComment !== null) {
		commentStart = blockCommentStart;
	}
	for (let i = 0; i < line.length; i++) {
		if (line[i] === "\\" && escapableChars.includes(line[i + 1])) {
			i++;
			continue;
		} // else
		if (inBlockComment !== null) {
			const value = blockCommentDelimiters[inBlockComment];
			if (line.substring(i, i + value.length) === value && value !== "") {
				inBlockComment = null;
				i += value.length - 1;
			}
			continue;
		} // else
		if (inMultiLineString !== null) {
			const value = multiLineStringDelimiters[inMultiLineString];
			if (line.substring(i, i + value.length) === value && value !== "") {
				inMultiLineString = null;
				i += value.length - 1;
			}
			continue;
		} // else
		if (inSingleLineString !== null) {
			const value = singleLineStringDelimiters[inSingleLineString];
			if (line.substring(i, i + value.length) === value && value !== "") {
				inSingleLineString = null;
				i += value.length - 1;
			}
			continue;
		} // else
		for (const value of inlineCommentDelimiters) {
			if (line.substring(i, i + value.length) === value && value !== "") {
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
		for (const key in multiLineStringDelimiters) {
			if (line.substring(i, i + key.length) !== key || key === "") {
				continue;
			}
			inMultiLineString = key;
			i += key.length - 1;
			break;
		}
		if (inMultiLineString !== null) {
			continue;
		} // else
		for (const key in singleLineStringDelimiters) {
			if (line.substring(i, i + key.length) !== key || key === "") {
				continue;
			}
			inSingleLineString = key;
			i += key.length - 1;
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
		vscode.window.activeTextEditor.setDecorations(DECORATION_TYPE3, []);
		vscode.window.activeTextEditor.setDecorations(DECORATION_TYPE4, []);
		return;
	}
	blockCommentStart = 0;
	let decorations: vscode.DecorationOptions[] = [];
	let decorations2: vscode.DecorationOptions[] = [];
	let decorations3: vscode.DecorationOptions[] = [];
	let decorations4: vscode.DecorationOptions[] = [];
	const document = vscode.window.activeTextEditor.document;
	inBlockComment = null;
	inMultiLineString = null;
	for (let i = 0; i < document.lineCount; i++) {
		const line = document.lineAt(i).text;
		let start = Math.max(0, parseLine("\n" + line + "\n") - 1);
		if (start === Infinity) {
			continue;
		}
		if (start > line.length) {
			decorations.push({
				range: new vscode.Range(i, line.length, i, start),
				renderOptions: {
					after: {
						color: placeholderColor,
						contentText: placeholderChar.repeat(start - line.length)
					}
				}
			});
		}
		decorations2.push({
			range: new vscode.Range(i, start, i, start),
			renderOptions: {
				after: {
					backgroundColor: rulerColor,
					border: `${rulerWidth} solid ${rulerColor}`,
					contentText: ""
				}
			}
		});
		if (start + maxCommentLineLength > line.length) {
			decorations3.push({
				range: new vscode.Range(i, Math.max(start, line.length), i, start + maxCommentLineLength),
				renderOptions: {
					after: {
						color: placeholderColor,
						contentText: placeholderChar.repeat(start + maxCommentLineLength - Math.max(start, line.length))
					}
				}
			});
		}
		decorations4.push({
			range: new vscode.Range(i, start + maxCommentLineLength, i, start + maxCommentLineLength),
			renderOptions: {
				after: {
					backgroundColor: rulerColor,
					border: `${rulerWidth} solid ${rulerColor}`,
					contentText: ""
				}
			}
		});
	}
	vscode.window.activeTextEditor.setDecorations(DECORATION_TYPE, decorations);
	vscode.window.activeTextEditor.setDecorations(DECORATION_TYPE2, decorations2);
	vscode.window.activeTextEditor.setDecorations(DECORATION_TYPE3, decorations3);
	vscode.window.activeTextEditor.setDecorations(DECORATION_TYPE4, decorations4);
}

export { activate };
