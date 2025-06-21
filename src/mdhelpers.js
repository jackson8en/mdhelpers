const vscode = require('vscode');

const fs = require('fs');
const path = require('path');

let configPath = null;
let configCache = null;
let configWatcher = null;

async function getConfigPath() {
  if (configPath) return configPath;
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) return null;
  const workspacePath = folders[0].uri.fsPath;
  const vscodeDir = path.join(workspacePath, '.vscode');
  configPath = path.join(vscodeDir, 'mdhelper.json');

  // Add watcher to clear cache if config file changes
  if (!configWatcher && fs.existsSync(configPath)) {
    configWatcher = fs.watchFile(configPath, () => {
      configCache = null;
    });
  }

  return configPath;
}

async function readConfig() {
  if (configCache) return configCache;
  const cPath = await getConfigPath();
  if (!cPath || !fs.existsSync(cPath)) return null;
  let raw;
  try {
    raw = fs.readFileSync(cPath, 'utf8');
  } catch (err) {
    vscode.window.showErrorMessage(`Error reading config file: ${err.message}`);
    return null;
  }
  try {
    configCache = JSON.parse(raw);
    return configCache;
  } catch (err) {
    vscode.window.showErrorMessage(`Invalid JSON in config file: ${err.message}`);
    return null;
  }
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
    tag: `${config.nextTag.numberStr}`,
    prefix: config.nextTag.prefix,
    suffix: config.nextTag.suffix || '',
    numberStr: config.nextTag.numberStr
  };
}

async function insertNextTag(context) {
  // Check config
  const config = await readConfig();
  if (!config || !config.nextTag) {
    // Open the status bar menu if config or nextTag is missing
    await vscode.commands.executeCommand('mdhelper-id-placer.statusBarMenu');
    return;
  }

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
        editBuilder.insert(selection.active, `${found.prefix}${found.tag}${found.suffix}`);
      }
    });

    // Increment the number and update config
    const number = parseInt(found.numberStr, 10) + 1;
    const paddedNumber = number.toString().padStart(found.numberStr.length, '0');
    const newNextTag = { prefix: found.prefix, numberStr: paddedNumber, suffix: found.suffix };

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
      { label: 'DO NOT USE Configure (UI)', action: 'configure' },
      { label: 'Configure (Quick)', action: 'configureQuick' },
      { label: 'View Shortcuts', action: 'viewShortcuts' },
    ];
    const picked = await vscode.window.showQuickPick(options, {
      placeHolder: 'MDHelper Actions'
    });
    if (!picked) return;
    switch (picked.action) {
      case 'configure':
        // const extension = require('./extension');
        // extension.activate({ subscriptions: [] });
        // vscode.commands.executeCommand('mdhelper-id-placer.configure');
        vscode.window.showInformationMessage('Configure (UI) selected');
        break;
      case 'configureQuick':
        vscode.window.showInformationMessage('Quick Configure selected');
        await promptForQuickConfigure().then(async (tagStyle) => {
          writeTagStyleToConfig(tagStyle);
          vscode.window.showInformationMessage(`Quick Configure saved: ${tagStyle}`);
        });
        break;
      case 'viewShortcuts':
        vscode.window.showInformationMessage('View Shortcuts selected');
        // TODO: Implement your logic here
        break;
    }
  }
);

async function promptForQuickConfigure() {
  return await vscode.window.showInputBox({
    prompt: 'Enter Intial Tag',
    value: '@id001'
  }) || '@id001';
}

async function writeTagStyleToConfig(tagStyle) {
  const config = await readConfig() || {};
  // Updated regex to match any non-digit prefix and a number
  const match = tagStyle.match(/^([^\d]+)(\d+)([^\d]*)$/);
  if (!match) {
    vscode.window.showErrorMessage('Invalid tag format. Example: @id001 or @££@abc0001');
    return;
  }
  const [, prefix, numberStr, suffix] = match;
  config.nextTag = { prefix, numberStr, suffix, context: "file" };
  await writeConfig(config);
}

module.exports = {
  insertNextTag,
  initStatusBarItem,
  statusMenuDisposable
};
