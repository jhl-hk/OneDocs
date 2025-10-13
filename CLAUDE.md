# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OneDocs (一文亦闻) is a Tauri-based desktop application for intelligent document analysis. It uses OpenAI-compatible APIs to analyze documents (PDF, Word, PowerPoint, TXT) and generate structured summaries tailored to different domains (science, liberal arts, data analysis, news).

**Tech Stack:**
- Frontend: React 18, TypeScript, Vite
- State Management: Zustand with persist middleware
- Backend: Rust (Tauri v2)
- Document Processing: PDF.js, Mammoth.js, JSZip
- Rendering: Marked.js (Markdown), KaTeX (LaTeX)

## Development Commands

```bash
# Setup
npm install

# Development (Vite dev server only)
npm run dev

# Development (with Tauri)
npm run tauri:dev

# Build for production
npm run build
npm run tauri:build
```

## Architecture Overview

### React Application Structure

```
src/
├── main.tsx              # React entry point
├── App.tsx               # Root component with page routing
├── pages/
│   ├── Landing.tsx       # Landing page
│   └── Tool.tsx          # Main analysis interface
├── components/           # Reusable UI components
│   ├── FileUpload.tsx
│   ├── FunctionSelector.tsx
│   ├── SettingsModal.tsx
│   ├── ResultDisplay.tsx
│   ├── ProgressBar.tsx
│   └── Toast.tsx
├── store/
│   └── useAppStore.ts    # Zustand global state store
├── hooks/
│   └── useAnalysis.ts    # Document analysis logic
├── services/
│   └── api.ts            # API service layer
├── utils/
│   ├── documentProcessor.ts   # File extraction logic
│   └── markdownRenderer.ts    # Markdown/LaTeX rendering
├── config/
│   ├── providers.ts      # AI provider configurations
│   └── prompts/
│       └── index.ts      # System prompts for each analysis type
├── types/
│   └── index.ts          # TypeScript type definitions
└── styles/
    └── index.css         # Global styles
```

### State Management (Zustand)

The application uses Zustand with persistence for state management. Key state slices:

**File State:**
- `currentFile`: Currently selected file information
- `setCurrentFile`: Update current file

**Analysis State:**
- `selectedFunction`: Current analysis type ('science' | 'liberal' | 'data' | 'news')
- `isAnalyzing`: Boolean flag preventing concurrent analyses
- `analysisProgress`: { percentage, message } for progress tracking
- `analysisResult`: { content, timestamp } for analysis output

**Settings State:**
- `currentProvider`: Active AI provider ('openai' | 'deepseek' | 'glm')
- `providerSettings`: Record of API keys, base URLs, and models per provider
- `getCurrentSettings()`: Get settings for current provider

**UI State:**
- `isSidebarCollapsed`: Sidebar visibility
- `isSettingsOpen`: Settings modal visibility
- `viewMode`: 'render' | 'markdown' for result display
- `showFormatNotice`: Format hint visibility

Persisted state is stored in localStorage under the key `onedocs-storage`.

### Multi-Provider AI System

Defined in `src/config/providers.ts`:

**Supported Providers:**
- **OpenAI**: GPT-4o, GPT-4o-mini, GPT-4, GPT-3.5 Turbo
- **DeepSeek**: DeepSeek-Chat, DeepSeek-Reasoner  
- **GLM (智谱)**: GLM-4-Flash, GLM-4-Air, GLM-4

Each provider configuration includes:
- `name`: Display name
- `baseUrl`: API base URL
- `endpoint`: Chat completions endpoint path
- `models`: Array of { value, name } model options
- `defaultModel`: Default model selection
- `keyLabel`, `keyHint`, `baseUrlHint`: UI labels

### Prompt System

Defined in `src/config/prompts/index.ts` as `PROMPT_CONFIGS`:

- **science**: STEM course summarization (理工速知)
- **liberal**: Liberal arts analysis (文采丰呈)
- **data**: Data content analysis (罗森析数)
- **news**: News summarization (要闻概览)

Each prompt includes:
- `name`: Display name
- `description`: Short description
- `prompt`: Complete system prompt with instructions

