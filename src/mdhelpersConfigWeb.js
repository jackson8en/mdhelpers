const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

/**
 * Opens a webview panel to collect config from the user and saves it to mdhelper.json.
 * @param {vscode.ExtensionContext} context
 */
function showCustomConfigWebview(context) {
  const panel = vscode.window.createWebviewPanel(
    'mdhelperConfig',
    'Configure Next Tag',
    vscode.ViewColumn.Active,
    { enableScripts: true }
  );

  panel.webview.html = `
    <!DOCTYPE html>
    <html lang="en">
    <body>
      <form id="configForm">
        <label>Prefix: <input id="prefix" value="id" /></label><br/>
        <label>Number: <input id="numberStr" value="001" /></label><br/>
        <label>Scope:
          <input type="radio" name="scope" value="workspace" checked /> Workspace
          <input type="radio" name="scope" value="file" /> File
        </label><br/>
        <button type="submit">Save</button>
      </form>
      <script>
        const vscode = acquireVsCodeApi();
        document.getElementById('configForm').onsubmit = (e) => {
          e.preventDefault();
          vscode.postMessage({
            prefix: document.getElementById('prefix').value,
            numberStr: document.getElementById('numberStr').value,
            scope: document.querySelector('input[name="scope"]:checked').value
          });
        };
      </script>
    </body>
    </html>
  `;

  panel.webview.onDidReceiveMessage(
    async message => {
      // Save config to .vscode/mdhelper.json in the workspace
      const folders = vscode.workspace.workspaceFolders;
      if (!folders || folders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder found.');
        panel.dispose();
        return;
      }
      const workspacePath = folders[0].uri.fsPath;
      const vscodeDir = path.join(workspacePath, '.vscode');
      const cPath = path.join(vscodeDir, 'mdhelper.json');
      if (!fs.existsSync(vscodeDir)) {
        fs.mkdirSync(vscodeDir);
      }
      const config = {
        nextTag: {
          prefix: message.prefix || 'id',
          numberStr: message.numberStr || '001'
        },
        scope: message.scope === 'file' ? 'file' : 'workspace'
      };
      fs.writeFileSync(cPath, JSON.stringify(config, null, 2));
      vscode.window.showInformationMessage('mdhelper.json saved!');
      panel.dispose();
    },
    undefined,
    context.subscriptions
  );
}

module.exports = {
  showCustomConfigWebview
};