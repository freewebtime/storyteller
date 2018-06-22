/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import * as path from 'path';
import * as vscode from 'vscode';

import { workspace, ExtensionContext } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient';
import { compileStoryscriptModule } from './story-script/StoryScript';

let provider: TextDocumentContentProvider;

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
    const filePath = editor.document.fileName;
    const fileName = path.basename(filePath);
    const compiled = compileStoryscriptModule(fileContent, filePath, fileName);

    return `
        <body>
          <pre>${JSON.stringify(compiled, null, '  ')}</pre>
				</body>`;

    // return `
    // 	<body>
    // 		${compiled.map((token) => { return JSON.stringify(token); }).join('<br/><br/>')}
    // 	</body>`;
  }

  private errorSnippet(error: string): string {
    return `
				<body>
					${error}
				</body>`;
  }
}

const previewUri = vscode.Uri.parse('sts-preview://authority/sts-preview');

const stsCompile = () => {
  if (!vscode.window.activeTextEditor) {
    vscode.window.showInformationMessage('Open a file first');
    return;
  }  

	provider.update(previewUri);
}

const toUpper = (e: vscode.TextEditor, d: vscode.TextDocument, sel: vscode.Selection[]) => {
  e.edit(function (edit) {
    // itterate through the selections and convert all text to Upper
    for (var x = 0; x < sel.length; x++) {
      let txt: string = d.getText(new vscode.Range(sel[x].start, sel[x].end));
      edit.replace(sel[x], txt.toUpperCase());
    }
  });
}

const insertText = (text: string, isMoveCursor: boolean) => {
  if (!vscode.window.activeTextEditor) {
    vscode.window.showInformationMessage('Open a file first to manipulate text selections');
    return;
  }     
  
  let editor = vscode.window.activeTextEditor;
  let selection = editor.selection;

  if (selection) {
    editor.edit(function (edit) {
      edit.insert(selection.start, text);
    })
    .then((value: boolean) => {
      if (value && isMoveCursor) {
        editor.selection = new vscode.Selection(
          new vscode.Position(selection.start.line, selection.start.character + 1),
          new vscode.Position(selection.start.line, selection.start.character + 1)
        )
      }
    })
  }
}

const initShowHtmlPreviewCommand = (context: ExtensionContext) => {
	provider = new TextDocumentContentProvider();
	let registration = vscode.workspace.registerTextDocumentContentProvider('sts-preview', provider);

	// vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
	// 	if (e.document === vscode.window.activeTextEditor.document) {
	// 		provider.update(previewUri);
	// 	}
	// });

	let disposable = vscode.commands.registerCommand('extension.showHtmlPreview', () => {
    
    return vscode.commands.executeCommand(
      'vscode.previewHtml', 
      previewUri, 
      vscode.ViewColumn.Two, 
      vscode.window.activeTextEditor.document.fileName
    ).then((success) => {
      provider.update(previewUri);
		}, (reason) => {
			vscode.window.showErrorMessage(reason);
		});
	});
}

const initStsCompileCommand = (context: ExtensionContext) => {
  var disposable = vscode.commands.registerCommand('extension.stsCompile', stsCompile);
  context.subscriptions.push(disposable);
}

const initInsertTextCommands = (context: ExtensionContext) => {
  let insertCommands: {command: string, text: string, isMoveCursor?: boolean}[] = [
    {
      command: 'extension.sts_insert_{',
      text: '{}',
      isMoveCursor: true,
    },
    {
      command: 'extension.sts_insert_}',
      text: '}'
    },
    {
      command: 'extension.sts_insert_[',
      isMoveCursor: true,
      text: '[]'
    },
    {
      command: 'extension.sts_insert_]',
      text: ']'
    },
    {
      command: 'extension.sts_insert_>>',
      text: '>>'
    },
    {
      command: 'extension.sts_insert_<<',
      text: '<<'
    },
  ]

  insertCommands.map((command) => {
    const cmd: string = command.command;
    const txt: string = command.text;
    const isMoveCursor: boolean = command.isMoveCursor === true;

    const disposable = vscode.commands.registerCommand(cmd, () => insertText(txt, isMoveCursor));
    context.subscriptions.push(disposable);
  })

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
	let disposable = new LanguageClient('storyScript', 'storyscript language server', serverOptions, clientOptions).start();

	// Push the disposable to the context's subscriptions so that the 
	// client can be deactivated on extension deactivation
	context.subscriptions.push(disposable);
}

export function activate(context: ExtensionContext) {
  initInsertTextCommands(context);
	initLanguageServer(context);
	initStsCompileCommand(context);
	initShowHtmlPreviewCommand(context);
  
	// stsCompile();
}
