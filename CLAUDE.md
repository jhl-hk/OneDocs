# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OneDocs (一文亦闻) is a desktop application for intelligent document analysis. It's a Tauri-based application with a React frontend that uses AI to analyze documents (PDF, Word, PowerPoint, TXT) and generate structured summaries based on different analysis modes (science, liberal arts, data, news).

**Key Technologies:**
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Tauri v2 (Rust)
- **State Management**: Zustand with persist middleware
- **Document Processing**: pdfjs-dist, mammoth, jszip
- **Rendering**: marked (Markdown), KaTeX (LaTeX)

## Development Commands

### Setup and Installation
```bash
npm install
```

### Development
```bash
# Start development server with hot reload
npm run tauri:dev

# Start Vite dev server only (frontend)
npm run dev
```

### Building
```bash
# Type check and build
npm run build

# Build Tauri application (creates platform-specific installer)
npm run tauri:build
```

### Preview
```bash
npm run preview
```

## Architecture

### Hybrid Architecture (React + Rust)

The application follows a **frontend-backend separation** model:

**Frontend (React)**: 
- Handles UI rendering and user interactions
- Manages application state with Zustand
- Processes documents client-side (PDF, Word, PPT parsing)
- Renders Markdown and LaTeX content

**Backend (Rust/Tauri)**:
- Provides secure API communication via `analyze_content_rust` command
- Handles HTTP requests to AI providers (OpenAI, DeepSeek, GLM)
- Implements authentication headers for different AI providers

### State Management

The app uses a single Zustand store (`src/store/useAppStore.ts`) with localStorage persistence:

- **File state**: Currently uploaded file information
- **Analysis state**: Progress tracking, results storage
- **Provider settings**: API keys, base URLs, model selections (persisted)
- **UI state**: Sidebar collapse, settings modal, view mode

**Important**: Settings are persisted across sessions via `zustand/middleware/persist`. The persisted keys are: `selectedFunction`, `currentProvider`, `providerSettings`, `isSidebarCollapsed`, `showFormatNotice`.

### Document Processing Pipeline

1. **File Upload** → `FileUpload.tsx` validates file type and size
2. **Content Extraction** → `documentProcessor.ts` extracts text based on file type:
   - PDF: Uses pdfjs-dist with CDN worker
   - Word: Uses mammoth for .doc/.docx
   - PowerPoint: Uses jszip to parse .pptx XML
   - TXT: Direct FileReader
3. **AI Analysis** → `api.ts` calls Tauri backend via `invoke("analyze_content_rust")`
4. **Backend Processing** → `src-tauri/src/main.rs` sends request to AI provider
5. **Result Display** → `ResultDisplay.tsx` renders with marked + KaTeX

### AI Provider System

The application supports multiple AI providers configured in `src/config/providers.ts`:

- **OpenAI**: GPT-4o, GPT-4o-mini, GPT-4, GPT-3.5-turbo
- **DeepSeek**: deepseek-chat, deepseek-reasoner
- **智谱GLM**: glm-4-flashx, glm-4-plus, glm-4v-plus, etc.

Each provider has specific configuration:
- Base URL and endpoint
- Available models with defaults
- Custom authentication headers (handled in Rust backend)

**Error Handling**: `api.ts` includes comprehensive error detection for:
- Insufficient balance errors (provider-specific messages)
- Invalid API keys (401)
- Model not found (1211 error code for GLM)
- Rate limiting (429)
- Network issues

### Analysis Modes (Prompts)

Four specialized analysis modes in `src/config/prompts/index.ts`:

1. **science** (理工速知): STEM course material organizer with strict LaTeX formula formatting
2. **liberal** (文采丰呈): Humanities and liberal arts content analyzer
3. **data** (罗森析数): Data analysis and statistical content processor
4. **news** (要闻概览): News summarization with 5W1H extraction

**Critical**: Science mode has strict requirements for LaTeX formula formatting:
- Inline formulas: `$x$`
- Block formulas: `$$formula$$` (must be on same line)
- Prohibits multi-line `$\nformula\n$` format

## Path Aliases

The project uses `@/*` as an alias for `src/*`:
```typescript
import { useAppStore } from '@/store/useAppStore';
import { DocumentProcessor } from '@/utils/documentProcessor';
```

## Key Files and Their Purposes

### Frontend Core
- `src/App.tsx`: Root component with page routing (landing/tool)
- `src/pages/Landing.tsx`: Welcome page
- `src/pages/Tool.tsx`: Main analysis interface
- `src/hooks/useAnalysis.ts`: Analysis orchestration hook

### State and Config
- `src/store/useAppStore.ts`: Global Zustand store
- `src/config/providers.ts`: AI provider configurations
- `src/config/prompts/index.ts`: Analysis prompt templates

### Services and Utils
- `src/services/api.ts`: API communication layer
- `src/utils/documentProcessor.ts`: Document parsing (PDF/Word/PPT)
- `src/utils/markdownRenderer.ts`: Markdown + LaTeX rendering

### Backend
- `src-tauri/src/main.rs`: Tauri command handlers
- `src-tauri/Cargo.toml`: Rust dependencies (reqwest, serde, tokio)
- `src-tauri/tauri.conf.json`: Tauri app configuration

## Common Patterns

### Invoking Tauri Commands
```typescript
import { invoke } from "@tauri-apps/api/core";

const result = await invoke<string>("analyze_content_rust", {
  apiKey: "...",
  apiBaseUrl: "https://api.openai.com/v1",
  systemPrompt: "...",
  textContent: "...",
  model: "gpt-4o"
});
```

### Accessing Store
```typescript
const { currentFile, setCurrentFile, getCurrentSettings } = useAppStore();
const settings = getCurrentSettings(); // Returns current provider's settings
```

### Adding a New AI Provider

1. Update type in `src/types/index.ts`: `export type AIProvider = 'openai' | 'deepseek' | 'glm' | 'newprovider';`
2. Add configuration to `MODEL_PROVIDERS` in `src/config/providers.ts`
3. Update default settings in `useAppStore.ts` → `getDefaultSettings`
4. Add authentication logic in `src-tauri/src/main.rs` if needed

### Adding a New Analysis Mode

1. Update type: `export type PromptType = 'science' | 'liberal' | 'data' | 'news' | 'newmode';`
2. Add prompt config to `PROMPT_CONFIGS` in `src/config/prompts/index.ts`
3. Add function info to `FUNCTION_INFO` in `src/config/providers.ts`

## Important Notes

### PDF.js Worker Configuration
The PDF worker is loaded from CDN (version 4.0.379) in `documentProcessor.ts`:
```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;
```

### TypeScript Configuration
- Strict mode enabled
- Path mapping: `@/*` → `src/*`
- Target: ES2020
- Module resolution: bundler mode

### Vite Build Configuration
- Port: 1420 (strict)
- Manual chunk splitting for pdfjs-dist
- Path alias resolution via `@`
- Optimized for Tauri (ES2021, Chrome100, Safari13)

### Tauri Plugins Used
- `tauri-plugin-dialog`: File selection dialogs
- `tauri-plugin-fs`: File system access

## Localization

The application is primarily in **Chinese** (Simplified). All user-facing text, prompts, error messages, and documentation are in Chinese. When modifying UI text or prompts, maintain Chinese language consistency.
