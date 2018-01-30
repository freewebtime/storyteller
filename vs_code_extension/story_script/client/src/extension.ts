/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import * as path from 'path';
import * as vscode from 'vscode';

import { workspace, ExtensionContext } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient';
import { compileStoryScript } from './story-script/StoryScript';
import { ICodeToken } from './story-script/api/ICodeToken';

const stsCompile = () => {
	const editor = vscode.window.activeTextEditor;
	const fileContent = editor.document.getText();
	const compiled = compileStoryScript(fileContent);
}

const initShowHtmlPreviewCommand = (context: ExtensionContext) => {
	let previewUri = vscode.Uri.parse('sts-preview://authority/sts-preview');
	
	class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
		private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

		public provideTextDocumentContent(uri: vscode.Uri): string {
			return this.createCssSnippet();
		}

		get onDidChange(): vscode.Event<vscode.Uri> {
			return this._onDidChange.event;
		}

		public update(uri: vscode.Uri) {
			this._onDidChange.fire(uri);
		}

		private createCssSnippet() {
			let editor = vscode.window.activeTextEditor;
			if (!(editor.document.languageId === 'storyscript')) {
				return this.errorSnippet("Active editor doesn't show a CSS document - no properties to preview.")
			}
			return this.extractSnippet();
		}

		private extractSnippet(): string {
			const editor = vscode.window.activeTextEditor;
			const fileContent = editor.document.getText();
			const compiled = compileStoryScript(fileContent);

			return `
				<body>
					${compiled.tokens.map((token) => { return JSON.stringify(token); }).join('<br/><br/>')}
				</body>`;
		}

		private errorSnippet(error: string): string {
			return `
				<body>
					${error}
				</body>`;
		}
	}

	let provider = new TextDocumentContentProvider();
	let registration = vscode.workspace.registerTextDocumentContentProvider('sts-preview', provider);

	vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
		if (e.document === vscode.window.activeTextEditor.document) {
			provider.update(previewUri);
		}
	});

	// vscode.window.onDidChangeTextEditorSelection((e: vscode.TextEditorSelectionChangeEvent) => {
	// 	if (e.textEditor === vscode.window.activeTextEditor) {
	// 		provider.update(previewUri);
	// 	}
	// });

	let disposable = vscode.commands.registerCommand('extension.showHtmlPreview', () => {
		return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two, 'Sts Property Preview').then((success) => {
		}, (reason) => {
			vscode.window.showErrorMessage(reason);
		});
	});
}

const initStsCompileCommand = (context: ExtensionContext) => {
	var disposable = vscode.commands.registerCommand('extension.stsCompile', stsCompile);
	context.subscriptions.push(disposable);
}

const initLanguageServer = (context: ExtensionContext) => {
	// The server is implemented in node
	let serverModule = context.asAbsolutePath(path.join('server', 'server.js'));
	// The debug options for the server
	let debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
	}

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'storyscript' }],
		synchronize: {
			// Synchronize the setting section 'languageServerExample' to the server
			configurationSection: 'storyScript',
			// Notify the server about file changes to '.clientrc files contain in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	}

	// Create the language client and start the client.
	let disposable = new LanguageClient('storyScript', 'Language Server Example', serverOptions, clientOptions).start();

	// Push the disposable to the context's subscriptions so that the 
	// client can be deactivated on extension deactivation
	context.subscriptions.push(disposable);
}

export function activate(context: ExtensionContext) {
	initLanguageServer(context);
	initStsCompileCommand(context);
	initShowHtmlPreviewCommand(context);
	
	stsCompile();
}
