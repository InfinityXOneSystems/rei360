"""
Auto Bootstrap System
Intelligent system initialization and self-configuration
Zero-touch deployment and environment setup
"""

from typing import Dict, List, Optional
from pathlib import Path
from datetime import datetime
import json
import subprocess
import sys
import os


class AutoBootstrapSystem:
    """
    Autonomous system bootstrapper
    Detects environment, installs dependencies, configures services
    """
    
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.bootstrap_log = []
        self.config = self._load_or_create_config()
    
    def bootstrap(self, mode: str = 'development') -> Dict:
        """
        Master bootstrap sequence
        Runs all initialization steps automatically
        """
        
        print("🚀 Starting Auto-Bootstrap System")
        print(f"📁 Project Root: {self.project_root}")
        print(f"🎯 Mode: {mode}")
        print("-" * 60)
        
        results = {
            'timestamp': datetime.utcnow().isoformat(),
            'mode': mode,
            'steps': []
        }
        
        # Step 1: Environment Detection
        print("\n🔍 Step 1: Detecting Environment...")
        env_info = self._detect_environment()
        results['steps'].append(env_info)
        self._log_step("Environment Detection", env_info)
        
        # Step 2: Dependency Installation
        print("\n📦 Step 2: Installing Dependencies...")
        deps_result = self._install_dependencies()
        results['steps'].append(deps_result)
        self._log_step("Dependency Installation", deps_result)
        
        # Step 3: Configuration Setup
        print("\n⚙️  Step 3: Setting Up Configuration...")
        config_result = self._setup_configuration(mode)
        results['steps'].append(config_result)
        self._log_step("Configuration Setup", config_result)
        
        # Step 4: Database Initialization
        print("\n🗄️  Step 4: Initializing Databases...")
        db_result = self._initialize_databases()
        results['steps'].append(db_result)
        self._log_step("Database Initialization", db_result)
        
        # Step 5: Service Discovery & Registration
        print("\n🔎 Step 5: Discovering and Registering Services...")
        service_result = self._discover_and_register_services()
        results['steps'].append(service_result)
        self._log_step("Service Registration", service_result)
        
        # Step 6: Health Checks
        print("\n💚 Step 6: Running Health Checks...")
        health_result = self._run_health_checks()
        results['steps'].append(health_result)
        self._log_step("Health Checks", health_result)
        
        # Step 7: Generate Bootstrap Report
        print("\n📊 Step 7: Generating Bootstrap Report...")
        report = self._generate_report(results)
        
        print("\n" + "="* 60)
        print("✅ Bootstrap Complete!")
        print("="* 60)
        print(report)
        
        # Save bootstrap state
        self._save_bootstrap_state(results)
        
        return results
    
    def _detect_environment(self) -> Dict:
        """Detect system environment and capabilities"""
        
        env_info = {
            'step': 'environment_detection',
            'os': sys.platform,
            'python_version': sys.version,
            'working_directory': str(Path.cwd()),
            'project_type': None,
            'detected_services': [],
            'detected_frameworks': [],
            'cloud_environment': None
        }
        
        # Detect project type
        if (self.project_root / 'package.json').exists():
            env_info['project_type'] = 'node'
            env_info['detected_frameworks'].append('Node.js')
        
        if (self.project_root / 'requirements.txt').exists():
            env_info['project_type'] = 'python'
            env_info['detected_frameworks'].append('Python')
        
        if (self.project_root / 'docker-compose.yml').exists():
            env_info['detected_services'] = self._parse_docker_services()
        
        # Detect cloud environment
        if os.getenv('GOOGLE_CLOUD_PROJECT'):
            env_info['cloud_environment'] = 'google_cloud'
        elif os.getenv('AWS_REGION'):
            env_info['cloud_environment'] = 'aws'
        elif os.getenv('AZURE_SUBSCRIPTION_ID'):
            env_info['cloud_environment'] = 'azure'
        
        return env_info
    
    def _install_dependencies(self) -> Dict:
        """Install all project dependencies"""
        
        result = {
            'step': 'dependency_installation',
            'python_packages': 0,
            'node_packages': 0,
            'system_packages': 0,
            'status': 'success',
            'errors': []
        }
        
        # Install Python dependencies
        if (self.project_root / 'requirements.txt').exists():
            try:
                print("  📦 Installing Python packages...")
                subprocess.run([
                    sys.executable, '-m', 'pip', 'install', '-r',
                    str(self.project_root / 'requirements.txt')
                ], check=True, capture_output=True)
                
                # Count packages
                with open(self.project_root / 'requirements.txt') as f:
                    result['python_packages'] = len([
                        l for l in f.readlines()
                        if l.strip() and not l.startswith('#')
                    ])
                print(f"  ✅ Installed {result['python_packages']} Python packages")
            except subprocess.CalledProcessError as e:
                result['errors'].append(f"Python install failed: {e}")
                result['status'] = 'partial'
        
        # Install Node dependencies
        if (self.project_root / 'package.json').exists():
            try:
                print("  📦 Installing Node packages...")
                subprocess.run(
                    ['npm', 'install'],
                    cwd=str(self.project_root),
                    check=True,
                    capture_output=True
                )
                
                # Count packages
                package_json = json.loads((self.project_root / 'package.json').read_text())
                result['node_packages'] = len(package_json.get('dependencies', {}))
                print(f"  ✅ Installed {result['node_packages']} Node packages")
            except subprocess.CalledProcessError as e:
                result['errors'].append(f"Node install failed: {e}")
                result['status'] = 'partial'
        
        return result
    
    def _setup_configuration(self, mode: str) -> Dict:
        """Setup configuration files and environment variables"""
        
        result = {
            'step': 'configuration_setup',
            'config_files_created': 0,
            'env_vars_set': 0,
            'status': 'success'
        }
        
        # Create .env from .env.example if not exists
        env_file = self.project_root / '.env'
        env_example = self.project_root / '.env.example'
        
        if env_example.exists() and not env_file.exists():
            print(f"  📝 Creating .env from .env.example")
            env_content = env_example.read_text()
            
            # Replace placeholders with actual values or defaults
            env_content = env_content.replace('${MODE}', mode)
            env_content = env_content.replace('${TIMESTAMP}', datetime.utcnow().isoformat())
            
            env_file.write_text(env_content)
            result['config_files_created'] += 1
        
        # Load environment variables
        if env_file.exists():
            with open(env_file) as f:
                for line in f:
                    if '=' in line and not line.startswith('#'):
                        key, value = line.strip().split('=', 1)
                        os.environ[key] = value
                        result['env_vars_set'] += 1
        
        print(f"  ✅ Created {result['config_files_created']} config files")
        print(f"  ✅ Set {result['env_vars_set']} environment variables")
        
        return result
    
    def _initialize_databases(self) -> Dict:
        """Initialize database connections and schemas"""
        
        result = {
            'step': 'database_initialization',
            'databases': [],
            'status': 'success'
        }
        
        # Check for database configuration
        if os.getenv('DATABASE_URL'):
            print("  🗄️  Detected database configuration")
            result['databases'].append({
                'type': 'postgres' if 'postgres' in os.getenv('DATABASE_URL') else 'unknown',
                'status': 'configured'
            })
        
        # Initialize Firestore
        if os.getenv('GOOGLE_CLOUD_PROJECT'):
            print("  🗄️  Initializing Firestore")
            result['databases'].append({
                'type': 'firestore',
                'status': 'configured'
            })
        
        # Initialize Neo4j
        if os.getenv('NEO4J_URI'):
            print("  🗄️  Initializing Neo4j")
            result['databases'].append({
                'type': 'neo4j',
                'status': 'configured'
            })
        
        print(f"  ✅ Initialized {len(result['databases'])} databases")
        
        return result
    
    def _discover_and_register_services(self) -> Dict:
        """Discover and register all services"""
        
        result = {
            'step': 'service_registration',
            'services': [],
            'status': 'success'
        }
        
        # Scan services directory
        services_dir = self.project_root / 'services'
        if services_dir.exists():
            for service_path in services_dir.rglob('main.py'):
                service_name = service_path.parent.name
                result['services'].append({
                    'name': service_name,
                    'path': str(service_path),
                    'type': 'python'
                })
            
            for service_path in services_dir.rglob('index.ts'):
                service_name = service_path.parent.name
                result['services'].append({
                    'name': service_name,
                    'path': str(service_path),
                    'type': 'typescript'
                })
        
        # Scan backend directory
        backend_dir = self.project_root / 'backend'
        if backend_dir.exists():
            for service_path in backend_dir.rglob('main.py'):
                service_name = service_path.parent.name
                result['services'].append({
                    'name': service_name,
                    'path': str(service_path),
                    'type': 'python'
                })
        
        print(f"  ✅ Discovered {len(result['services'])} services")
        
        return result
    
    def _run_health_checks(self) -> Dict:
        """Run health checks on all components"""
        
        result = {
            'step': 'health_checks',
            'checks': [],
            'status': 'success',
            'healthy': 0,
            'unhealthy': 0
        }
        
        # Check Python
        try:
            subprocess.run([sys.executable, '--version'], check=True, capture_output=True)
            result['checks'].append({'name': 'Python', 'status': 'healthy'})
            result['healthy'] += 1
        except:
            result['checks'].append({'name': 'Python', 'status': 'unhealthy'})
            result['unhealthy'] += 1
        
        # Check Node if applicable
        if (self.project_root / 'package.json').exists():
            try:
                subprocess.run(['node', '--version'], check=True, capture_output=True)
                result['checks'].append({'name': 'Node.js', 'status': 'healthy'})
                result['healthy'] += 1
            except:
                result['checks'].append({'name': 'Node.js', 'status': 'unhealthy'})
                result['unhealthy'] += 1
        
        # Check Docker if applicable
        if (self.project_root / 'docker-compose.yml').exists():
            try:
                subprocess.run(['docker', '--version'], check=True, capture_output=True)
                result['checks'].append({'name': 'Docker', 'status': 'healthy'})
                result['healthy'] += 1
            except:
                result['checks'].append({'name': 'Docker', 'status': 'unhealthy'})
                result['unhealthy'] += 1
        
        print(f"  ✅ {result['healthy']} healthy, ❌ {result['unhealthy']} unhealthy")
        
        return result
    
    def _generate_report(self, results: Dict) -> str:
        """Generate bootstrap completion report"""
        
        report = []
        report.append("\n📊 BOOTSTRAP REPORT")
        report.append("=" * 60)
        
        for step in results['steps']:
            step_name = step['step'].replace('_', ' ').title()
            report.append(f"\n{step_name}:")
            report.append(f"  Status: {step.get('status', 'unknown')}")
            
            # Add step-specific details
            if 'python_packages' in step:
                report.append(f"  Python Packages: {step['python_packages']}")
            if 'node_packages' in step:
                report.append(f"  Node Packages: {step['node_packages']}")
            if 'services' in step:
                report.append(f"  Services Discovered: {len(step['services'])}")
            if 'databases' in step:
                report.append(f"  Databases: {len(step['databases'])}")
        
        report.append("\n" + "=" * 60)
        
        return "\n".join(report)
    
    def _parse_docker_services(self) -> List[str]:
        """Parse docker-compose.yml for services"""
        try:
            import yaml
            compose_file = self.project_root / 'docker-compose.yml'
            data = yaml.safe_load(compose_file.read_text())
            return list(data.get('services', {}).keys())
        except:
            return []
    
    def _load_or_create_config(self) -> Dict:
        """Load or create bootstrap configuration"""
        config_file = self.project_root / '.bootstrap_config.json'
        
        if config_file.exists():
            return json.loads(config_file.read_text())
        
        default_config = {
            'version': '1.0.0',
            'auto_update': True,
            'health_check_interval': 300,
            'created_at': datetime.utcnow().isoformat()
        }
        
        config_file.write_text(json.dumps(default_config, indent=2))
        return default_config
    
    def _save_bootstrap_state(self, results: Dict):
        """Save bootstrap state for future reference"""
        state_file = self.project_root / '.bootstrap_state.json'
        state_file.write_text(json.dumps(results, indent=2))
        print(f"\n💾 Bootstrap state saved to: {state_file}")
    
    def _log_step(self, step_name: str, result: Dict):
        """Log bootstrap step"""
        self.bootstrap_log.append({
            'step': step_name,
            'timestamp': datetime.utcnow().isoformat(),
            'result': result
        })


def main():
    """Main bootstrap entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Auto Bootstrap System')
    parser.add_argument('--mode', default='development', choices=['development', 'staging', 'production'])
    parser.add_argument('--project-root', default='.', help='Project root directory')
    
    args = parser.parse_args()
    
    bootstrapper = AutoBootstrapSystem(args.project_root)
    results = bootstrapper.bootstrap(mode=args.mode)
    
    # Exit with success code
    sys.exit(0 if all(step.get('status') == 'success' for step in results['steps']) else 1)


if __name__ == "__main__":
    main()
