// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { beautifyWithExternalAI } from './externalAI';

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

	context.subscriptions.push(beautifyEditorPrompt);
	context.subscriptions.push(beautifyChatPrompt);
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
	
	try {
		// Show a progress notification
		const enhancedPrompt = await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Beautify prompt...",
			cancellable: false
		}, async (progress) => {
			// Call our prompt beautifier function
			return await beautifyPromptText(originalPrompt);
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
	
	try {
		// Show a progress notification
		const enhancedPrompt = await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Beautify Copilot Chat prompt...",
			cancellable: false
		}, async (progress) => {
			// Call our prompt beautifier function
			return await beautifyPromptText(clipboardText);
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
		// Get the beautification method from settings (default to 'promptBoost')
		const config = vscode.workspace.getConfiguration('beautify-prompt');
		const method = config.get<string>('beautificationMethod', 'promptBoost');
		
		let beautifiedPrompt = '';
		
		// Try different beautification methods based on settings
		if (method === 'promptBoost') {
			// Try using VS Code's promptBoost function if available
			try {
				// This function may be available in future VS Code versions
				const vscodeAny = vscode as any;
				if (vscodeAny.env && vscodeAny.env.promptBoost) {
					console.log('Using VS Code promptBoost API');
					beautifiedPrompt = await vscodeAny.env.promptBoost(originalPrompt);
					if (beautifiedPrompt && beautifiedPrompt.trim() !== '') {
						return beautifiedPrompt;
					}
				}
			} catch (promptBoostError) {
				console.log('promptBoost not available, using fallback:', promptBoostError);
			}
		} else if (method === 'externalAI') {
			// Use external AI service
			try {
				console.log('Using external AI service');
				// Pass both the original prompt and the beautification request
				beautifiedPrompt = await beautifyWithExternalAI(originalPrompt, beautifiedPromptRequest);
				if (beautifiedPrompt && beautifiedPrompt.trim() !== '') {
					return beautifiedPrompt;
				}
			} catch (aiError) {
				console.log('External AI service failed, using fallback:', aiError);
				vscode.window.showWarningMessage(`External AI service error: ${aiError instanceof Error ? aiError.message : String(aiError)}`);
			}
		}
		
		// Use local simulation as fallback
		console.log('Using simulated prompt beautification');
		beautifiedPrompt = await simulateCopilotBeautification(originalPrompt);
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
	// Simple enhancements for demonstration
	const improvedPrompt = originalPrompt.trim();
	
	// Add structure if not present
	let enhancedPrompt = improvedPrompt;
	
	if (!improvedPrompt.includes('Task:') && !improvedPrompt.includes('Goal:')) {
		enhancedPrompt = `Task: ${improvedPrompt}`;
	}
	
	// Add context section if missing
	if (!improvedPrompt.includes('Context:')) {
		enhancedPrompt += '\n\nContext: I\'m working with the latest version of the language/framework.';
	}
	
	// Add expected output if missing
	if (!improvedPrompt.includes('Expected output:') && 
		!improvedPrompt.includes('Return:') &&
		!improvedPrompt.includes('Output:')) {
		enhancedPrompt += '\n\nExpected output: Well-structured, documented code that follows best practices.';
	}
	
	// Add specificity if the prompt is very short
	if (improvedPrompt.split(' ').length < 5) {
		enhancedPrompt += '\n\nPlease provide a comprehensive solution with appropriate error handling and comments.';
	}
	
	// Simulate API call delay
	await new Promise(resolve => setTimeout(resolve, 1000));
	
	return enhancedPrompt;
}
