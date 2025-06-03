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
    // Create status bar item for the @bp agent
    const bpAgentStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    bpAgentStatusBarItem.text = "$(sparkle) @bp";
    bpAgentStatusBarItem.tooltip = "Beautify Prompt Agent (@bp) - Click to beautify prompt";
    bpAgentStatusBarItem.command = 'beautify-prompt.bpAgentBeautify';
    context.subscriptions.push(bpAgentStatusBarItem);
    // Register the beautifyPrompt command for editor text
    const beautifyEditorPrompt = vscode.commands.registerCommand('beautify-prompt.beautifyPrompt', async () => {
        await handleEditorPromptBeautification();
    });
    // Register the beautifyChatPrompt command for Copilot Chat
    const beautifyChatPrompt = vscode.commands.registerCommand('beautify-prompt.beautifyChatPrompt', async () => {
        await handleChatPromptBeautification();
    });
    // Register the command to check for and auto-beautify prompts with the prefix
    const autoBeautifyPrompt = vscode.commands.registerCommand('beautify-prompt.checkAutoBeautify', async () => {
        await checkClipboardForAutoBeautify();
    });
    // Register a specific command for @bp agent beautification
    const bpAgentBeautify = vscode.commands.registerCommand('beautify-prompt.bpAgentBeautify', async () => {
        await handleBpAgentBeautification();
    });
    // Set up a timer to periodically check clipboard for @bp agent commands
    const clipboardCheckInterval = setInterval(async () => {
        await checkClipboardForBpAgent(bpAgentStatusBarItem);
    }, 1000); // Check every second
    // Make sure to clear interval when extension is deactivated
    context.subscriptions.push({ dispose: () => clearInterval(clipboardCheckInterval) });
    context.subscriptions.push(beautifyEditorPrompt);
    context.subscriptions.push(beautifyChatPrompt);
    context.subscriptions.push(autoBeautifyPrompt);
    context.subscriptions.push(bpAgentBeautify);
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
    // Check if the prompt has the auto-beautify prefix
    const { hasPrefix, processedPrompt } = checkAndProcessAutoBeautifyPrefix(originalPrompt);
    try {
        // Show a progress notification
        const enhancedPrompt = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Beautify prompt...",
            cancellable: false
        }, async (progress) => {
            // Call our prompt beautifier function
            return await beautifyPromptText(processedPrompt);
        });
        // Replace the selected text with the beautified prompt
        editor.edit(editBuilder => {
            editBuilder.replace(selection, enhancedPrompt);
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
    // Check if the prompt has the auto-beautify prefix
    const { hasPrefix, processedPrompt } = checkAndProcessAutoBeautifyPrefix(clipboardText);
    try {
        // Show a progress notification
        const enhancedPrompt = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Beautify Copilot Chat prompt...",
            cancellable: false
        }, async (progress) => {
            // Call our prompt beautifier function
            return await beautifyPromptText(processedPrompt);
        });
        // Write the beautified prompt back to clipboard
        await vscode.env.clipboard.writeText(enhancedPrompt);
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
        "I need to improve this prompt for GitHub Copilot to generate better code in a software development context:",
        `Original prompt: "${originalPrompt}"`,
        // Add beautifier instructions specific to software development
        "Please beautify this prompt for optimal code generation by:",
        "1. Making it more specific and clearer with precise programming terminology",
        "2. Adding necessary technical context (language, framework, libraries, versions)",
        "3. Indicating expected output format (function signature, class structure, code style)",
        "4. Breaking it into logical development steps or components",
        "5. Specifying error handling, edge cases, and performance considerations",
        "6. Including any necessary imports, dependencies, or setup requirements",
        "7. Mentioning testing expectations if applicable",
        "8. Providing clarity on design patterns or architectural approaches",
        "9. Defining variable naming conventions or code style preferences",
        // Request format
        "Return only the beautified prompt text without explanations or additional text. Focus exclusively on software development context."
    ];
    // Construct prompt for language model
    const beautifiedPromptRequest = promptParts.join("\n\n");
    try {
        // Here we would ideally call the GitHub Copilot API directly
        // Since there's no direct API for prompt beautification, we're implementing a local beautifier
        // For now, we'll implement a simple beautification logic
        // In a production extension, you might want to use a proper AI service API
        const beautifiedPrompt = await simulateCopilotBeautification(beautifiedPromptRequest);
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
    // Software development-specific enhancements
    const improvedPrompt = originalPrompt.trim();
    // Add task structure if not present
    let enhancedPrompt = improvedPrompt;
    if (!improvedPrompt.includes('Task:') && !improvedPrompt.includes('Goal:')) {
        enhancedPrompt = `Task: ${improvedPrompt}`;
    }
    // Add technical context section if missing
    if (!improvedPrompt.includes('Context:') && !improvedPrompt.includes('Technology:')) {
        enhancedPrompt += '\n\nContext: Using the latest version of JavaScript/TypeScript with modern ES features.';
    }
    // Add language/framework specific details if not mentioned
    if (!improvedPrompt.toLowerCase().includes('javascript') &&
        !improvedPrompt.toLowerCase().includes('typescript') &&
        !improvedPrompt.toLowerCase().includes('python') &&
        !improvedPrompt.toLowerCase().includes('java') &&
        !improvedPrompt.toLowerCase().includes('c#')) {
        enhancedPrompt += '\n\nLanguage: Implement this in TypeScript with strict type checking.';
    }
    // Add expected output format if missing
    if (!improvedPrompt.includes('Expected output:') &&
        !improvedPrompt.includes('Return:') &&
        !improvedPrompt.includes('Output:')) {
        enhancedPrompt += '\n\nExpected output: Well-structured, documented code with proper types and error handling.';
    }
    // Add requirements section if not present
    if (!improvedPrompt.includes('Requirements:')) {
        enhancedPrompt += '\n\nRequirements:';
        enhancedPrompt += '\n1. Code should be maintainable and follow SOLID principles';
        enhancedPrompt += '\n2. Include proper error handling for edge cases';
        enhancedPrompt += '\n3. Optimize for performance where applicable';
        enhancedPrompt += '\n4. Add comprehensive documentation';
    }
    // Add testing expectations if not mentioned
    if (!improvedPrompt.includes('Testing:') && !improvedPrompt.includes('tests')) {
        enhancedPrompt += '\n\nTesting: Include examples of how to test the code.';
    }
    // Add specificity if the prompt is very short
    if (improvedPrompt.split(' ').length < 5) {
        enhancedPrompt += '\n\nPlease provide a comprehensive solution with proper architecture, error handling, and documentation comments.';
    }
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return enhancedPrompt;
}
/**
 * Checks if a prompt starts with the auto-beautify prefix and processes it accordingly
 * @param promptText The original prompt text
 * @returns Object containing whether the prefix was found and the processed prompt
 */
