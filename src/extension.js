// import * as vscode from 'vscode';

// export function activate(context: vscode.ExtensionContext) {
//     let disposable = vscode.commands.registerCommand('mdhelper-id-placer.insertNext', async () => {
//         vscode.window.showInformationMessage('Insert Next command executed!');
//         const editor = vscode.window.activeTextEditor;
//         if (!editor) {
//             return;
//         }

//         const document = editor.document;
//         const text = document.getText();
//         const nextPattern = /@next\[(\d+)\]/;
//         const match = text.match(nextPattern);

//         if (match) {
//             const nextNumber = parseInt(match[1], 10);
//             const nextText = `@${nextNumber + 1} Your text here`; // Replace with actual text retrieval logic
//             const newText = text.replace(nextPattern, `@next[${nextNumber + 1}]`);
            
//             const position = editor.selection.active;
//             editor.edit(editBuilder => {
//                 editBuilder.insert(position, nextText);
//                 editBuilder.replace(new vscode.Range(0, 0, document.lineCount, 0), newText);
//             });
//         } else {
//             vscode.window.showInformationMessage('No @next pattern found.');
//         }
//     });

//     context.subscriptions.push(disposable);
// }

// export function deactivate() {}

const vscode = require('vscode');

function activate(context) {
  let disposable = vscode.commands.registerCommand('mdhelper-id-placer.insertNext', async function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor!');
      return;
    }

    const doc = editor.document;
    const text = doc.getText();
    const nextRegex = /@next\[(\d+)\]/;
    const match = nextRegex.exec(text);

    if (!match) {
      vscode.window.showErrorMessage('No @next[number] pattern found in document.');
      return;
    }

    const number = parseInt(match[1], 10);
    const insertText = `@next[${number}]`;

    // Insert at cursor
    await editor.edit(editBuilder => {
      for (const selection of editor.selections) {
        editBuilder.insert(selection.active, insertText);
      }
    });

    // Replace first occurrence with incremented value
    const incremented = `@next[${number + 1}]`;
    const startPos = doc.positionAt(match.index);
    const endPos = doc.positionAt(match.index + match[0].length);

    await editor.edit(editBuilder => {
      editBuilder.replace(new vscode.Range(startPos, endPos), incremented);
    });
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};