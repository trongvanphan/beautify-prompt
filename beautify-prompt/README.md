# Beautify Prompt for GitHub Copilot

A Visual Studio Code extension that enhances your GitHub Copilot prompts to get better code suggestions.

## Features

This extension helps you improve the quality of your GitHub Copilot prompts for software development by:

- Making prompts more specific with precise programming terminology
- Adding necessary technical context (language, framework, libraries, versions)
- Indicating expected output format (function signature, class structure, code style)
- Breaking complex prompts into logical development steps
- Specifying error handling, edge cases, and performance considerations
- Including necessary imports, dependencies, and setup requirements
- Adding testing expectations when applicable
- Providing clarity on design patterns and architectural approaches
- Defining variable naming conventions and code style preferences

### How to Use

#### In Code Editor:
1. Select the text of your prompt in the editor
2. Right-click and select "Beautify Prompt" from the context menu
3. The extension will process your prompt and replace it with an enhanced version
4. Use the enhanced prompt with GitHub Copilot for better results

#### In GitHub Copilot Chat:
1. Start typing a prompt in the GitHub Copilot Chat panel
2. Before sending, press `Cmd+Shift+B` (Mac) or `Ctrl+Shift+B` (Windows/Linux)
3. Your prompt will be enhanced and copied to the clipboard
4. Paste the enhanced prompt into the chat input with `Cmd+V` (Mac) or `Ctrl+V` (Windows/Linux)

#### Using Auto-Beautify Prefix:
1. Start your prompt with `beautify prompt:` (configurable in settings)
2. Press `Cmd+Shift+A` (Mac) or `Ctrl+Shift+A` (Windows/Linux) to trigger auto-beautification
3. The extension will detect this prefix, beautify the prompt, and remove the prefix

For example:
```
beautify prompt: create a function that calculates fibonacci
```

#### Using the @bp Agent:
1. Start your prompt with `@bp` (similar to GitHub Copilot's built-in agents like @workspace)
2. When you type `@bp` in the Copilot Chat, a status bar indicator will appear
3. Click the status bar icon or press `Cmd+Alt+B` (Mac) or `Ctrl+Alt+B` (Windows/Linux) to trigger the agent
4. The @bp agent will beautify your prompt with visual progress indicators

For example:
```
@bp create a function that calculates fibonacci
```

Will be automatically beautified to something more detailed and effective like:
```
Task: Create an efficient function that calculates the nth Fibonacci number

Context: Using JavaScript with ES6+ features

Requirements:
1. Create a function named 'calculateFibonacci' that takes a parameter 'n' (number)
2. Implement memoization for performance optimization
3. Handle edge cases (negative numbers, zero)
4. Include validations for input types
5. Add proper JSDoc documentation

Expected output: A well-structured function with O(n) time complexity and proper error handling
```

You can customize the prefix in the settings and enable/disable this feature as needed.

![Enhance Prompt Demo](images/enhance-prompt-demo.gif)

## Requirements

- Visual Studio Code 1.60.0 or higher
- GitHub Copilot extension installed and configured

## How It Works

This extension analyzes your prompt text and applies a series of enhancements based on software development best practices for interacting with AI code generators like GitHub Copilot:

1. **Technical Structure**: Adds task/goal definitions using precise programming terminology
2. **Development Context**: Ensures language, framework, libraries and version details are included
3. **Code Output Specifications**: Clarifies expected function signatures, class structures and code style
4. **Implementation Steps**: Breaks down complex development tasks into logical components
5. **Quality Considerations**: Adds requirements for error handling, edge cases and performance optimizations
6. **Environment Setup**: Includes necessary imports, dependencies and configuration details
7. **Testing Guidelines**: Specifies how the code should be tested when applicable
8. **Architecture Guidance**: Provides clarity on design patterns and architectural approaches
9. **Code Standards**: Defines variable naming conventions and style preferences

## Extension Settings

This extension contributes the following settings:

* `beautify-prompt.autoBeautifyPrefix`: The prefix text that triggers automatic beautification (default: "beautify prompt:")
* `beautify-prompt.enableAutoBeautify`: Enable/disable automatic beautification for prompts with the specified prefix (default: true)

You can customize these settings in your VS Code settings.json:

```json
{
  "beautify-prompt.autoBeautifyPrefix": "enhance:",
  "beautify-prompt.enableAutoBeautify": true
}
```

## Known Issues

- Currently uses simulated enhancement logic; future versions will integrate more advanced AI-based enhancements
- May not preserve exact formatting of the original prompt

## Future Improvements

- Integration with GitHub Copilot API when available
- Custom prompt templates for different coding scenarios
- Additional user-configurable enhancement strategies
- Support for prompt history and favorites
- Improved real-time prefix detection for automatic beautification

## Release Notes

### 0.0.2

- Added support for GitHub Copilot Chat prompts
- Added keyboard shortcut (Cmd+Shift+B / Ctrl+Shift+B) for enhancing Chat prompts
- Improved documentation

### 0.0.1

Initial release of Beautify Prompt for GitHub Copilot with basic enhancement capabilities.

## Development

Want to contribute? Great!

1. Clone the repository
2. `npm install`
3. Make your changes
4. Submit a pull request

## License

MIT

## Author

C99.FHM.EMU

---

## For More Information

* [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
* [VS Code Extension API](https://code.visualstudio.com/api)

**Enjoy more productive coding with better Copilot prompts!**