**To add a new prompt type:**
1. Add type to `PromptType` union in `src/types/index.ts`
2. Add configuration to `PROMPT_CONFIGS` in `src/config/prompts/index.ts`
3. Add UI button/option in `src/components/FunctionSelector.tsx`
4. Update `FUNCTION_INFO` in `src/config/providers.ts` with icon and display info

### Document Processing Pipeline

1. **File Selection** (`FileUpload.tsx`)
   - User selects file via file input or drag-and-drop
   - Validates file type against `SUPPORTED_FILE_TYPES`
   - Checks size limit (50MB default from `FILE_SIZE_LIMIT`)
   - Updates `currentFile` in store

2. **Text Extraction** (`DocumentProcessor.extractContent()`)
   - Routes to appropriate extractor based on MIME type:
     - **PDF**: `extractPDFText()` - Uses PDF.js to parse pages
     - **Word**: `extractWordText()` - Uses Mammoth.js for .docx
     - **PowerPoint**: `extractPowerPointText()` - Uses JSZip to parse .pptx XML
     - **Text**: `extractTextFile()` - Direct FileReader
   - Returns extracted text string
   - Throws descriptive errors for parsing failures

3. **AI Analysis** (`useAnalysis.ts` → `api.ts`)
   - Hook: `useAnalysis()` orchestrates the analysis flow
   - Updates progress at each stage (10%, 40%, 60%, 90%, 100%)
   - Service: `APIService.callAI()` prepares API request
   - Backend: Calls Tauri command `analyze_content_rust`
   - Rust handler constructs OpenAI chat completion request
   - Makes HTTP POST to `{baseUrl}/chat/completions` with Bearer auth
   - Returns AI-generated markdown analysis

4. **Result Rendering** (`ResultDisplay.tsx`)
   - Supports two view modes: 'render' (HTML) and 'markdown' (raw)
   - Uses `marked.js` to convert markdown to HTML
   - Uses `katex` auto-render for LaTeX math:
     - Inline: `$...$`
     - Block: `$$...$$ ` (single line)
   - Provides export to PDF functionality

### File Type Support