function checkAndProcessAutoBeautifyPrefix(promptText) {
    // Get the configuration
    const config = vscode.workspace.getConfiguration('beautify-prompt');
    const enableAutoBeautify = config.get('enableAutoBeautify', true);
    const autoBeautifyPrefix = config.get('autoBeautifyPrefix', 'beautify prompt:').toLowerCase();
    // If auto-beautify is disabled, return the original prompt
    if (!enableAutoBeautify) {
        return { hasPrefix: false, processedPrompt: promptText };
    }
    // Check if the prompt starts with the prefix (case insensitive)
    const lowerCasePrompt = promptText.toLowerCase();
    // Check for the standard prefix
    if (lowerCasePrompt.startsWith(autoBeautifyPrefix)) {
        // Remove the prefix from the prompt (use the original case)
        const processedPrompt = promptText.substring(autoBeautifyPrefix.length).trim();
        return { hasPrefix: true, processedPrompt };
    }
    // Check for the @bp agent prefix
    const bpAgentPrefix = '@bp';
    if (lowerCasePrompt.startsWith(bpAgentPrefix)) {
        // Remove the @bp prefix from the prompt
        const processedPrompt = promptText.substring(bpAgentPrefix.length).trim();
        return { hasPrefix: true, processedPrompt };
    }
    // Return the original prompt if no prefix is found
    return { hasPrefix: false, processedPrompt: promptText };
}
/**
 * Checks the clipboard content for the auto-beautify prefix and beautifies it if found
 * This can be used to auto-beautify prompts as they're being typed
 */
