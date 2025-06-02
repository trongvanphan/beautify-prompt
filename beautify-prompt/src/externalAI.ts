import * as https from 'https';
import * as vscode from 'vscode';

/**
 * Interface for configuration of the external AI service
 */
interface AIServiceConfig {
    apiKey: string;
    endpoint: string;
    model: string;
}

/**
 * Gets the AI service configuration from VS Code settings
 */
function getAIServiceConfig(): AIServiceConfig | undefined {
    const config = vscode.workspace.getConfiguration('beautify-prompt');
    const apiKey = config.get<string>('aiService.apiKey');
    const endpoint = config.get<string>('aiService.endpoint');
    const model = config.get<string>('aiService.model') || 'gpt-4';
    
    if (!apiKey || !endpoint) {
        return undefined;
    }
    
    return { apiKey, endpoint, model };
}

/**
 * Use an external AI service to beautify a prompt
 * @param originalPrompt The original prompt
 * @param beautifiedPromptRequest The instruction prompt
 * @returns The beautified prompt
 */
export async function beautifyWithExternalAI(originalPrompt: string, beautifiedPromptRequest: string): Promise<string> {
    // Get configuration
    const config = getAIServiceConfig();
    if (!config) {
        throw new Error('AI service not configured. Please set your API key and endpoint in settings.');
    }
    
    // Prepare the request payload
    const payload = JSON.stringify({
        model: config.model,
        messages: [
            { role: 'system', content: 'You are a prompt engineering assistant that improves prompts for coding tasks.' },
            { role: 'user', content: beautifiedPromptRequest }
        ],
        max_tokens: 1000,
        temperature: 0.7
    });
    
    // Make the API request
    return new Promise((resolve, reject) => {
        const req = https.request(config.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.error) {
                        reject(new Error(`API error: ${response.error.message}`));
                    } else {
                        // Extract the response text based on the API's response format
                        const responseText = response.choices[0]?.message?.content || '';
                        resolve(responseText);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });
        
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}
