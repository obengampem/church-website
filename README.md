# Holy Ghost Triumphant Ministries

A church management system with administrator attendance tracking, pastor reporting, and developer tools.

## Pages

- **Administrator Panel** (`administrator/`): Manage church workers and track weekly attendance
- **Pastor's Attendance View** (`pastor/`): View attendance reports sent from administrator
- **Developer Tools** (`developer/`): Debug and manage site data

## Deployment

### Option 1: GitHub Pages (Recommended)

1. **Initialize Git Repository**
   - Open the project in VS Code
   - Go to Source Control panel (Ctrl+Shift+G)
   - Click "Initialize Repository"
   - Stage all files
   - Commit with message "Initial commit"

2. **Create GitHub Repository**
   - Go to GitHub.com and create a new repository
   - Copy the repository URL

3. **Push to GitHub**
   - In VS Code terminal: `git remote add origin <repository-url>`
   - `git push -u origin main`

4. **Enable GitHub Pages**
   - Go to repository Settings > Pages
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Save

5. **Access Site**
   - Wait a few minutes, then visit `https://<username>.github.io/<repository-name>/`

### Option 2: Netlify

1. Push code to GitHub as above
2. Go to Netlify.com and sign up/login
3. Click "New site from Git"
4. Connect your GitHub repository
5. Deploy (no build command needed for static site)

### Option 3: Local Development

For local testing, you can use a simple HTTP server:

```bash
# Using Python (if installed)
python -m http.server 8000

# Or using Node.js
npx http-server

# Then visit http://localhost:8000
```

## Features

- **Theme Support**: Light, Purple, Teal, and Dark themes
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Pastor page updates when admin sends reports
- **Data Persistence**: Uses localStorage for data storage
- **Developer Tools**: Built-in debugging and data management

## Technologies

- HTML5
- CSS3 (with CSS Variables for theming)
- Vanilla JavaScript
- Google Fonts (Cormorant Garamond, Cinzel, EB Garamond)

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

© 2026 Holy Ghost Triumphant Ministries. All rights reserved.