**Currently supported** (defined in `SUPPORTED_FILE_TYPES`):
- `application/pdf` - PDF documents
- `application/msword` - Word 97-2003 (.doc)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` - Word 2007+ (.docx)
- `application/vnd.ms-powerpoint` - PowerPoint 97-2003 (.ppt)
- `application/vnd.openxmlformats-officedocument.presentationml.presentation` - PowerPoint 2007+ (.pptx)
- `text/plain` - Plain text files

**To add new file types:**
1. Add MIME type to `SupportedFileType` in `src/types/index.ts`
2. Add to `SUPPORTED_FILE_TYPES` array in `src/config/providers.ts`
3. Update file input accept attribute in `FileUpload.tsx`
4. Add case in `DocumentProcessor.extractContent()` switch
5. Implement extraction method (e.g., `extractExcelText()`)
6. Add type hint in `DocumentProcessor.getFileTypeHint()`
7. Install required npm package if needed

### Tauri Backend

**Rust Command** (`src-tauri/src/lib.rs`):

```rust
#[tauri::command]
async fn analyze_content_rust(
    api_key: String,
    api_base_url: String,
    system_prompt: String,
    text_content: String,
    model: String,
) -> Result<String, String>
```

- Constructs messages array with system and user prompts
- Makes HTTP POST to `{api_base_url}/chat/completions`
- Uses Bearer token authentication
- Configurable temperature (0.7) and max_tokens (4000)
- Returns AI response content or error message

**Configuration** (`src-tauri/tauri.conf.json`):
- App identifier: `com.ijune.onedocs`
- Product name: `onedocs`
- Window: 800x700, non-resizable
- Dev server: http://localhost:1420
- Build output: `../dist`
- Plugins: `dialog`, `fs`

**Dependencies** (`src-tauri/Cargo.toml`):
- `tauri`: v2 with plugins
- `reqwest`: HTTP client
- `serde`, `serde_json`: JSON serialization
- `anyhow`: Error handling

## Key Implementation Patterns

### Component Communication

- **State**: Use Zustand store via `useAppStore()` hook
- **Actions**: Dispatch actions through store methods
- **Side Effects**: Use `useAnalysis()` hook for analysis flow
- **Toast Notifications**: Use `useToast()` hook from Toast component

### Error Handling

All layers provide user-friendly error messages:
- **Document Processor**: Specific errors for each file type
- **API Service**: Interprets HTTP status codes (401, 403, 429, timeout, network)
- **Analysis Hook**: Adds contextual suggestions for common failures
- **Toast System**: Displays errors with configurable duration

### Progress Updates

During analysis, `setAnalysisProgress()` updates UI:
- 10%: "正在解析文档内容..."
- 40%: "文档解析完成，准备分析..."
- 60%: "正在调用AI分析..."
- 90%: "分析完成，正在渲染结果..."
- 100%: "分析完成！"

### Markdown Rendering

- Uses `marked` library with default options
- KaTeX auto-render processes math after markdown conversion
- Delimiters:
  - Inline: `$...$`
  - Display: `$$...$$` (must be single line)
- Implementation in `src/utils/markdownRenderer.ts`

## Common Development Tasks

### Adding a New AI Provider

1. Add provider key to `AIProvider` type in `src/types/index.ts`
2. Add configuration to `MODEL_PROVIDERS` in `src/config/providers.ts`:
```typescript
newprovider: {
  name: 'Provider Name',
  baseUrl: 'https://api.provider.com/v1',
  endpoint: '/chat/completions',
  models: [
    { value: 'model-id', name: 'Model Display Name' }
  ],
  defaultModel: 'model-id',
  keyLabel: 'API Key Label',
  keyHint: 'Hint text',
  baseUrlHint: 'Base URL hint'
}
```
3. Add initial settings in `useAppStore.ts` `providerSettings` default state
4. Add option in `SettingsModal.tsx` provider selector
5. Test with the new provider's API

### Modifying Analysis Flow

Main flow is in `src/hooks/useAnalysis.ts`:

1. Validate file and API key
2. Extract file content via `DocumentProcessor`
3. Get system prompt from `PROMPT_CONFIGS`
4. Call `APIService.callAI()` with all parameters
5. Update progress at each stage
6. Save result to store via `setAnalysisResult()`
7. Handle errors with descriptive messages

### Styling Components

- Global styles in `src/styles/index.css`
- Component styles use inline Tailwind-like utility classes (if configured) or inline styles
- Font: "Noto Serif SC" for Chinese text
- Icons: Font Awesome (loaded via CDN in index.html)

### Path Aliases

TypeScript path alias `@/*` maps to `src/*`:
- Configured in `tsconfig.json` paths
- Configured in `vite.config.ts` resolve.alias
- Use in imports: `import { useAppStore } from '@/store/useAppStore'`

### Dependencies

**Runtime:**
- `@tauri-apps/api`, `@tauri-apps/plugin-*`: Tauri integration
- `react`, `react-dom`: UI framework
- `zustand`: State management
- `pdfjs-dist`, `mammoth`, `jszip`: Document parsing
- `marked`, `katex`: Rendering

**Dev:**
- `vite`, `@vitejs/plugin-react`: Build tooling
- `typescript`: Type checking
- `@types/*`: Type definitions

PDF.js worker is loaded from CDN (version 4.10.38) to ensure stability.

## Debugging Tips

- React DevTools available in browser during development
- Rust backend logs appear in terminal running `npm run tauri:dev`
- Use browser console for frontend debugging
- Check Zustand state with React DevTools
- File processing errors are logged with detailed context
- API errors include status codes and suggestions

## Build and Deployment

**Development build:**
```bash
npm run tauri:dev
```

**Production build:**
```bash
npm run build          # Build frontend
npm run tauri:build    # Build Tauri app
```

Build artifacts:
- Frontend: `dist/` directory
- Tauri app: `src-tauri/target/release/bundle/`

The application is configured for fixed window size (800x700) and cannot be resized. This is intentional for consistent UX.
