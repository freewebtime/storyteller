/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import {
  // Diagnostic, DiagnosticSeverity, 
	IPCMessageReader, IPCMessageWriter, createConnection, IConnection, TextDocuments, InitializeResult, ExecuteCommandParams,
  TextDocumentSyncKind
} from 'vscode-languageserver';

// Create a connection for the server. The connection uses Node's IPC as a transport
let connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments = new TextDocuments();
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// After the server has started the client sends an initialize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilities. 
// let workspaceRoot: string;
connection.onInitialize((/*params*/): InitializeResult => {
	// const workspaceRoot = params.rootPath;
	// console.log('workspaceRoot', workspaceRoot);

	return {
		capabilities: {
			// Tell the client that the server works in FULL text document sync mode
			textDocumentSync: TextDocumentSyncKind.Full,
			// Tell the client that the server support code complete
			// completionProvider: {
      //   resolveProvider: false,
      //   triggerCharacters: ["*"]
      // },
		}
	}
});

// function updateStrings() {
//   return;
  
//   let docs = documents.all();
//   let result: string[] = [];
//   docs.forEach(doc => {
//     result = collectStrings(result, doc);
//   });

//   result = result.filter(onlyUnique);
//   strings = result;
// }

// function onlyUnique(value: any, index: number, self: string[]) {
//   return self.indexOf(value) === index;
// }

// function collectStrings(state: string[], doc: TextDocument) {
//   let text = doc.getText();
//   let words = text.split(/(?:\\r\\n)|(?:\\n)|(\\s)/);
//   words.forEach(word => {
//     word = word.trim();
//     if (!word || word.length === 0) {
//       return;
//     }

//     state = [
//       ...state,
//       word
//     ]
//   });

//   return state;
// }

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
// documents.onDidChangeContent((change: TextDocumentChangeEvent) => {
// 	validateTextDocument(change.document);
// });

// The settings interface describe the server relevant settings part
// interface Settings {
// 	storyScript: ExampleSettings;
// }

// These are the example settings we defined in the client's package.json
// file
// interface ExampleSettings {
// 	maxNumberOfProblems: number;
// }

// hold the maxNumberOfProblems setting
// let maxNumberOfProblems: number;
// The settings have changed. Is send on server activation
// as well.
// connection.onDidChangeConfiguration((change) => {
// 	let settings = <Settings>change.settings;
// 	maxNumberOfProblems = settings.storyScript.maxNumberOfProblems || 100;
// 	// Revalidate any open text documents
// 	documents.all().forEach(validateTextDocument);
// });

// function validateTextDocument(textDocument: TextDocument): void {
// 	// const documentText = textDocument.getText();
// 	// let lines = documentText.split(/\r?\n/g);
// 	// // tokenizeCode(documentText);

// 	// let diagnostics: Diagnostic[] = [];
// 	// let problems = 0;
// 	// for (var i = 0; i < lines.length && problems < maxNumberOfProblems; i++) {
// 	// 	let line = lines[i];
// 	// 	let index = line.indexOf('typescript');
// 	// 	if (index >= 0) {
// 	// 		problems++;
// 	// 		diagnostics.push({
// 	// 			severity: DiagnosticSeverity.Warning,
// 	// 			range: {
// 	// 				start: { line: i, character: index },
// 	// 				end: { line: i, character: index + 10 }
// 	// 			},
// 	// 			message: `${line.substr(index, 10)} should be spelled TypeScript`,
// 	// 			source: 'ex'
// 	// 		}); 
// 	// 	}
// 	// }
// 	// // Send the computed diagnostics to VSCode.
// 	// connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
// }

// connection.onDidChangeWatchedFiles((_change) => {
// 	// Monitored files have change in VSCode
// 	// connection.console.log('We received an file change event');
// 	// console.log('some test console message. Jack Sea');
// });

connection.onExecuteCommand((params: ExecuteCommandParams): any => {
	connection.window.showInformationMessage('on execute called!!!' + JSON.stringify(params));
});

// This handler provides the initial list of the completion items.
// connection.onCompletion((_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {

//   const uri = _textDocumentPosition.textDocument.uri;

//   let result: CompletionItem[] = [];
//   strings.forEach(word => {
//     result = [
//       ...result,
//       {
//         label: word,
//         kind: CompletionItemKind.Text,
//         data: word
//       }
//     ]
//   });
  
//   return result;

//   // The pass parameter contains the position of the text document in 
// 	// which code complete got requested. For the example we ignore this
//   // info and always provide the same completion items.
// 	// const result = [
// 	// 	{
// 	// 		label: 'TypeScript',
// 	// 		kind: CompletionItemKind.Text,
// 	// 		data: 1
// 	// 	},
// 	// 	{
// 	// 		label: 'JavaScript',
// 	// 		kind: CompletionItemKind.Text,
// 	// 		data: 2
// 	// 	},
// 	// 	{
// 	// 		label: 'StoryScript',
// 	// 		kind: CompletionItemKind.Text,
// 	// 		data: 3
// 	// 	},
// 	// ];

//   // return result;
// });

// This handler resolve additional information for the item selected in
// the completion list.
// connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
//   if (item.data === 1) {
// 		item.detail = 'TypeScript details',
// 		item.documentation = 'TypeScript documentation'
// 	} else if (item.data === 2) {
// 		item.detail = 'JavaScript details',
// 		item.documentation = 'JavaScript documentation'
// 	} else if (item.data === 3) {
// 		item.detail = 'StoryScript details',
// 		item.documentation = 'StoryScript documentation'
// 	}
// 	return item;
// });

// connection.onDidOpenTextDocument((params) => {
// 	// A text document got opened in VSCode.
// 	// params.uri uniquely identifies the document. For documents store on disk this is a file URI.
// 	// params.text the initial full content of the document.
//   // connection.console.log(`${params.textDocument.uri} opened.`);
//   updateStrings();
// });
// connection.onDidChangeTextDocument((params) => {
// 	// The content of a text document did change in VSCode.
// 	// params.uri uniquely identifies the document.
// 	// params.contentChanges describe the content changes to the document.
// 	// connection.console.log(`${params.textDocument.uri} changed: ${JSON.stringify(params.contentChanges)}`);
//   updateStrings();
// });
// connection.onDidCloseTextDocument((params) => {
// 	// A text document got closed in VSCode.
// 	// params.uri uniquely identifies the document.
// 	// connection.console.log(`${params.textDocument.uri} closed.`);
//   updateStrings();
// });

// Listen on the connection
connection.listen();
