# Tools Collection

A collection of standalone web tools hosted on GitHub Pages. Each folder represents a separate tool accessible via its own route.

## 🚀 Live Site

Visit the live site at: `https://qWeX23.github.io/tools/`

## 📁 Structure

```
tools/
├── index.html              # Main landing page
├── styles.css              # Shared styles
├── example-tool/           # Example tool (folder = route)
│   └── index.html
└── your-tool/              # Add more tools here
    └── index.html
```

## ✨ Features

- **Folder-based routing**: Each folder becomes a route (e.g., `/example-tool/`)
- **Standalone tools**: Each tool is independent with its own HTML page
- **Automated deployment**: GitHub Actions automatically deploys to GitHub Pages
- **Responsive design**: Mobile-friendly with modern CSS

## 🛠️ Adding a New Tool

1. Create a new folder in the root directory:
   ```bash
   mkdir my-awesome-tool
   ```

2. Create an `index.html` file in your folder:
   ```bash
   touch my-awesome-tool/index.html
   ```

3. Add your tool's HTML content (you can use the shared `styles.css` or create your own)

4. Update the main `index.html` to add a card for your tool:
   ```html
   <div class="tool-card">
       <h2>My Awesome Tool</h2>
       <p>Description of what your tool does</p>
       <a href="my-awesome-tool/" class="btn">Open Tool</a>
   </div>
   ```

5. Commit and push your changes - GitHub Actions will automatically deploy!

## 🚢 Deployment

The site automatically deploys to GitHub Pages when you push to the `main` branch.

### Setup (One-time)

1. Go to your repository Settings → Pages
2. Under "Build and deployment":
   - Source: GitHub Actions
3. The workflow will run automatically on the next push to `main`

### Manual Deployment

You can also trigger deployment manually:
1. Go to Actions tab
2. Select "Deploy to GitHub Pages"
3. Click "Run workflow"

## 📝 Example Tool

Check out the `example-tool/` folder to see a working example of how to structure your tool.

## 🎨 Styling

- Use the shared `styles.css` for consistent look and feel
- Or create your own CSS file in your tool's folder
- The shared styles include responsive grid layout and modern design

## 🤝 Contributing

1. Fork the repository
2. Create a new branch for your tool
3. Add your tool in a new folder
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.