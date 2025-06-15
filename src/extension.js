const vscode = require('vscode');

function activate(context) {
  let disposable = vscode.commands.registerCommand('mdhelper-id-placer.insertNext', async function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor!');
      return;
    }

    const doc = editor.document;
    let found = false;
    let tag = null;
    let tagLine = null;
    let prefix = null;
    let numberStr = null;

    // Search the whole file for @next[<prefix><number>]
    for (let line = 0; line < doc.lineCount; line++) {
      const text = doc.lineAt(line).text;
      const match = text.match(/@next\[([a-zA-Z_]+)(\d+)\]/);
      if (match) {
        prefix = match[1];
        numberStr = match[2];
        tag = `${prefix}${numberStr}`;
        tagLine = line;
        found = true;
        break;
      }
    }

    if (found && tag) {
      // Insert @<prefix><number> at cursor(s)
      await editor.edit(editBuilder => {
        for (const selection of editor.selections) {
          editBuilder.insert(selection.active, `@${tag}`);
        }
      });

      // Increment the number in @next[...] on the found line, preserving leading zeros
      const number = parseInt(numberStr, 10) + 1;
      const paddedNumber = number.toString().padStart(numberStr.length, '0');
      const newNextTag = `@next[${prefix}${paddedNumber}]`;
      const lineText = doc.lineAt(tagLine).text;
      const updatedLine = lineText.replace(/@next\[[a-zA-Z_]+\d+\]/, newNextTag);

      const range = new vscode.Range(
        new vscode.Position(tagLine, 0),
        new vscode.Position(tagLine, lineText.length)
      );

      await editor.edit(editBuilder => {
        editBuilder.replace(range, updatedLine);
      });
    } else {
      vscode.window.showErrorMessage('No @next[<prefix><number>] found in the file.');
    }
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};