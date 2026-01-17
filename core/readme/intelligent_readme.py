"""
Intelligent README System
Auto-generates and maintains comprehensive README files
Learns from project structure and updates automatically
"""

from typing import Dict, List, Optional
from datetime import datetime
from pathlib import Path
import json
import google.generativeai as genai
from google.cloud import firestore


class IntelligentReadmeSystem:
    """
    Self-updating README generation system
    Scans project, understands structure, generates documentation
    """

    def __init__(self, project_root: str, gemini_api_key: str, firestore_project: str):
        self.project_root = Path(project_root)
        genai.configure(api_key=gemini_api_key)
        self.gemini_model = genai.GenerativeModel('gemini-pro')
        self.firestore_db = firestore.Client(project=firestore_project)

        self.readme_templates = self._load_templates()

    async def generate_readme(
        self,
        target_path: Optional[str] = None,
        auto_update: bool = True
    ) -> str:
        """Generate comprehensive README for project or directory"""

        if target_path is None:
            target_path = self.project_root
        else:
            target_path = Path(target_path)

        # Scan project structure
        structure = await self._scan_directory(target_path)

        # Analyze code and dependencies
        analysis = await self._analyze_project(target_path)

        # Generate README content
        readme_content = await self._generate_content(
            path=target_path,
            structure=structure,
            analysis=analysis
        )

        # Write README
        readme_path = target_path / "README.md"
        readme_path.write_text(readme_content)

        # Track generation
        await self._track_generation(str(target_path), readme_content)

        if auto_update:
            await self._setup_auto_update(target_path)

        return readme_content

    async def _scan_directory(self, path: Path) -> Dict:
        """Scan directory structure"""

        structure = {
            'path': str(path),
            'name': path.name,
            'files': [],
            'directories': [],
            'key_files': {}
        }

        # Identify key files
        key_patterns = {
            'package.json': 'node_project',
            'requirements.txt': 'python_project',
            'Dockerfile': 'docker_project',
            'docker-compose.yml': 'docker_compose',
            'pyproject.toml': 'python_poetry',
            '.env.example': 'env_config',
            'terraform': 'infrastructure'
        }

        for item in path.iterdir():
            if item.is_file():
                structure['files'].append(item.name)

                # Check for key files
                for pattern, type in key_patterns.items():
                    if pattern in item.name:
                        structure['key_files'][type] = str(item)

            elif item.is_dir() and not item.name.startswith('.'):
                structure['directories'].append(item.name)

        return structure

    async def _analyze_project(self, path: Path) -> Dict:
        """Analyze project characteristics"""

        analysis = {
            'type': 'unknown',
            'languages': [],
            'frameworks': [],
            'dependencies': [],
            'services': [],
            'deployment': []
        }

        # Detect project type
        if (path / 'package.json').exists():
            analysis['type'] = 'javascript/typescript'
            analysis['dependencies'] = self._parse_package_json(path / 'package.json')

        if (path / 'requirements.txt').exists():
            analysis['type'] = 'python'
            analysis['dependencies'] = self._parse_requirements(path / 'requirements.txt')

        if (path / 'docker-compose.yml').exists():
            analysis['services'] = await self._parse_docker_compose(path / 'docker-compose.yml')

        # Detect frameworks
        analysis['frameworks'] = await self._detect_frameworks(path)

        return analysis

    def _parse_package_json(self, file_path: Path) -> List[str]:
        """Parse package.json dependencies"""
        try:
            data = json.loads(file_path.read_text())
            deps = list(data.get('dependencies', {}).keys())
            deps.extend(data.get('devDependencies', {}).keys())
            return deps
        except:
            return []

    def _parse_requirements(self, file_path: Path) -> List[str]:
        """Parse requirements.txt"""
        try:
            return [
                line.split('==')[0].split('>=')[0].strip()
                for line in file_path.read_text().splitlines()
                if line.strip() and not line.startswith('#')
            ]
        except:
            return []

    async def _parse_docker_compose(self, file_path: Path) -> List[str]:
        """Parse docker-compose services"""
        try:
            import yaml
            data = yaml.safe_load(file_path.read_text())
            return list(data.get('services', {}).keys())
        except:
            return []

    async def _detect_frameworks(self, path: Path) -> List[str]:
        """Detect frameworks used"""
        frameworks = []

        # Check for common frameworks
        checks = {
            'react': lambda: (path / 'node_modules' / 'react').exists(),
            'vue': lambda: (path / 'node_modules' / 'vue').exists(),
            'angular': lambda: (path / 'node_modules' / '@angular').exists(),
            'flask': lambda: 'flask' in str((path / 'requirements.txt').read_text() if (path / 'requirements.txt').exists() else ''),
            'fastapi': lambda: 'fastapi' in str((path / 'requirements.txt').read_text() if (path / 'requirements.txt').exists() else ''),
            'django': lambda: 'django' in str((path / 'requirements.txt').read_text() if (path / 'requirements.txt').exists() else '')
        }

        for framework, check in checks.items():
            try:
                if check():
                    frameworks.append(framework)
            except:
                pass

        return frameworks

    async def _generate_content(self, path: Path, structure: Dict, analysis: Dict) -> str:
        """Generate README content using AI"""

        prompt = f"""
        Generate a comprehensive README.md for this project:

        Path: {path}
        Type: {analysis['type']}
        Frameworks: {', '.join(analysis['frameworks'])}

        Project Structure:
        Directories: {', '.join(structure['directories'])}
        Key Files: {', '.join(structure['key_files'].keys())}

        Services: {', '.join(analysis['services'])}
        Dependencies: {len(analysis['dependencies'])} packages

        Create a professional README with:
        1. # Project Title
        2. ## Overview (concise description)
        3. ## Features (bullet list)
        4. ## Architecture (high-level)
        5. ## Prerequisites
        6. ## Installation (step-by-step)
        7. ## Usage (with examples)
        8. ## Project Structure (tree view)
        9. ## Configuration
        10. ## Development (running locally)
        11. ## Deployment
        12. ## API Documentation (if applicable)
        13. ## Contributing
        14. ## License

        Use clear formatting, code blocks, and badges where appropriate.
        Be concise but comprehensive.
        """

        response = self.gemini_model.generate_content(prompt)

        # Add auto-generation notice
        header = f"""<!-- AUTO-GENERATED README -->
<!-- Generated: {datetime.utcnow().isoformat()} -->
<!-- System: Intelligent README Generator -->

"""

        return header + response.text

    async def _track_generation(self, path: str, content: str):
        """Track README generation"""
        self.firestore_db.collection('readme_generations').document().set({
            'path': path,
            'timestamp': datetime.utcnow(),
            'content_hash': hash(content),
            'length': len(content)
        })

    async def _setup_auto_update(self, path: Path):
        """Setup automatic README updates"""
        # Create a watcher file
        watcher_path = path / '.readme_watcher.json'
        watcher_path.write_text(json.dumps({
            'enabled': True,
            'last_update': datetime.utcnow().isoformat(),
            'update_interval_hours': 24
        }, indent=2))

    async def update_all_readmes(self):
        """Update all tracked READMEs"""

        # Find all README watchers
        watchers = list(self.project_root.rglob('.readme_watcher.json'))

        for watcher in watchers:
            config = json.loads(watcher.read_text())

            if not config.get('enabled'):
                continue

            # Check if update needed
            last_update = datetime.fromisoformat(config['last_update'])
            hours_since = (datetime.utcnow() - last_update).total_seconds() / 3600

            if hours_since >= config['update_interval_hours']:
                print(f"🔄 Updating README: {watcher.parent}")
                await self.generate_readme(str(watcher.parent))

    def _load_templates(self) -> Dict:
        """Load README templates"""
        return {
            'minimal': """# {title}

{description}

## Installation

```bash
{install_commands}
```

## Usage

{usage_instructions}
""",
            'standard': """# {title}

{description}

## Features

{features}

## Installation

{installation}

## Usage

{usage}

## License

{license}
""",
            'comprehensive': """# {title}

[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![Status](https://img.shields.io/badge/status-active-success.svg)]()

{description}

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

{features}

## 🏗️ Architecture

{architecture}

## 📦 Installation

{installation}

## 🚀 Usage

{usage}

## 📚 API Documentation

{api_docs}

## 💻 Development

{development}

## 🌐 Deployment

{deployment}

## 🤝 Contributing

{contributing}

## 📄 License

{license}
"""
        }


if __name__ == "__main__":
    import asyncio

    async def main():
        system = IntelligentReadmeSystem(
            project_root="c:/AI/repos/real-estate-intelligence",
            gemini_api_key="YOUR_API_KEY",
            firestore_project="real-estate-intelligence"
        )

        # Generate README for current project
        readme = await system.generate_readme()
        print("✅ README generated successfully!")
        print(f"Length: {len(readme)} characters")

    asyncio.run(main())
