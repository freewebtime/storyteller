/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import * as path from 'path';
import * as vscode from 'vscode';

import { workspace, ExtensionContext } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/lib/main';
import { storyscript } from 'storyscript';

const stsCompile = () => {
  storyscript.compile(vscode.workspace.rootPath, './stsconfig.json');
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

const initCommands = (context: ExtensionContext) => {
  vscode.commands.registerCommand('extension.storyscript.getProgramName', config => {
    return vscode.window.showInputBox({
      placeHolder: "Please enter the name of a markdown file in the workspace folder",
      value: "readme.md"
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
			configurationSection: 'storyscript',
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
  initCommands(context);
  initInsertTextCommands(context);
	initLanguageServer(context);
	initStsCompileCommand(context);
}
