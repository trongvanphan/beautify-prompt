// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	console.log('Extension "beautify-prompt" is now active');

	// Register the enhancePrompt command
	const disposable = vscode.commands.registerCommand('beautify-prompt.enhancePrompt', async () => {
		const editor = vscode.window.activeTextEditor;
		
		if (!editor) {
			vscode.window.showInformationMessage('No editor is active');
			return;
		}

		// Get the selected text
		const selection = editor.selection;
		if (selection.isEmpty) {
			vscode.window.showInformationMessage('Please select text to enhance');
			return;
		}
		
		const originalPrompt = editor.document.getText(selection);
		
		try {
			// Show a progress notification
			const enhancedPrompt = await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "Enhancing prompt...",
				cancellable: false
			}, async (progress) => {
				// Call our prompt enhancer function
				return await enhancePromptText(originalPrompt);
			});
			
			// Replace the selected text with the enhanced prompt
			editor.edit(editBuilder => {
				editBuilder.replace(selection, enhancedPrompt);
			});
			
			vscode.window.showInformationMessage('Prompt enhanced successfully!');
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to enhance prompt: ${error instanceof Error ? error.message : String(error)}`);
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

/**
 * Enhances a GitHub Copilot prompt to make it more effective
 * @param originalPrompt The original user prompt text
 * @returns Enhanced prompt text
 */
async function enhancePromptText(originalPrompt: string): Promise<string> {
	// Creating an enhanced version of the prompt
	const promptParts = [
		// Start with a clear definition of what we're enhancing
		"I need to improve this prompt for GitHub Copilot to generate better code:",
		`Original prompt: "${originalPrompt}"`,
		
		// Add enhancer instructions
		"Please enhance this prompt by:",
		"1. Making it more specific and clearer",
		"2. Adding necessary context and constraints",
		"3. Indicating expected output format",
		"4. Breaking it into logical steps if needed",
		"5. Removing ambiguity",
		
		// Request format
		"Return only the enhanced prompt text without explanations or additional text."
	];
	
	// Construct prompt for language model
	const enhancedPromptRequest = promptParts.join("\n\n");
	
	try {
		// Here we would ideally call the GitHub Copilot API directly
		// Since there's no direct API for prompt enhancement, we're implementing a local enhancer
		
		// For now, we'll implement a simple enhancement logic
		// In a production extension, you might want to use a proper AI service API
		
		const enhancedPrompt = await simulateCopilotEnhancement(originalPrompt);
		return enhancedPrompt;
	} catch (error) {
		console.error('Error enhancing prompt:', error);
		throw new Error('Failed to enhance prompt. Please try again.');
	}
}

/**
 * Simulates GitHub Copilot's prompt enhancement
 * In a real extension, this could be replaced with a call to an actual API
 */
async function simulateCopilotEnhancement(originalPrompt: string): Promise<string> {
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
