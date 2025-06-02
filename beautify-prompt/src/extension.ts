// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
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
	
	// Register the command to check for and auto-beautify prompts with the prefix
	const autoBeautifyPrompt = vscode.commands.registerCommand('beautify-prompt.checkAutoBeautify', async () => {
		await checkClipboardForAutoBeautify();
	});

	context.subscriptions.push(beautifyEditorPrompt);
	context.subscriptions.push(beautifyChatPrompt);
	context.subscriptions.push(autoBeautifyPrompt);
}

// This method is called when your extension is deactivated
export function deactivate() {}

/**
 * Handles the beautification of prompts in the editor
 */
async function handleEditorPromptBeautification(): Promise<void> {
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
	} catch (error) {
		vscode.window.showErrorMessage(`Failed to beautify prompt: ${error instanceof Error ? error.message : String(error)}`);
	}
}

/**
 * Handles the beautification of prompts in GitHub Copilot Chat
 */
async function handleChatPromptBeautification(): Promise<void> {
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
	} catch (error) {
		vscode.window.showErrorMessage(`Failed to beautify prompt: ${error instanceof Error ? error.message : String(error)}`);
	}
}

/**
 * Beautifies a GitHub Copilot prompt to make it more effective
 * @param originalPrompt The original user prompt text
 * @returns Beautified prompt text
 */
async function beautifyPromptText(originalPrompt: string): Promise<string> {
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
	} catch (error) {
		console.error('Error beautifying prompt:', error);
		throw new Error('Failed to beautify prompt. Please try again.');
	}
}

/**
 * Simulates GitHub Copilot's prompt beautification
 * In a real extension, this could be replaced with a call to an actual API
 */
async function simulateCopilotBeautification(originalPrompt: string): Promise<string> {
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
function checkAndProcessAutoBeautifyPrefix(promptText: string): { hasPrefix: boolean; processedPrompt: string } {
	// Get the configuration
	const config = vscode.workspace.getConfiguration('beautify-prompt');
	const enableAutoBeautify = config.get<boolean>('enableAutoBeautify', true);
	const autoBeautifyPrefix = config.get<string>('autoBeautifyPrefix', 'beautify prompt:').toLowerCase();
	
	// If auto-beautify is disabled, return the original prompt
	if (!enableAutoBeautify) {
		return { hasPrefix: false, processedPrompt: promptText };
	}
	
	// Check if the prompt starts with the prefix (case insensitive)
	const lowerCasePrompt = promptText.toLowerCase();
	if (lowerCasePrompt.startsWith(autoBeautifyPrefix)) {
		// Remove the prefix from the prompt (use the original case)
		const processedPrompt = promptText.substring(autoBeautifyPrefix.length).trim();
		return { hasPrefix: true, processedPrompt };
	}
	
	// Return the original prompt if no prefix is found
	return { hasPrefix: false, processedPrompt: promptText };
}

/**
 * Checks the clipboard content for the auto-beautify prefix and beautifies it if found
 * This can be used to auto-beautify prompts as they're being typed
 */
async function checkClipboardForAutoBeautify(): Promise<void> {
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
		} catch (error) {
			console.error('Error during auto-beautification:', error);
		}
	}
}
