"""
🎨 FRONTEND BUILDER - Like Google's gen AI app builder for frontend

Builds complete React/Vite frontends from natural language.
Inspired by how Manus was built with Google's tools.
"""

import google.generativeai as genai
from pathlib import Path
import json
import os
from typing import Dict, List


class FrontendBuilder:
    """
    Build complete frontends using AI.

    Similar to Google's gen AI app builder but specialized for frontends.
    """

    def __init__(self, gemini_api_key: str = None):
        api_key = gemini_api_key or os.getenv('GEMINI_API_KEY')
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')

    async def build_component(self, description: str) -> str:
        """Build a single React component from description"""

        prompt = f"""
        Generate a production-ready React TypeScript component:

        Description: {description}

        Requirements:
        - Use React 18+ with TypeScript
        - Use Tailwind CSS for styling
        - Include proper types
        - Add error handling
        - Make it responsive
        - Follow best practices

        Return ONLY the complete component code, no markdown, no explanations.
        """

        response = self.model.generate_content(prompt)
        return response.text

    async def build_page(self, description: str) -> Dict[str, str]:
        """Build a complete page with multiple components"""

        prompt = f"""
        Design a complete React page:

        Description: {description}

        Break down into:
        1. Layout component
        2. Main components (list with names and purposes)
        3. Helper components
        4. Types/interfaces needed
        5. API calls needed

        Return as JSON:
        {{
            "page_name": "PageName",
            "layout": "LayoutComponent",
            "components": [
                {{"name": "ComponentName", "purpose": "what it does"}}
            ],
            "helpers": ["helper1", "helper2"],
            "types": {{"TypeName": "type definition"}},
            "api_calls": [
                {{"name": "fetchData", "endpoint": "/api/endpoint", "method": "GET"}}
            ]
        }}
        """

        response = self.model.generate_content(prompt)
        design = json.loads(response.text)

        # Generate each component
        files = {}

        for component in design['components']:
            code = await self.build_component(component['purpose'])
            files[f"src/components/{component['name']}.tsx"] = code

        # Generate main page
        page_code = await self._generate_page_code(design)
        files[f"src/pages/{design['page_name']}.tsx"] = page_code

        return files

    async def build_full_app(self, description: str) -> Dict[str, str]:
        """Build a complete frontend application"""

        print("🎯 Analyzing requirements...")

        # Step 1: Generate app structure
        prompt = f"""
        Design a complete React/Vite application:

        Description: {description}

        Provide:
        1. App name
        2. Pages needed (with routes)
        3. Shared components
        4. Global state structure
        5. API endpoints
        6. Styling approach

        Return as JSON:
        {{
            "app_name": "app-name",
            "pages": [
                {{"name": "HomePage", "route": "/", "purpose": "what it does"}}
            ],
            "shared_components": ["Header", "Footer", "Sidebar"],
            "state_structure": {{"key": "type"}},
            "api_endpoints": ["/api/endpoint1", "/api/endpoint2"],
            "styling": "tailwind"
        }}
        """

        response = self.model.generate_content(prompt)
        structure = json.loads(response.text)

        print(f"🏗️  Building {structure['app_name']}...")

        files = {}

        # Generate pages
        for page in structure['pages']:
            print(f"  📄 Generating {page['name']}...")
            page_files = await self.build_page(page['purpose'])
            files.update(page_files)

        # Generate shared components
        for component in structure['shared_components']:
            print(f"  🧩 Generating {component}...")
            code = await self.build_component(f"Create a {component} component")
            files[f"src/components/{component}.tsx"] = code

        # Generate config files
        print("  ⚙️  Generating config...")
        files.update(self._generate_config_files(structure))

        # Generate main entry point
        files["src/main.tsx"] = self._generate_main_tsx(structure)

        # Generate App component with routing
        files["src/App.tsx"] = await self._generate_app_component(structure)

        print("✅ Build complete!")

        return files

    async def _generate_page_code(self, design: Dict) -> str:
        """Generate the main page component code"""

        # TODO: Implement based on design
        return "// Page code"

    async def _generate_app_component(self, structure: Dict) -> str:
        """Generate App.tsx with routing"""

        routes = "\n".join([
            f'        <Route path="{page["route"]}" element={{<{page["name"]} />}} />'
            for page in structure['pages']
        ])

        imports = "\n".join([
            f"import {page['name']} from './pages/{page['name']}'"
            for page in structure['pages']
        ])

        return f"""import {{ BrowserRouter as Router, Routes, Route }} from 'react-router-dom'
{imports}

function App() {{
  return (
    <Router>
      <Routes>
{routes}
      </Routes>
    </Router>
  )
}}

export default App
"""

    def _generate_main_tsx(self, structure: Dict) -> str:
        """Generate main.tsx entry point"""

        return """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
"""

    def _generate_config_files(self, structure: Dict) -> Dict[str, str]:
        """Generate configuration files"""

        files = {}

        # package.json
        files["package.json"] = json.dumps({
            "name": structure['app_name'],
            "version": "1.0.0",
            "type": "module",
            "scripts": {
                "dev": "vite",
                "build": "tsc && vite build",
                "preview": "vite preview"
            },
            "dependencies": {
                "react": "^18.2.0",
                "react-dom": "^18.2.0",
                "react-router-dom": "^6.20.0"
            },
            "devDependencies": {
                "@types/react": "^18.2.37",
                "@types/react-dom": "^18.2.15",
                "@vitejs/plugin-react": "^4.2.1",
                "typescript": "^5.2.2",
                "vite": "^5.0.8",
                "tailwindcss": "^3.4.0",
                "autoprefixer": "^10.4.16",
                "postcss": "^8.4.31"
            }
        }, indent=2)

        # vite.config.ts
        files["vite.config.ts"] = """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
"""

        # tsconfig.json
        files["tsconfig.json"] = json.dumps({
            "compilerOptions": {
                "target": "ES2020",
                "useDefineForClassFields": True,
                "lib": ["ES2020", "DOM", "DOM.Iterable"],
                "module": "ESNext",
                "skipLibCheck": True,
                "moduleResolution": "bundler",
                "allowImportingTsExtensions": True,
                "resolveJsonModule": True,
                "isolatedModules": True,
                "noEmit": True,
                "jsx": "react-jsx",
                "strict": True,
                "noUnusedLocals": True,
                "noUnusedParameters": True,
                "noFallthroughCasesInSwitch": True
            },
            "include": ["src"],
            "references": [{"path": "./tsconfig.node.json"}]
        }, indent=2)

        # tailwind.config.js
        files["tailwind.config.js"] = """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
"""

        # index.html
        files["index.html"] = f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{structure['app_name']}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
"""

        # index.css
        files["src/index.css"] = """@tailwind base;
@tailwind components;
@tailwind utilities;
"""

        return files


# CLI
if __name__ == "__main__":
    import asyncio
    import sys

    async def main():
        if len(sys.argv) < 2:
            print("Usage: python frontend_builder.py '<description>'")
            print("\nExample:")
            print("  python frontend_builder.py 'Build a property search app with map view'")
            sys.exit(1)

        description = sys.argv[1]

        builder = FrontendBuilder()
        files = await builder.build_full_app(description)

        # Write files
        output_dir = Path("auto_builds") / "frontend"
        output_dir.mkdir(exist_ok=True, parents=True)

        for filepath, content in files.items():
            full_path = output_dir / filepath
            full_path.parent.mkdir(exist_ok=True, parents=True)
            full_path.write_text(content, encoding='utf-8')

        print(f"\n📁 Files created in: {output_dir}")
        print("\n🚀 Next steps:")
        print(f"   cd {output_dir}")
        print("   npm install")
        print("   npm run dev")

    asyncio.run(main())
