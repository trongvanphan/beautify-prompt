/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(__webpack_require__(1));
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    console.log('Extension "beautify-prompt" is now active');
    // Register the beautifyPrompt command for editor text
    const beautifyEditorPrompt = vscode.commands.registerCommand('beautify-prompt.beautifyPrompt', async () => {
        await handleEditorPromptBeautification();
    });
    // Register the beautifyChatPrompt command for Copilot Chat
    const beautifyChatPrompt = vscode.commands.registerCommand('beautify-prompt.beautifyChatPrompt', async () => {
        await handleChatPromptBeautification();
    });
    context.subscriptions.push(beautifyEditorPrompt);
    context.subscriptions.push(beautifyChatPrompt);
}
// This method is called when your extension is deactivated
function deactivate() { }
/**
 * Handles the beautification of prompts in the editor
 */
async function handleEditorPromptBeautification() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('No editor is active');
        return;
    }
    // Get the selected text
    const selection = editor.selection;
    if (selection.isEmpty) {
        vscode.window.showInformationMessage('Please select text to beautify');
        return;
    }
    const originalPrompt = editor.document.getText(selection);
    try {
        // Show a progress notification
        const beautifiedPrompt = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Beautify prompt...",
            cancellable: false
        }, async (progress) => {
            // Call our prompt beautifier function
            return await beautifyPromptText(originalPrompt);
        });
        // Replace the selected text with the beautified prompt
        editor.edit(editBuilder => {
            editBuilder.replace(selection, beautifiedPrompt);
        });
        vscode.window.showInformationMessage('Prompt beautified successfully!');
    }
    catch (error) {
        vscode.window.showErrorMessage(`Failed to beautify prompt: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Handles the beautification of prompts in GitHub Copilot Chat
 */
async function handleChatPromptBeautification() {
    // Try to find the Copilot Chat input box
    // Note: Since there's no public API for Copilot Chat yet, we'll use clipboard as an intermediate
    // Simulate the keyboard shortcut sequence to select all text in the chat input
    await vscode.commands.executeCommand('editor.action.clipboardCopyWithSyntaxHighlightingAction');
    // Get the clipboard content
    const clipboardText = await vscode.env.clipboard.readText();
    if (!clipboardText || clipboardText.trim() === '') {
        vscode.window.showInformationMessage('No text found in the Copilot Chat input');
        return;
    }
    try {
        // Show a progress notification
        const beautifiedPrompt = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Beautify Copilot Chat prompt...",
            cancellable: false
        }, async (progress) => {
            // Call our prompt beautifier function
            return await beautifyPromptText(clipboardText);
        });
        // Write the beautified prompt back to clipboard
        await vscode.env.clipboard.writeText(beautifiedPrompt);
        // Show instructions for pasting
        vscode.window.showInformationMessage('Prompt beautified! Press Ctrl+V/Cmd+V to paste it into the chat input.');
    }
    catch (error) {
        vscode.window.showErrorMessage(`Failed to beautify prompt: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Beautifies a GitHub Copilot prompt to make it more effective
 * @param originalPrompt The original user prompt text
 * @returns Beautified prompt text
 */
async function beautifyPromptText(originalPrompt) {
    // Creating a beautified version of the prompt
    const promptParts = [
        // Start with a clear definition of what we're beautifying
        "I need to improve this prompt for GitHub Copilot to generate better code:",
        `Original prompt: "${originalPrompt}"`,
        // Add beautifier instructions
        "Please beautify this prompt by:",
        "1. Making it more specific and clearer",
        "2. Adding necessary context and constraints",
        "3. Indicating expected output format",
        "4. Breaking it into logical steps if needed",
        "5. Removing ambiguity",
        // Request format
        "Return only the beautified prompt text without explanations or additional text."
    ];
    // Construct prompt for language model
    const beautifiedPromptRequest = promptParts.join("\n\n");
    try {
        // Here we would ideally call the GitHub Copilot API directly
        // Since there's no direct API for prompt beautification, we're implementing a local beautifier
        // For now, we'll implement a simple beautification logic
        // In a production extension, you might want to use a proper AI service API
        const beautifiedPrompt = await simulateCopilotBeautification(originalPrompt);
        return beautifiedPrompt;
    }
    catch (error) {
        console.error('Error beautifying prompt:', error);
        throw new Error('Failed to beautify prompt. Please try again.');
    }
}
/**
 * Simulates GitHub Copilot's prompt beautification
 * In a real extension, this could be replaced with a call to an actual API
 */
async function simulateCopilotBeautification(originalPrompt) {
    // Simple beautifications for demonstration
    const improvedPrompt = originalPrompt.trim();
    // Add structure if not present
    let beautifiedPrompt = improvedPrompt;
    if (!improvedPrompt.includes('Task:') && !improvedPrompt.includes('Goal:')) {
        beautifiedPrompt = `Task: ${improvedPrompt}`;
    }
    // Add context section if missing
    if (!improvedPrompt.includes('Context:')) {
        beautifiedPrompt += '\n\nContext: I\'m working with the latest version of the language/framework.';
    }
    // Add expected output if missing
    if (!improvedPrompt.includes('Expected output:') &&
        !improvedPrompt.includes('Return:') &&
        !improvedPrompt.includes('Output:')) {
        beautifiedPrompt += '\n\nExpected output: Well-structured, documented code that follows best practices.';
    }
    // Add specificity if the prompt is very short
    if (improvedPrompt.split(' ').length < 5) {
        beautifiedPrompt += '\n\nPlease provide a comprehensive solution with appropriate error handling and comments.';
    }
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return beautifiedPrompt;
}


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map