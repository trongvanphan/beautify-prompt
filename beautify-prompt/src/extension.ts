// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
// Create a dedicated output channel for debugging
const outputChannel = vscode.window.createOutputChannel('Beautify Prompt');

// Helper function for logging
function logDebug(message: string, ...data: any[]): void {
	const timestamp = new Date().toISOString();
	outputChannel.appendLine(`[${timestamp}] ${message}`);
	if (data && data.length > 0) {
		outputChannel.appendLine(JSON.stringify(data, null, 2));
	}
}

export function activate(context: vscode.ExtensionContext) {
	// Use the output channel for debugging
	logDebug('Extension "beautify-prompt" is now active');
	
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
	
	// Register command to generate a sample custom template
	const generateTemplateCommand = vscode.commands.registerCommand('beautify-prompt.generateTemplateFile', async () => {
		await generateCustomTemplateFile();
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
	context.subscriptions.push(generateTemplateCommand);
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
 * Reads a custom prompt template from a file if it exists
 * @returns The custom prompt template or null if not found
 */
async function readCustomPromptTemplate(): Promise<string | null> {
	try {
		// Get all workspace folders
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length === 0) {
			logDebug('No workspace folders found');
			return null;
		}

		// Check each workspace folder for the .github/bp_actionA.md file
		for (const folder of workspaceFolders) {
			const customPromptPath = vscode.Uri.joinPath(folder.uri, '.github', 'bp_actionA.md');
			
			try {
				// Try to read the file
				logDebug(`Attempting to read custom prompt from: ${customPromptPath.fsPath}`);
				const fileContent = await vscode.workspace.fs.readFile(customPromptPath);
				const templateText = Buffer.from(fileContent).toString('utf8');
				
				logDebug('Custom prompt template found', templateText.substring(0, 100) + '...');
				return templateText;
			} catch (err) {
				// File doesn't exist in this workspace folder, continue to next one
				logDebug(`Custom prompt not found in ${folder.name}: ${err instanceof Error ? err.message : String(err)}`);
			}
		}
		
		// No custom prompt found in any workspace folder
		logDebug('No custom prompt template found in any workspace folder');
		return null;
	} catch (error) {
		logDebug('Error while reading custom prompt template', error);
		return null;
	}
}

/**
 * Beautifies a GitHub Copilot prompt to make it more effective
 * @param originalPrompt The original user prompt text
 * @returns Beautified prompt text
 */
async function beautifyPromptText(originalPrompt: string): Promise<string> {
	// Try to read custom prompt template first
	const customTemplate = await readCustomPromptTemplate();
	
	let beautifiedPromptRequest: string;
	
	if (customTemplate) {
		// Use the custom template if available
		logDebug('Using custom prompt template from .github/bp_actionA.md');
		// Replace placeholder with the actual prompt text
		beautifiedPromptRequest = customTemplate.replace('{{PROMPT}}', originalPrompt);
	} else {
		// Fall back to the default built-in prompt if no custom template is found
		logDebug('Using default built-in prompt template');
		// Creating a beautified version of the prompt with default template
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
		beautifiedPromptRequest = promptParts.join("\n\n");
	}
	
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

/**
 * Checks the clipboard content specifically for the @bp agent command
 * Shows/hides the status bar item accordingly
 */
// Keep track of the last clipboard text to avoid excessive logging
let lastClipboardText = '';

async function checkClipboardForBpAgent(statusBarItem: vscode.StatusBarItem): Promise<void> {
	// Get the clipboard content
	const clipboardText = await vscode.env.clipboard.readText();
	
	// For debugging, log only when there's a change (to avoid console spam)
	if (clipboardText !== lastClipboardText) {
		logDebug('BP Agent monitor: Clipboard changed', 
			clipboardText ? clipboardText.substring(0, 20) + '...' : 'empty');
		lastClipboardText = clipboardText;
	}
	
	if (!clipboardText || clipboardText.trim() === '') {
		statusBarItem.hide();
		return;
	}
	
	// Specifically check for the @bp agent prefix at the beginning of the input
	const lowerCasePrompt = clipboardText.toLowerCase().trim();
	const bpAgentPrefix = '@bp';
	
	if (lowerCasePrompt.startsWith(bpAgentPrefix)) {
		// Show the status bar item when @bp is detected
		logDebug('BP Agent monitor: @bp detected, showing status bar item');
		statusBarItem.show();
	} else {
		// Hide it otherwise
		statusBarItem.hide();
	}
}

/**
 * Handles the beautification triggered by the @bp agent command
 * Provides a more agent-like experience with specific feedback
 */
async function handleBpAgentBeautification(): Promise<void> {
	// Get the clipboard content
	const clipboardText = await vscode.env.clipboard.readText();
	
	logDebug('BP Agent: Clipboard text retrieved', clipboardText ? clipboardText.substring(0, 30) + '...' : 'empty');
	
	if (!clipboardText || clipboardText.trim() === '') {
		vscode.window.showInformationMessage('@bp agent: No text found to beautify');
		return;
	}
	
	// Check specifically for the @bp prefix
	const lowerCasePrompt = clipboardText.toLowerCase().trim();
	const bpAgentPrefix = '@bp';
	
	logDebug('BP Agent: Checking for prefix', { lowerCasePrompt, startsWith: lowerCasePrompt.startsWith(bpAgentPrefix) });
	
	if (lowerCasePrompt.startsWith(bpAgentPrefix)) {
		try {
			// Remove the @bp prefix
			const processedPrompt = clipboardText.substring(bpAgentPrefix.length).trim();
			console.log('BP Agent debug: Processed prompt', processedPrompt);
			
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
			vscode.window.showInformationMessage('@bp agent: Prompt beautified! Press Ctrl+V/Cmd+V to paste.', 
				{ modal: false, detail: "The beautified prompt is now in your clipboard" });
		} catch (error) {
			vscode.window.showErrorMessage(`@bp agent error: ${error instanceof Error ? error.message : String(error)}`);
		}
	} else {
		vscode.window.showInformationMessage('@bp agent: Start your prompt with @bp to beautify');
	}
}

/**
 * Generates a sample custom template file in the .github folder
 */
async function generateCustomTemplateFile(): Promise<void> {
	try {
		// Get all workspace folders
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length === 0) {
			vscode.window.showErrorMessage('No workspace folder found. Please open a folder first.');
			return;
		}

		// Use the first workspace folder
		const folder = workspaceFolders[0];
		
		// Create .github folder if it doesn't exist
		const githubFolderUri = vscode.Uri.joinPath(folder.uri, '.github');
		try {
			await vscode.workspace.fs.createDirectory(githubFolderUri);
		} catch (err) {
			logDebug('Error creating .github directory (might already exist)', err);
			// Continue anyway - the folder might already exist
		}
		
		// Path for the template file
		const templateUri = vscode.Uri.joinPath(githubFolderUri, 'bp_actionA.md');
		
		// Sample template content
		const templateContent = `<!-- Custom Prompt Template for Beautify Prompt Extension -->
<!-- The {{PROMPT}} placeholder will be replaced with the original prompt text -->

I want you to transform this prompt into a perfectly structured and detailed prompt for coding:

Original Request: "{{PROMPT}}"

Please enhance this request by:
1. Adding specific programming language and framework details
2. Breaking down the task into logical steps
3. Specifying any necessary APIs, libraries, or dependencies
4. Including performance considerations and edge cases
5. Adding formatting and style preferences
6. Requesting code comments and documentation
7. Defining expected input/output formats
8. Adding any necessary error handling requirements

The output should be a comprehensive prompt that will yield high-quality, well-structured, and thoroughly documented code. Focus on making the prompt precise and actionable.`;

		// Check if the file already exists
		try {
			await vscode.workspace.fs.stat(templateUri);
			// File exists, ask for confirmation before overwriting
			const answer = await vscode.window.showWarningMessage(
				'A custom template file already exists. Do you want to replace it?', 
				{ modal: true },
				'Yes', 'No'
			);
			
			if (answer !== 'Yes') {
				vscode.window.showInformationMessage('Template generation cancelled.');
				return;
			}
		} catch (err) {
			// File doesn't exist, continue with creation
		}
		
		// Write the template file
		await vscode.workspace.fs.writeFile(templateUri, Buffer.from(templateContent, 'utf8'));
		
		// Success message
		vscode.window.showInformationMessage(
			'Custom prompt template created successfully!', 
			{ detail: `Template file created at ${templateUri.fsPath}` }
		);
		
		// Open the template file in the editor
		const document = await vscode.workspace.openTextDocument(templateUri);
		await vscode.window.showTextDocument(document);
		
	} catch (error) {
		logDebug('Error creating template file', error);
		vscode.window.showErrorMessage(`Failed to create template file: ${error instanceof Error ? error.message : String(error)}`);
	}
}
