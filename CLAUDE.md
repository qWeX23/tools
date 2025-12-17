# CLAUDE.md

This file provides guidance for AI assistants working with this repository.

## Project Overview

This is a **Tools Collection** - a static website hosting standalone web tools on GitHub Pages. Each tool is self-contained in its own folder and accessible via folder-based routing.

**Live Site**: `https://qWeX23.github.io/tools/`

## Repository Structure

```
tools/
├── index.html              # Main landing page with tool cards grid
├── styles.css              # Shared CSS styles (gradient theme, cards, buttons)
├── CLAUDE.md               # This file - AI assistant guidance
├── README.md               # Project documentation
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions deployment workflow
├── example-tool/           # Template/demo tool
│   └── index.html
└── credit-simulator/       # Credit band payment simulator
    └── index.html
```

## Current Tools

1. **Credit Band Simulator** (`/credit-simulator/`) - Simulates credit card payments with configurable payment bands, visualizations using Chart.js, and CSV export
2. **Example Tool** (`/example-tool/`) - A template demonstrating the folder-based routing structure

## Development Workflow

### Adding a New Tool

1. Create a new folder in the root directory:
   ```bash
   mkdir new-tool-name
   ```

2. Create `index.html` in the new folder with this structure:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Tool Name</title>
       <link rel="stylesheet" href="../styles.css">
   </head>
   <body>
       <div class="container tool-container">
           <a href="../" class="back-link">← Back to Tools</a>
           <header>
               <h1>Tool Name</h1>
               <p>Tool description</p>
           </header>
           <main>
               <div class="tool-content">
                   <!-- Tool content here -->
               </div>
           </main>
       </div>
   </body>
   </html>
   ```

3. Add a card to the main `index.html`:
   ```html
   <div class="tool-card">
       <h2>Tool Name</h2>
       <p>Description of what your tool does</p>
       <a href="new-tool-name/" class="btn">Open Tool</a>
   </div>
   ```

4. Commit and push - GitHub Actions automatically deploys to GitHub Pages

### Styling Conventions

- **Shared styles**: Use `../styles.css` for consistent look and feel
- **Color scheme**: Primary purple gradient (`#667eea` to `#764ba2`)
- **Container classes**:
  - `.container` - Main page wrapper (max-width: 1200px)
  - `.tool-container` - Tool page wrapper (max-width: 900px)
  - `.tool-card` - Card component for landing page
  - `.tool-content` - Content wrapper for tool pages
  - `.btn` - Primary button style
  - `.back-link` - Navigation link back to home

### Tool-Specific Styles

Tools can include custom styles inline (like `credit-simulator/index.html`) or create a separate CSS file in their folder. The credit simulator demonstrates:
- Form inputs with focus states
- Tables with hover effects
- Status messages with success/error states
- Toggle switches
- Responsive grid layouts

## Deployment

### Automatic Deployment
- Pushes to `main` branch trigger automatic deployment via GitHub Actions
- Workflow: `.github/workflows/deploy.yml`
- Uses GitHub Pages with static file deployment

### Manual Deployment
1. Go to Actions tab in GitHub
2. Select "Deploy to GitHub Pages"
3. Click "Run workflow"

## Key Patterns

### File Organization
- Each tool is **self-contained** in its own folder
- Tools should have an `index.html` as the entry point
- External dependencies (like Chart.js) are loaded via CDN

### JavaScript Patterns (from credit-simulator)
- Use vanilla JavaScript - no build step required
- DOM helpers: `const $ = (id) => document.getElementById(id)`
- Formatting helpers: `round2()`, `fmt()` for consistent number display
- Auto-run on input changes for responsive UI
- Export functionality (CSV) for data tools

### HTML Structure
- All pages use `<!DOCTYPE html>` with `lang="en"`
- Include viewport meta tag for responsive design
- Use semantic HTML (`<header>`, `<main>`, `<footer>`)

## Important Notes

- **No build system** - Plain HTML, CSS, and JavaScript
- **No server-side code** - Everything runs client-side
- **CDN dependencies** - External libraries loaded from CDNs (e.g., Chart.js)
- **Responsive design** - All tools should work on mobile devices
- **Trailing slashes** - URLs use trailing slashes (`/tool-name/`)

## Git Workflow

- Main branch: `main`
- Feature branches: `claude/<feature-name>-<session-id>`
- PRs merge into `main` and auto-deploy

## Testing

No automated tests - manually verify tools work by opening in a browser. For tools with calculations (like credit-simulator), test edge cases:
- Zero values
- Large numbers
- Empty inputs
- Different device sizes
