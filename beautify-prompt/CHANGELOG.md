# Change Log

All notable changes to the "beautify-prompt" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.7] - 2025-06-03

### Added
- Added support for custom prompt templates through `.github/bp_actionA.md` file
- Users can now completely customize the beautification prompt
- Enhanced logging system for better debugging
- Added option to use placeholders in custom templates with `{{PROMPT}}`

## [0.0.6] - 2025-06-03

### Added
- Enhanced "@bp" to behave more like a Copilot agent with a dedicated status bar indicator
- Added status bar icon that appears when "@bp" is detected in your input
- Added new keyboard shortcut (Cmd+Alt+B / Ctrl+Alt+B) specifically for @bp agent
- Improved visual feedback with progress indicators during beautification
- Agent-like experience with step-by-step progress reporting

## [0.0.5] - 2025-06-03

### Added
- Added support for "@bp" as a special agent prefix to trigger prompt beautification
- Example: "@bp create a login form with validation" will beautify the prompt

## [0.0.4] - 2025-06-02

### Changed
- Enhanced system prompt to be more specific for software development
- Added detailed software development context to prompt beautification
- Improved simulated beautification with more technical programming specifications
- Updated README with more comprehensive software development examples
- Included detailed programming considerations like design patterns, testing, and architecture

## [0.0.3] - 2025-06-02

### Added
- Auto-beautify prefix feature ("beautify prompt:") that triggers beautification automatically
- New keyboard shortcut (Cmd+Shift+A / Ctrl+Shift+A) for auto-beautify prefix detection
- Configuration settings for customizing the auto-beautify prefix
- Option to enable/disable the auto-beautify feature

### Changed
- Updated documentation to include auto-beautify prefix usage
- Improved extension settings section in README

## [0.0.2] - 2025-06-01

### Added
- Support for GitHub Copilot Chat prompts
- Keyboard shortcut (Cmd+Shift+B / Ctrl+Shift+B) for enhancing Chat prompts
- Context menu integration in GitHub Copilot Chat panel
- Clipboard-based workflow for Chat prompt enhancement

### Changed
- Improved documentation with separate sections for editor and chat usage
- Updated description to reflect new chat capabilities

## [0.0.1] - 2025-05-31

- Initial release with basic prompt enhancement for text editor