async function checkClipboardForAutoBeautify() {
    // Get the clipboard content
    const clipboardText = await vscode.env.clipboard.readText();
    if (!clipboardText || clipboardText.trim() === '') {
        return;
    }
    // Check if the prompt has the auto-beautify prefix
    const { hasPrefix, processedPrompt } = checkAndProcessAutoBeautifyPrefix(clipboardText);
    // Only proceed if the prefix is found
    if (hasPrefix) {
        try {
            // Beautify the prompt
            const enhancedPrompt = await beautifyPromptText(processedPrompt);
            // Write the beautified prompt back to clipboard
            await vscode.env.clipboard.writeText(enhancedPrompt);
            // Show a subtle notification
            vscode.window.showInformationMessage('Auto-beautified prompt!', { modal: false });
        }
        catch (error) {
            console.error('Error during auto-beautification:', error);
        }
    }
}
/**
 * Checks the clipboard content specifically for the @bp agent command
 * Shows/hides the status bar item accordingly
 */
async function checkClipboardForBpAgent(statusBarItem) {
    // Get the clipboard content
    const clipboardText = await vscode.env.clipboard.readText();
    if (!clipboardText || clipboardText.trim() === '') {
        statusBarItem.hide();
        return;
    }
    // Specifically check for the @bp agent prefix at the beginning of the input
    const lowerCasePrompt = clipboardText.toLowerCase().trim();
    const bpAgentPrefix = '@bp';
    if (lowerCasePrompt.startsWith(bpAgentPrefix)) {
        // Show the status bar item when @bp is detected
        statusBarItem.show();
    }
    else {
        // Hide it otherwise
        statusBarItem.hide();
    }
}
/**
 * Handles the beautification triggered by the @bp agent command
 * Provides a more agent-like experience with specific feedback
 */
async function handleBpAgentBeautification() {
    // Get the clipboard content
    const clipboardText = await vscode.env.clipboard.readText();
    if (!clipboardText || clipboardText.trim() === '') {
        vscode.window.showInformationMessage('@bp agent: No text found to beautify');
        return;
    }
    // Check specifically for the @bp prefix
    const lowerCasePrompt = clipboardText.toLowerCase().trim();
    const bpAgentPrefix = '@bp';
    if (lowerCasePrompt.startsWith(bpAgentPrefix)) {
        try {
            // Remove the @bp prefix
            const processedPrompt = clipboardText.substring(bpAgentPrefix.length).trim();
            // Show a progress notification with @bp agent branding
            const enhancedPrompt = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "@bp agent: Beautifying prompt...",
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 20, message: "Analyzing prompt structure..." });
                await new Promise(resolve => setTimeout(resolve, 300));
                progress.report({ increment: 30, message: "Enhancing technical details..." });
                await new Promise(resolve => setTimeout(resolve, 300));
                progress.report({ increment: 30, message: "Finalizing improvements..." });
                await new Promise(resolve => setTimeout(resolve, 300));
                // Call our prompt beautifier function
                return await beautifyPromptText(processedPrompt);
            });
            // Write the beautified prompt back to clipboard
            await vscode.env.clipboard.writeText(enhancedPrompt);
            // Show agent-like response
            vscode.window.showInformationMessage('@bp agent: Prompt beautified! Press Ctrl+V/Cmd+V to paste.', { modal: false, detail: "The beautified prompt is now in your clipboard" });
        }
        catch (error) {
            vscode.window.showErrorMessage(`@bp agent error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    else {
        vscode.window.showInformationMessage('@bp agent: Start your prompt with @bp to beautify');
    }
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