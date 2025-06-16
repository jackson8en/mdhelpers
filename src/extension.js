const vscode = require('vscode');
const mdh = require('./mdhelpers');
const mdhConfigWeb = require('./mdhelpersConfigWeb');

let statusBarItem;

function activate(context) {
  mdh.createConfigFile();
  let disposable = vscode.commands.registerCommand(
    'mdhelper-id-placer.insertNext',
    mdh.insertNextTag
  );
  context.subscriptions.push(disposable);

  // Register the command to open the configuration webview
  let configWebDisposable = vscode.commands.registerCommand(
    'mdhelper-id-placer.configure',
    mdhConfigWeb.showCustomConfigWebview(context)
  );
  context.subscriptions.push(configWebDisposable);

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