# vscode-next-inserter

## Overview
The `vscode-next-inserter` is a Visual Studio Code extension that allows users to easily insert text associated with a specific `@next[<number>]` pattern in their markdown files. This extension automatically finds the next available number, inserts the corresponding text at the cursor position, and increments the value for future use.

## Features
- Search for the `@next[<number>]` pattern in the current document.
- Insert the corresponding text at the current cursor position.
- Automatically increment the number in the `@next` pattern for future references.

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd vscode-next-inserter
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Open the project in Visual Studio Code.

## Usage
1. Open a markdown file in Visual Studio Code.
2. Place the cursor where you want to insert the text.
3. Use the command palette (Ctrl+Shift+P) and type `Insert Next` to execute the command.
4. The corresponding text will be inserted at the cursor position, and the `@next` number will be incremented.

## Keyboard Shortcuts
You can also bind the command to a keyboard shortcut for quicker access. To do this, go to `File > Preferences > Keyboard Shortcuts` and search for `Insert Next`. Assign your preferred key combination.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bugs.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.