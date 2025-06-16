const vscode = require('vscode');

/**
 * Finds the first @next[<prefix><number>] tag in the document.
 * Returns { tag, tagLine, prefix, numberStr } or null if not found.
 */
function findNextTag(doc) {
  for (let line = 0; line < doc.lineCount; line++) {
    const text = doc.lineAt(line).text;
    const match = text.match(/@next\[([a-zA-Z_]+)(\d+)\]/);
    if (match) {
      return {
        tag: `${match[1]}${match[2]}`,
        tagLine: line,
        prefix: match[1],
        numberStr: match[2]
      };
    }
  }
  return null;
}

/**
 * Increments the number in the @next[...] tag, preserving leading zeros.
 */
function incrementNextTag(prefix, numberStr) {
  const number = parseInt(numberStr, 10) + 1;
  const paddedNumber = number.toString().padStart(numberStr.length, '0');
  return `@next[${prefix}${paddedNumber}]`;
}

async function insertNextTag() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor!');
    return;
  }

  const doc = editor.document;
  const found = findNextTag(doc);

  if (found) {
    // Insert @<prefix><number> at cursor(s)
    await editor.edit(editBuilder => {
      for (const selection of editor.selections) {
        editBuilder.insert(selection.active, `@${found.tag}`);
      }
    });

    // Increment the number in @next[...] on the found line
    const newNextTag = incrementNextTag(found.prefix, found.numberStr);
    const lineText = doc.lineAt(found.tagLine).text;
    const updatedLine = lineText.replace(/@next\[[a-zA-Z_]+\d+\]/, newNextTag);

    const range = new vscode.Range(
      new vscode.Position(found.tagLine, 0),
      new vscode.Position(found.tagLine, lineText.length)
    );

    await editor.edit(editBuilder => {
      editBuilder.replace(range, updatedLine);
    });
  } else {
    vscode.window.showErrorMessage('No @next[<prefix><number>] found in the file.');
  }
}

module.exports = {
  insertNextTag
};