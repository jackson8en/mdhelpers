const vscode = require('vscode');
const { insertNextTag } = require('./nextTagHelper');

let statusBarItem;

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    'mdhelper-id-placer.insertNext',
    insertNextTag
  );
  context.subscriptions.push(disposable);

  // Create and show the status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = 'hello MKHelpers';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);
}

function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}

module.exports = {
  activate,
  deactivate
};