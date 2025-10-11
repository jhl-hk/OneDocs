# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OneDocs (一文亦闻) is a Tauri-based desktop application for intelligent document analysis. It uses OpenAI-compatible APIs to analyze documents (PDF, Word, TXT) and generate structured summaries tailored to different domains (science, liberal arts, data analysis, news).

**Tech Stack:**
- Frontend: Vanilla JavaScript, HTML, CSS
- Backend: Rust (Tauri v2)
- Document Processing: PDF.js, Mammoth.js
- Rendering: Marked.js (Markdown), KaTeX (LaTeX)

## Development Commands

```bash
# Setup (from repository root)
cd OneDocs
npm install

# Development (opens app with hot reload)
npm run tauri dev

# Build for production
npm run tauri build
```

## Architecture

### Frontend Structure

```
OneDocs/src/
├── index.html          # Landing page
├── tool.html           # Main application UI
├── js/
│   ├── main.js         # Landing page logic
│   ├── tool.js         # Main application logic (used in production)
│   └── tool_clean.js   # Alternative version with JSON prompt loading
├── prompts/
│   ├── science.js      # STEM course summarization
│   ├── liberal.js      # Liberal arts analysis
│   ├── data.js         # Data analysis extraction
│   ├── news.js         # News summarization
│   └── *.json          # JSON versions (loaded by tool_clean.js)
└── css/
    └── style.css       # All application styles
```

**Note:** `tool.js` and `tool_clean.js` implement the same functionality but differ in how they load prompts:
- `tool.js`: Uses `.js` prompt files that inject into `window.promptConfigs` (default)
- `tool_clean.js`: Fetches `.json` prompt files dynamically via `loadSystemPrompt()`

### Multi-Provider API System

The application supports multiple AI providers through a unified configuration system:

**Supported Providers** (in `MODEL_PROVIDERS` object):
- OpenAI: GPT-4o, GPT-4o-mini, GPT-4, GPT-3.5 Turbo
- DeepSeek: DeepSeek-Chat, DeepSeek-Reasoner
- GLM (智谱): GLM-4-Flash, GLM-4-Air, GLM-4

**Storage Pattern:**
```javascript
localStorage.setItem('current_provider', 'openai'); // Current active provider
localStorage.setItem('openai_api_key', apiKey);
localStorage.setItem('openai_api_base_url', baseUrl);
localStorage.setItem('openai_model', model);
// Repeat for each provider with their prefix
```

### Prompt Configuration System

Prompts are defined twice (JS and JSON) for flexibility. Each prompt has:
- `name`: Display name
- `description`: Short description
- `prompt`: Complete system prompt with role, instructions, and format requirements

**Adding a new prompt:**
1. Create `prompts/newtype.js`:
```javascript
window.promptConfigs = window.promptConfigs || {};
window.promptConfigs.newtype = {
  "name": "Display Name",
  "description": "Brief description",
  "prompt": "Full system prompt..."
};
```
2. Create matching `prompts/newtype.json` with same structure
3. Add `<script src="prompts/newtype.js">` to `tool.html`
4. Update `verifyPromptConfigs()` in `tool.js` to include the new type
5. Add UI button in `tool.html` sidebar with `data-function="newtype"` attribute
6. Add function name mapping in `analyzeDocument()` function

### Document Processing Pipeline

1. **File Upload** (`handleFileSelect()` → `processFile()`)
   - Validates file type against `allowedTypes` array
   - Checks file size limit (10MB default)
   - Displays file preview via `showFilePreview()`

2. **Text Extraction** (`extractFileContent()`)
   - Routes to appropriate extractor based on MIME type:
     - `extractPDFText()`: Uses PDF.js to parse PDF ArrayBuffer
     - `extractWordText()`: Uses Mammoth.js for .docx files
     - `extractPowerPointText()`: Uses JSZip to extract text from .pptx XML
     - Plain text: Direct read via FileReader
   - Returns extracted text content

3. **API Analysis** (`analyzeDocument()`)
   - Frontend sends to Rust backend via Tauri IPC: `invoke('analyze_content_rust')`
   - Rust `analyze_content_rust()` command constructs OpenAI chat completion request
   - Makes HTTP POST to `{base_url}/chat/completions` with Bearer token auth
   - Returns AI-generated analysis to frontend
   - Frontend renders Markdown with KaTeX math support using `renderMarkdown()`

### File Type Support

**Currently supported formats:**
- PDF: `application/pdf`
- Word: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- PowerPoint: `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`
- Text: `text/plain`

