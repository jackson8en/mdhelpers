const vscode = require('vscode');

const fs = require('fs');
const path = require('path');

let configPath = null;
let configCache = null;

async function getConfigPath() {
  if (configPath) return configPath;
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) return null;
  const workspacePath = folders[0].uri.fsPath;
  const vscodeDir = path.join(workspacePath, '.vscode');
  configPath = path.join(vscodeDir, 'mdhelper.json');
  return configPath;
}

async function readConfig() {
  if (configCache) return configCache;
  const cPath = await getConfigPath();
  if (!cPath || !fs.existsSync(cPath)) return null;
  const raw = fs.readFileSync(cPath, 'utf8');
  configCache = JSON.parse(raw);
  return configCache;
}

async function writeConfig(newConfig) {
  const cPath = await getConfigPath();
  if (!cPath) return;
  fs.writeFileSync(cPath, JSON.stringify(newConfig, null, 2));
  configCache = newConfig;
}

/**
 * Finds the first @next[<prefix><number>] tag in the document.
 * Returns { tag, tagLine, prefix, numberStr } or null if not found.
 */
async function findNextTag() {
  const config = await readConfig();
  if (!config || !config.nextTag) return null;
  return {
    tag: `${config.nextTag.prefix}${config.nextTag.numberStr}`,
    prefix: config.nextTag.prefix,
    numberStr: config.nextTag.numberStr
  };
}

async function insertNextTag() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor!');
    return;
  }

  const found = await findNextTag();

  if (found) {
    // Insert @<prefix><number> at cursor(s)
    await editor.edit(editBuilder => {
      for (const selection of editor.selections) {
        editBuilder.insert(selection.active, `@${found.tag}`);
      }
    });

    // Increment the number and update config
    const number = parseInt(found.numberStr, 10) + 1;
    const paddedNumber = number.toString().padStart(found.numberStr.length, '0');
    const newNextTag = { prefix: found.prefix, numberStr: paddedNumber };

    const config = await readConfig();
    config.nextTag = newNextTag;
    await writeConfig(config);
  } else {
    vscode.window.showErrorMessage('No nextTag found in config.');
  }
}

function initStatusBarItem() {
  let sbi = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
  sbi.text = 'hello MKHelpers';
  sbi.command = 'mdhelper-id-placer.statusBarMenu';
  return sbi;
}

// Register the status bar menu command
let statusMenuDisposable = vscode.commands.registerCommand(
  'mdhelper-id-placer.statusBarMenu',
  async () => {
    const options = [
      { label: 'Configure NextTag', action: 'configure' },
      { label: 'Insert Many', action: 'insertMany' },
      { label: 'Hello MKHelpers', action: 'hello' }
    ];
    const picked = await vscode.window.showQuickPick(options, {
      placeHolder: 'Choose an action'
    });
    if (!picked) return;
    switch (picked.action) {
      case 'configure':
        const extension = require('./extension');
        extension.activate({ subscriptions: [] });
        vscode.commands.executeCommand('mdhelper-id-placer.configure');
        break;
      case 'insertMany':
        vscode.window.showInformationMessage('Insert Many selected');
        // TODO: Implement your logic here
        break;
      case 'hello':
        vscode.window.showInformationMessage('Hello MKHelpers!');
        break;
    }
  }
);

async function promptForTagStyle() {
  return await vscode.window.showInputBox({
    prompt: 'Enter the prefix for @next[] tags',
    value: 'id'
  }) || 'id';
}

module.exports = {
  insertNextTag,
  initStatusBarItem,
  statusMenuDisposable
};
