import * as vscode from 'vscode';

// Iterface for objects with any strings
interface StringObject {
	[key: string]: string
}

// Constants
const EM_PER_CHAR = 0.5496;
const ENABLED = false;
const MAX_COMMENT_LINE_LENGTH = 80;
const MULTI_LINE_COMMENT_STRINGS: StringObject = { "/*": "*/" };
const SINGLE_LINE_COMMENT_STRINGS = ["//"];
const STYLE = "1px solid green";
const DECORATION_TYPE: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({});

// Global settings
let enabled = ENABLED;
let maxCommentLineLength = MAX_COMMENT_LINE_LENGTH;
let multiLineCommentStrings = MULTI_LINE_COMMENT_STRINGS;
let singleLineCommentStrings = SINGLE_LINE_COMMENT_STRINGS;
let style = STYLE;

// Comment status
let drawSingleLineComment = -1;
let inMultiLineComment: string | null = null;
let multiLineCommentStart = 0;

function activate(_: vscode.ExtensionContext) {
	drawCommentLines();
	vscode.workspace.onDidChangeConfiguration(drawCommentLines);
	vscode.workspace.onDidOpenTextDocument(drawCommentLines);
	vscode.window.onDidChangeActiveTextEditor(drawCommentLines);
	vscode.workspace.onDidChangeTextDocument(drawCommentLines);
}

function updateSettings(languageId: string) {
	for (let getConfig of [vscode.workspace.getConfiguration('comment-rulers').get, vscode.workspace.getConfiguration('comment-rulers', { languageId: languageId }).get]) {
		enabled = getConfig<boolean>('enabled', ENABLED);
		maxCommentLineLength = getConfig<number>('maxCommentLineLength', MAX_COMMENT_LINE_LENGTH);
		multiLineCommentStrings = getConfig<StringObject>('multiLineCommentStrings', MULTI_LINE_COMMENT_STRINGS);
		singleLineCommentStrings = getConfig<string[]>('singleLineCommentStrings', SINGLE_LINE_COMMENT_STRINGS);
		style = getConfig<string>('style', STYLE);
	}
}

function parseLine(line: string) {
	let start = line.length;
	let multiLineCommentEndMatch = "";
	let singleLineCommentMatches = new Array(singleLineCommentStrings.length).fill("");
	let multiLineCommentStartMatches: StringObject = {};
	for (const key in multiLineCommentStrings) {
		multiLineCommentStartMatches[key] = "";
	}
	if (inMultiLineComment !== null) {
		start = multiLineCommentStart;
	}
	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		let newStart;
		for (let j = 0; j < singleLineCommentMatches.length; j++) {
			if (inMultiLineComment === null) {
				singleLineCommentMatches[j] += char;
			}
			newStart = i - singleLineCommentMatches[j].length + 1;
			if (singleLineCommentMatches[j] === singleLineCommentStrings[j]) {
				if (newStart < start) {
					drawSingleLineComment = j;
					start = newStart;
				} else if (inMultiLineComment === null) {
					drawSingleLineComment = j;
				}
			}
			if (!singleLineCommentStrings[j].startsWith(singleLineCommentMatches[j])) {
				singleLineCommentMatches[j] = "";
			}
		}
		for (const key in multiLineCommentStartMatches) {
			if (inMultiLineComment === null) {
				multiLineCommentStartMatches[key] += char;
			}
			newStart = i - multiLineCommentStartMatches[key].length + 1;
			if (multiLineCommentStartMatches[key] === key) {
				if (newStart < start) {
					inMultiLineComment = key;
					multiLineCommentStart = start = newStart;
				} else if (drawSingleLineComment === -1) {
					inMultiLineComment = key;
					multiLineCommentStart = newStart;
				}
			}
			if (!key.startsWith(multiLineCommentStartMatches[key])) {
				multiLineCommentStartMatches[key] = "";
			}
		}
		if (inMultiLineComment !== null) {
			multiLineCommentEndMatch += char;
		}
		if (inMultiLineComment !== null && multiLineCommentEndMatch === multiLineCommentStrings[inMultiLineComment]) {
			inMultiLineComment = null;
		}
		if (inMultiLineComment === null || !multiLineCommentStrings[inMultiLineComment].startsWith(multiLineCommentEndMatch)) {
			multiLineCommentEndMatch = "";
		}
	}
	return start;
}

function drawCommentLines() {
	if (!vscode.window.activeTextEditor) {
		return;
	}
	updateSettings(vscode.window.activeTextEditor.document.languageId);
	if (!enabled) {
		vscode.window.activeTextEditor.setDecorations(DECORATION_TYPE, []);
		return;
	}
	const document = vscode.window.activeTextEditor.document;
	let decorations: vscode.DecorationOptions[] = [];
	inMultiLineComment = null;
	multiLineCommentStart = 0;
	for (let i = 0; i < document.lineCount; i++) {
		const line = document.lineAt(i).text;
		const end = line.length;
		drawSingleLineComment = -1;
		let start = parseLine(line);
		if (start === end) {
			continue;
		}
		const decoration = {
			range: new vscode.Range(i, start + maxCommentLineLength, i, start + maxCommentLineLength),
			renderOptions: {
				after: {
					contentText: "",
					border: style,
					margin: `0 0 0 ${Math.max(0, EM_PER_CHAR * (start + maxCommentLineLength - end))}em`
				}
			},
			rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
		};
		decorations.push(decoration);
	}
	vscode.window.activeTextEditor.setDecorations(DECORATION_TYPE, decorations);
}

export { activate };