**When adding new file types:**
1. Add MIME type to `allowedTypes` array in `tool.js`
2. Add file extension to `accept` attribute in `tool.html` file input
3. Add case in `processFile()` switch statement for `fileTypeHint`
4. Add case in `extractFileContent()` to route to new extraction function
5. Implement extraction function (e.g., `extractNewFormatText()`)
6. Add library dependency to `tool.html` if needed
7. Update format notice text and error messages

### Tauri Backend

**Rust commands** (`src-tauri/src/lib.rs`):
- `analyze_content_rust`: Main API proxy that handles OpenAI chat completions
  - Parameters: `api_key`, `api_base_url`, `system_prompt`, `text_content`
  - Constructs messages with system prompt and user document content
  - Makes HTTP request to configurable API base URL
  - Returns AI-generated analysis string

**Configuration** (`src-tauri/tauri.conf.json`):
- Fixed window size (800x700, non-resizable)
- Frontend served from `../src` directory
- App identifier: `com.ijune.onedocs`
- Product name: "onedocs"

**Dependencies** (`src-tauri/Cargo.toml`):
- `tauri`: v2.0.0-beta.21
- `reqwest`: v0.12 (with json feature)
- `serde`, `serde_json`: JSON serialization
- `tokio`: Async runtime
- `anyhow`: Error handling

## Key Implementation Details

### Settings Persistence

Settings stored in `localStorage` with provider-specific keys:
```javascript
// Provider selection
localStorage.setItem('current_provider', 'openai');

// Provider-specific settings (replace 'openai' with provider key)
localStorage.setItem('openai_api_key', apiKey);
localStorage.setItem('openai_api_base_url', baseUrl);
localStorage.setItem('openai_model', model);
```

### Markdown Rendering

Uses `marked.js` with custom renderer for LaTeX:
- Inline math: `$...$`
- Block math: `$$...$$` (must be on single line per prompt requirements)
- KaTeX auto-renderer processes math after Markdown conversion
- Configured in `renderMarkdown()` function

### Progress Updates

`updateProgress(percentage, message)` and related functions update UI during document processing:
- Shows/hides loading spinner
- Updates progress bar
- Displays status messages
- Manages analyze button state

### State Management

Global state variables in `tool.js`:
- `currentFile`: Currently selected file object
- `selectedFunction`: Current analysis type ('science', 'liberal', 'data', 'news')
- `isAnalyzing`: Boolean flag to prevent concurrent analyses

### UI Components

**Key DOM elements:**
- `#uploadArea`: File upload dropzone
- `#fileInput`: Hidden file input
- `#filePreview`: Shows selected file info
- `#analyzeButtonMini`: Main analyze button (disabled when no file/API key)
- `#sidebar`: Function selection sidebar (collapsible)
- `#resultArea`: Displays analysis results
- `#settingsModal`: Settings dialog

## Common Tasks

### Adding a New AI Provider

1. Add provider config to `MODEL_PROVIDERS` object in `tool.js`:
```javascript
newprovider: {
    name: 'Provider Name',
    baseUrl: 'https://api.provider.com/v1',
    endpoint: '/chat/completions',
    models: [
        { value: 'model-id', name: 'Model Display Name' }
    ],
    defaultModel: 'model-id',
    keyLabel: 'Provider API Key',
    keyHint: 'Hint text',
    baseUrlHint: 'Base URL hint'
}
```
2. Add provider option to settings modal in `tool.html`
3. Update `initializeSettingsDefaults()` if special handling needed
4. Settings will auto-save with provider prefix

### Modifying Analysis Flow

Main workflow in `analyzeDocument()` (tool.js:~350):
1. Validates file, function, and API key exist
2. Updates progress UI via `showProgress()`
3. Extracts file content via `extractFileContent()`
4. Calls Rust backend via `invoke('analyze_content_rust', {...})`
5. Renders result in output area via `renderMarkdown()`
6. Handles errors and updates UI state

### Debugging

- Browser DevTools available in `npm run tauri dev`
- Rust logs via terminal output
- Use `console.log()` liberally; existing code has extensive logging
- Check `verifyPromptConfigs()` output for prompt loading issues
- File processing logged step-by-step in `processFile()` and extraction functions

### Adding Library Dependencies

1. Add CDN script tag to `tool.html` `<head>` section
2. Check library availability with `typeof LibraryName !== "undefined"` before use
3. Add error handling for missing library
4. Current CDN libraries: PDF.js, Mammoth.js, JSZip, Marked.js, KaTeX, Font Awesome
