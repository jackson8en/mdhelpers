const vscode = require('vscode');
const mdh = require('./mdhelpers');

let statusBarItem;

function activate(context) {
  mdh.createConfigFile();
  let disposable = vscode.commands.registerCommand(
    'mdhelper-id-placer.insertNext',
    mdh.insertNextTag
  );
  context.subscriptions.push(disposable);

  // Create and show the status bar item
  statusBarItem = mdh.initStatusBarItem() 
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);
  context.subscriptions.push(mdh.statusMenuDisposable);
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