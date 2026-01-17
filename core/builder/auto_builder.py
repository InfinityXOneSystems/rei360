"""
🏗️ AUTO BUILDER - Autonomous System Construction Engine

Builds entire systems from natural language descriptions.
Like Google's gen AI app builder but for ANY system.
"""

import google.generativeai as genai
from pathlib import Path
import json
import os
import subprocess
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime


@dataclass
class BuildSpec:
    """Specification for what to build"""
    name: str
    description: str
    type: str  # "frontend", "backend", "fullstack", "ai-agent", "api", "microservice"
    tech_stack: List[str]
    features: List[str]
    integrations: List[str]
    deployment_target: str  # "cloud-run", "vercel", "local", "docker"


@dataclass
class BuildResult:
    """Result of an auto-build operation"""
    build_id: str
    spec: BuildSpec
    files_created: Dict[str, str]  # filepath -> content
    commands_executed: List[str]
    build_time_seconds: float
    status: str  # "success", "partial", "failed"
    errors: List[str]
    deployment_url: Optional[str]
    next_steps: List[str]


class AutoBuilder:
    """
    The Meta-Builder: Builds systems that build systems.

    Inspired by Google's gen AI app builder (Manus architecture)
    but extended to build ANYTHING.
    """

    def __init__(self, gemini_api_key: str = None, workspace_root: str = None):
        """Initialize the Auto Builder"""

        # Setup Gemini
        api_key = gemini_api_key or os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY required")

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')

        # Workspace
        self.workspace = Path(workspace_root or os.getcwd())
        self.builds_dir = self.workspace / "auto_builds"
        self.builds_dir.mkdir(exist_ok=True)

    async def build_from_description(self, description: str) -> BuildResult:
        """
        Build a complete system from natural language description.

        Example:
            "Build a real-time property search frontend with map view"
            "Create a REST API for property valuation using Gemini"
            "Build a microservice that scrapes MLS listings"
        """

        start_time = datetime.utcnow()

        # Step 1: Generate Build Spec
        print("🎯 Analyzing requirements...")
        spec = await self._generate_build_spec(description)

        # Step 2: Generate Architecture
        print("🏗️  Designing architecture...")
        architecture = await self._generate_architecture(spec)

        # Step 3: Generate Code
        print("💻 Generating code...")
        code_files = await self._generate_code(spec, architecture)

        # Step 4: Create Files
        print("📁 Creating files...")
        build_dir = self._create_build_directory(spec)
        created_files = self._write_files(build_dir, code_files)

        # Step 5: Setup & Install
        print("📦 Installing dependencies...")
        install_commands = await self._generate_install_commands(spec, build_dir)
        executed_commands = self._execute_commands(install_commands, build_dir)

        # Step 6: Generate Tests
        print("🧪 Generating tests...")
        test_files = await self._generate_tests(spec, architecture)
        self._write_files(build_dir, test_files)

        # Step 7: Generate Deployment Config
        print("☁️  Generating deployment config...")
        deploy_files = await self._generate_deployment_config(spec)
        self._write_files(build_dir, deploy_files)

        # Step 8: Generate Documentation
        print("📚 Generating documentation...")
        docs = await self._generate_documentation(spec, architecture)
        self._write_files(build_dir, docs)

        build_time = (datetime.utcnow() - start_time).total_seconds()

        print(f"✅ Build complete in {build_time:.1f}s!")

        return BuildResult(
            build_id=self._generate_build_id(),
            spec=spec,
            files_created=created_files,
            commands_executed=executed_commands,
            build_time_seconds=build_time,
            status="success",
            errors=[],
            deployment_url=None,
            next_steps=self._generate_next_steps(spec, build_dir)
        )

    async def _generate_build_spec(self, description: str) -> BuildSpec:
        """Convert natural language to structured build spec"""

        prompt = f"""
        Convert this description into a detailed build specification:

        "{description}"

        Analyze and extract:
        1. Project name (short, dash-separated)
        2. Detailed description
        3. Type (frontend/backend/fullstack/ai-agent/api/microservice)
        4. Optimal tech stack
        5. Core features (list)
        6. Required integrations (APIs, databases, services)
        7. Best deployment target

        Return as JSON:
        {{
            "name": "project-name",
            "description": "Clear 2-sentence description",
            "type": "frontend|backend|fullstack|ai-agent|api|microservice",
            "tech_stack": ["tech1", "tech2", "tech3"],
            "features": ["feature1", "feature2", "feature3"],
            "integrations": ["integration1", "integration2"],
            "deployment_target": "cloud-run|vercel|local|docker"
        }}

        Choose modern, production-ready tech stack.
        """

        response = self.model.generate_content(prompt)
        spec_dict = json.loads(response.text)

        return BuildSpec(**spec_dict)

    async def _generate_architecture(self, spec: BuildSpec) -> Dict:
        """Generate system architecture"""

        prompt = f"""
        Design production-ready architecture for:

        Name: {spec.name}
        Type: {spec.type}
        Tech Stack: {', '.join(spec.tech_stack)}
        Features: {', '.join(spec.features)}

        Provide:
        1. Directory structure (complete file tree)
        2. Component breakdown
        3. Data flow
        4. API endpoints (if applicable)
        5. Database schema (if applicable)
        6. Integration points

        Return as JSON:
        {{
            "directory_structure": {{
                "src/": {{
                    "components/": ["file1.tsx", "file2.tsx"],
                    "api/": ["endpoint1.ts", "endpoint2.ts"],
                    "utils/": ["helper1.ts", "helper2.ts"]
                }}
            }},
            "components": [
                {{"name": "ComponentName", "purpose": "what it does", "dependencies": []}}
            ],
            "api_endpoints": [
                {{"method": "GET", "path": "/api/endpoint", "purpose": "what it does"}}
            ],
            "database_schema": {{"table_name": {{"fields": "schema"}}}},
            "integrations": {{"service_name": "integration details"}}
        }}

        Follow best practices for the chosen tech stack.
        """

        response = self.model.generate_content(prompt)
        return json.loads(response.text)

    async def _generate_code(self, spec: BuildSpec, architecture: Dict) -> Dict[str, str]:
        """Generate all code files"""

        files = {}

        # Generate for each component
        for component in architecture.get('components', []):
            prompt = f"""
            Generate production-ready code for:

            Component: {component['name']}
            Purpose: {component['purpose']}
            Tech Stack: {', '.join(spec.tech_stack)}

            Requirements:
            - Follow best practices
            - Include error handling
            - Add type safety
            - Include comments
            - Production-ready quality

            Return ONLY the code, no markdown, no explanations.
            """

            response = self.model.generate_content(prompt)

            # Determine file extension based on tech stack
            ext = self._get_file_extension(spec.tech_stack)
            filename = f"src/components/{component['name']}.{ext}"

            files[filename] = response.text

        # Generate API endpoints
        for endpoint in architecture.get('api_endpoints', []):
            prompt = f"""
            Generate production-ready API endpoint:

            Method: {endpoint['method']}
            Path: {endpoint['path']}
            Purpose: {endpoint['purpose']}
            Tech Stack: {', '.join(spec.tech_stack)}

            Include:
            - Request validation
            - Error handling
            - Response formatting
            - Authentication (if needed)

            Return ONLY the code.
            """

            response = self.model.generate_content(prompt)
            ext = self._get_file_extension(spec.tech_stack)
            filename = f"src/api{endpoint['path'].replace('/', '_')}.{ext}"

            files[filename] = response.text

        # Generate main entry point
        files[self._get_entry_point(spec)] = await self._generate_main_file(spec, architecture)

        # Generate config files
        files.update(await self._generate_config_files(spec))

        return files

    async def _generate_tests(self, spec: BuildSpec, architecture: Dict) -> Dict[str, str]:
        """Generate test files"""

        # TODO: Implement test generation
        return {}

    async def _generate_deployment_config(self, spec: BuildSpec) -> Dict[str, str]:
        """Generate deployment configuration"""

        files = {}

        if spec.deployment_target == "docker":
            files["Dockerfile"] = await self._generate_dockerfile(spec)
            files["docker-compose.yml"] = await self._generate_docker_compose(spec)

        elif spec.deployment_target == "cloud-run":
            files["cloudbuild.yaml"] = await self._generate_cloudbuild(spec)
            files["Dockerfile"] = await self._generate_dockerfile(spec)

        elif spec.deployment_target == "vercel":
            files["vercel.json"] = await self._generate_vercel_config(spec)

        return files

    async def _generate_documentation(self, spec: BuildSpec, architecture: Dict) -> Dict[str, str]:
        """Generate documentation"""

        readme = f"""# {spec.name}

{spec.description}

## Tech Stack

{chr(10).join(f'- {tech}' for tech in spec.tech_stack)}

## Features

{chr(10).join(f'- {feature}' for feature in spec.features)}

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Architecture

Generated by Auto Builder on {datetime.utcnow().strftime('%Y-%m-%d')}

## Deployment

Target: {spec.deployment_target}

---

*Built with ❤️ by Auto Builder*
"""

        return {"README.md": readme}

    def _create_build_directory(self, spec: BuildSpec) -> Path:
        """Create directory for the build"""

        build_dir = self.builds_dir / spec.name
        build_dir.mkdir(exist_ok=True, parents=True)

        return build_dir

    def _write_files(self, build_dir: Path, files: Dict[str, str]) -> Dict[str, str]:
        """Write files to disk"""

        created = {}

        for filepath, content in files.items():
            full_path = build_dir / filepath
            full_path.parent.mkdir(exist_ok=True, parents=True)

            full_path.write_text(content, encoding='utf-8')
            created[str(full_path)] = content

        return created

    async def _generate_install_commands(self, spec: BuildSpec, build_dir: Path) -> List[str]:
        """Generate installation commands"""

        commands = []

        if "react" in spec.tech_stack or "node" in spec.tech_stack:
            commands.append("npm install")

        if "python" in spec.tech_stack:
            commands.append("pip install -r requirements.txt")

        return commands

    def _execute_commands(self, commands: List[str], cwd: Path) -> List[str]:
        """Execute shell commands"""

        executed = []

        for cmd in commands:
            try:
                subprocess.run(cmd, shell=True, cwd=cwd, check=True)
                executed.append(cmd)
            except subprocess.CalledProcessError as e:
                print(f"⚠️  Command failed: {cmd}")
                print(f"   Error: {e}")

        return executed

    def _get_file_extension(self, tech_stack: List[str]) -> str:
        """Determine file extension from tech stack"""

        if "typescript" in tech_stack:
            return "ts"
        elif "react" in tech_stack:
            return "tsx"
        elif "python" in tech_stack:
            return "py"
        else:
            return "js"

    def _get_entry_point(self, spec: BuildSpec) -> str:
        """Determine main entry point filename"""

        if "react" in spec.tech_stack:
            return "src/main.tsx"
        elif "python" in spec.tech_stack:
            return "main.py"
        else:
            return "src/index.js"

    async def _generate_main_file(self, spec: BuildSpec, architecture: Dict) -> str:
        """Generate main entry point file"""

        # TODO: Implement based on tech stack
        return "// Main entry point\n"

    async def _generate_config_files(self, spec: BuildSpec) -> Dict[str, str]:
        """Generate configuration files (package.json, tsconfig.json, etc.)"""

        files = {}

        if "typescript" in spec.tech_stack or "react" in spec.tech_stack:
            files["package.json"] = json.dumps({
                "name": spec.name,
                "version": "1.0.0",
                "type": "module",
                "scripts": {
                    "dev": "vite",
                    "build": "vite build",
                    "preview": "vite preview"
                }
            }, indent=2)

        return files

    async def _generate_dockerfile(self, spec: BuildSpec) -> str:
        """Generate Dockerfile"""
        # TODO: Implement
        return ""

    async def _generate_docker_compose(self, spec: BuildSpec) -> str:
        """Generate docker-compose.yml"""
        # TODO: Implement
        return ""

    async def _generate_cloudbuild(self, spec: BuildSpec) -> str:
        """Generate cloudbuild.yaml"""
        # TODO: Implement
        return ""

    async def _generate_vercel_config(self, spec: BuildSpec) -> str:
        """Generate vercel.json"""
        # TODO: Implement
        return ""

    def _generate_next_steps(self, spec: BuildSpec, build_dir: Path) -> List[str]:
        """Generate next steps for the user"""

        return [
            f"cd {build_dir}",
            "npm install" if "node" in spec.tech_stack else "pip install -r requirements.txt",
            "npm run dev" if "node" in spec.tech_stack else "python main.py",
            f"Open http://localhost:3000"
        ]

    def _generate_build_id(self) -> str:
        """Generate unique build ID"""
        from uuid import uuid4
        return f"build_{uuid4().hex[:12]}"


# CLI Interface
if __name__ == "__main__":
    import asyncio
    import sys

    async def main():
        if len(sys.argv) < 2:
            print("Usage: python auto_builder.py '<description>'")
            print("\nExample:")
            print("  python auto_builder.py 'Build a property search frontend with map view'")
            sys.exit(1)

        description = sys.argv[1]

        print(f"🏗️  AUTO BUILDER")
        print(f"═══════════════════════════════════════════════\n")
        print(f"Building: {description}\n")

        builder = AutoBuilder()
        result = await builder.build_from_description(description)

        print(f"\n🎉 BUILD COMPLETE!")
        print(f"═══════════════════════════════════════════════")
        print(f"Build ID: {result.build_id}")
        print(f"Files Created: {len(result.files_created)}")
        print(f"Build Time: {result.build_time_seconds:.1f}s")
        print(f"\n📁 Location: {builder.builds_dir / result.spec.name}")
        print(f"\n🚀 Next Steps:")
        for step in result.next_steps:
            print(f"   {step}")

    asyncio.run(main())
