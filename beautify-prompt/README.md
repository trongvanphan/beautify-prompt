# Beautify Prompt for GitHub Copilot

A Visual Studio Code extension that enhances your GitHub Copilot prompts to get better code suggestions.

## Features

This extension helps you improve the quality of your GitHub Copilot prompts by:

- Making prompts more specific and clearer
- Adding necessary context and constraints
- Indicating expected output format
- Breaking complex prompts into logical steps
- Removing ambiguity

### How to Use

1. Select the text of your prompt in the editor
2. Right-click and select "Enhance Copilot Prompt" from the context menu
3. The extension will process your prompt and replace it with an enhanced version
4. Use the enhanced prompt with GitHub Copilot for better results

![Enhance Prompt Demo](images/enhance-prompt-demo.gif)

## Requirements

- Visual Studio Code 1.60.0 or higher
- GitHub Copilot extension installed and configured

## How It Works

This extension analyzes your prompt text and applies a series of enhancements based on best practices for interacting with AI code generators like GitHub Copilot:

1. **Structure**: Adds task/goal definitions if missing
2. **Context**: Ensures technical context is included
3. **Output expectations**: Clarifies what kind of results you expect
4. **Specificity**: Expands short or vague prompts with helpful details

## Extension Settings

This extension doesn't currently expose any configurable settings. Future versions may include customization options for prompt enhancement strategies.

## Known Issues

- Currently uses simulated enhancement logic; future versions will integrate more advanced AI-based enhancements
- May not preserve exact formatting of the original prompt

## Future Improvements

- Integration with GitHub Copilot API when available
- Custom prompt templates for different coding scenarios
- User-configurable enhancement strategies
- Command palette integration
- Support for prompt history and favorites

## Release Notes

### 0.1.0

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

C99.FHM.EMU.TrongPV6

---

## For More Information

* [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
* [VS Code Extension API](https://code.visualstudio.com/api)

**Enjoy more productive coding with better Copilot prompts!**
