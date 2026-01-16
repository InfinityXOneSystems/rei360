"""
Intelligent To-Do System
AI-powered task management with auto-prioritization, 
dependency resolution, and proactive execution
"""

from typing import List, Dict, Optional
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass, asdict
import json
import google.generativeai as genai
from google.cloud import firestore


class TaskStatus(Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskPriority(Enum):
    CRITICAL = 1
    HIGH = 2
    MEDIUM = 3
    LOW = 4
    BACKLOG = 5


@dataclass
class Task:
    id: str
    title: str
    description: str
    status: TaskStatus
    priority: TaskPriority
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]
    dependencies: List[str]
    auto_executable: bool
    estimated_duration: int  # minutes
    actual_duration: Optional[int]
    deadline: Optional[datetime]
    tags: List[str]
    assigned_to: str
    confidence_score: float
    risk_level: float
    expected_value: float  # ROI or impact


class IntelligentTodoSystem:
    """
    Self-organizing task management system
    Learns from execution patterns and optimizes workflow
    """
    
    def __init__(self, project_id: str, gemini_api_key: str):
        self.firestore_db = firestore.Client(project=project_id)
        genai.configure(api_key=gemini_api_key)
        self.gemini_model = genai.GenerativeModel('gemini-pro')
        
        self.tasks_collection = 'intelligent_tasks'
        self.suggestions_collection = 'task_suggestions'
    
    async def create_task(
        self,
        title: str,
        description: str,
        assigned_to: str = "system",
        auto_analyze: bool = True
    ) -> Task:
        """Create task with AI analysis"""
        
        task_id = self._generate_task_id()
        
        task = Task(
            id=task_id,
            title=title,
            description=description,
            status=TaskStatus.NOT_STARTED,
            priority=TaskPriority.MEDIUM,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            completed_at=None,
            dependencies=[],
            auto_executable=False,
            estimated_duration=30,
            actual_duration=None,
            deadline=None,
            tags=[],
            assigned_to=assigned_to,
            confidence_score=0.5,
            risk_level=0.5,
            expected_value=0.5
        )
        
        if auto_analyze:
            analysis = await self._analyze_task_with_ai(task)
            task = self._apply_analysis(task, analysis)
        
        # Store in Firestore
        await self._store_task(task)
        
        # Check if can auto-execute
        if task.auto_executable and task.confidence_score > 0.85:
            await self._attempt_auto_execution(task)
        
        return task
    
    async def _analyze_task_with_ai(self, task: Task) -> Dict:
        """Comprehensive AI task analysis"""
        
        prompt = f"""
        Analyze this task and provide detailed intelligence:
        
        Title: {task.title}
        Description: {task.description}
        
        Provide JSON with:
        1. priority: CRITICAL|HIGH|MEDIUM|LOW|BACKLOG
        2. estimated_duration: minutes (realistic estimate)
        3. auto_executable: true if system can do it autonomously
        4. dependencies: list of task types needed first
        5. deadline_days: how many days until this should be done
        6. tags: relevant categorization tags
        7. confidence_score: 0-1 confidence in auto-execution
        8. risk_level: 0-1 risk if not completed
        9. expected_value: 0-1 estimated ROI/impact
        10. breakdown: list of sub-steps if complex
        
        Return valid JSON only.
        """
        
        response = self.gemini_model.generate_content(prompt)
        
        try:
            analysis = json.loads(response.text)
            return analysis
        except json.JSONDecodeError:
            # Fallback to defaults
            return {
                'priority': 'MEDIUM',
                'estimated_duration': 30,
                'auto_executable': False,
                'dependencies': [],
                'deadline_days': 7,
                'tags': [],
                'confidence_score': 0.5,
                'risk_level': 0.5,
                'expected_value': 0.5,
                'breakdown': []
            }
    
    def _apply_analysis(self, task: Task, analysis: Dict) -> Task:
        """Apply AI analysis to task"""
        
        task.priority = TaskPriority[analysis.get('priority', 'MEDIUM')]
        task.estimated_duration = analysis.get('estimated_duration', 30)
        task.auto_executable = analysis.get('auto_executable', False)
        task.dependencies = analysis.get('dependencies', [])
        task.tags = analysis.get('tags', [])
        task.confidence_score = analysis.get('confidence_score', 0.5)
        task.risk_level = analysis.get('risk_level', 0.5)
        task.expected_value = analysis.get('expected_value', 0.5)
        
        # Calculate deadline
        deadline_days = analysis.get('deadline_days', 7)
        task.deadline = datetime.utcnow() + timedelta(days=deadline_days)
        
        return task
    
    async def get_next_best_actions(self, limit: int = 5) -> List[Task]:
        """AI-curated list of next best actions"""
        
        # Get all available tasks
        query = self.firestore_db.collection(self.tasks_collection).where(
            'status', '==', TaskStatus.NOT_STARTED.value
        ).stream()
        
        tasks = [Task(**doc.to_dict()) for doc in query]
        
        # Filter by dependencies met
        available_tasks = [t for t in tasks if await self._dependencies_met(t)]
        
        # Rank by impact score
        ranked_tasks = sorted(
            available_tasks,
            key=lambda t: (
                t.priority.value,  # Lower number = higher priority
                -t.expected_value,  # Higher value first
                -t.risk_level  # Higher risk first
            )
        )
        
        return ranked_tasks[:limit]
    
    async def _dependencies_met(self, task: Task) -> bool:
        """Check if all dependencies are completed"""
        
        if not task.dependencies:
            return True
        
        for dep_id in task.dependencies:
            dep_doc = self.firestore_db.collection(self.tasks_collection).document(dep_id).get()
            if not dep_doc.exists:
                continue
            
            dep_task = Task(**dep_doc.to_dict())
            if dep_task.status != TaskStatus.COMPLETED:
                return False
        
        return True
    
    async def _attempt_auto_execution(self, task: Task):
        """Attempt to execute task autonomously"""
        
        print(f"🤖 Auto-executing task: {task.title}")
        
        # Update status
        task.status = TaskStatus.IN_PROGRESS
        task.updated_at = datetime.utcnow()
        await self._store_task(task)
        
        # Execute based on tags
        try:
            if 'data_collection' in task.tags:
                await self._execute_data_collection(task)
            elif 'analysis' in task.tags:
                await self._execute_analysis(task)
            elif 'report' in task.tags:
                await self._execute_report(task)
            else:
                # Generic execution
                await self._execute_generic(task)
            
            # Mark complete
            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.utcnow()
            task.actual_duration = int((task.completed_at - task.created_at).total_seconds() / 60)
            
        except Exception as e:
            print(f"❌ Auto-execution failed: {e}")
            task.status = TaskStatus.BLOCKED
        
        task.updated_at = datetime.utcnow()
        await self._store_task(task)
    
    async def _execute_generic(self, task: Task):
        """Generic task execution using AI"""
        
        prompt = f"""
        Execute this task:
        
        Title: {task.title}
        Description: {task.description}
        
        Provide execution steps and results.
        """
        
        response = self.gemini_model.generate_content(prompt)
        
        # Store execution log
        self.firestore_db.collection('task_executions').document().set({
            'task_id': task.id,
            'timestamp': datetime.utcnow(),
            'result': response.text
        })
    
    async def auto_suggest_tasks(self) -> List[Dict]:
        """Proactive task suggestions"""
        
        # Analyze system state
        gaps = await self._identify_gaps()
        opportunities = await self._identify_opportunities()
        risks = await self._identify_risks()
        
        suggestions = []
        
        # Generate suggestions
        for gap in gaps:
            suggestions.append({
                'type': 'gap',
                'title': f"Fill gap: {gap['name']}",
                'description': gap['description'],
                'expected_value': gap['impact']
            })
        
        for opp in opportunities:
            suggestions.append({
                'type': 'opportunity',
                'title': f"Capture: {opp['name']}",
                'description': opp['description'],
                'expected_value': opp['potential']
            })
        
        for risk in risks:
            suggestions.append({
                'type': 'risk',
                'title': f"Mitigate: {risk['name']}",
                'description': risk['description'],
                'expected_value': risk['severity']
            })
        
        # Store suggestions
        for suggestion in suggestions:
            self.firestore_db.collection(self.suggestions_collection).document().set({
                **suggestion,
                'created_at': datetime.utcnow(),
                'status': 'pending'
            })
        
        return suggestions
    
    async def _identify_gaps(self) -> List[Dict]:
        """Identify system gaps"""
        # Placeholder - would analyze system state
        return []
    
    async def _identify_opportunities(self) -> List[Dict]:
        """Identify opportunities"""
        # Placeholder - would analyze market data
        return []
    
    async def _identify_risks(self) -> List[Dict]:
        """Identify risks"""
        # Placeholder - would analyze risk indicators
        return []
    
    async def generate_daily_plan(self) -> Dict:
        """Generate optimal daily work plan"""
        
        next_actions = await self.get_next_best_actions(limit=20)
        
        total_duration = sum(t.estimated_duration for t in next_actions)
        
        return {
            'date': datetime.utcnow().date().isoformat(),
            'total_tasks': len(next_actions),
            'estimated_duration': total_duration,
            'tasks': [asdict(t) for t in next_actions],
            'focus_areas': self._extract_focus_areas(next_actions)
        }
    
    def _extract_focus_areas(self, tasks: List[Task]) -> List[str]:
        """Extract main focus areas from tasks"""
        all_tags = []
        for task in tasks:
            all_tags.extend(task.tags)
        
        from collections import Counter
        return [tag for tag, count in Counter(all_tags).most_common(5)]
    
    def _generate_task_id(self) -> str:
        """Generate unique task ID"""
        import uuid
        return f"task_{uuid.uuid4().hex[:12]}"
    
    async def _store_task(self, task: Task):
        """Store task in Firestore"""
        doc_ref = self.firestore_db.collection(self.tasks_collection).document(task.id)
        
        task_dict = asdict(task)
        task_dict['status'] = task.status.value
        task_dict['priority'] = task.priority.value
        
        doc_ref.set(task_dict)
    
    def get_dashboard(self) -> Dict:
        """Task analytics dashboard"""
        
        # Count tasks by status
        all_tasks = list(self.firestore_db.collection(self.tasks_collection).stream())
        tasks = [Task(**doc.to_dict()) for doc in all_tasks]
        
        from collections import Counter
        status_counts = Counter(t.status for t in tasks)
        priority_counts = Counter(t.priority for t in tasks)
        
        completed_tasks = [t for t in tasks if t.status == TaskStatus.COMPLETED and t.actual_duration]
        avg_completion = sum(t.actual_duration for t in completed_tasks) / len(completed_tasks) if completed_tasks else 0
        
        return {
            'total_tasks': len(tasks),
            'by_status': {status.value: count for status, count in status_counts.items()},
            'by_priority': {priority.value: count for priority, count in priority_counts.items()},
            'avg_completion_time_minutes': avg_completion,
            'completion_rate': len([t for t in tasks if t.status == TaskStatus.COMPLETED]) / len(tasks) if tasks else 0
        }


if __name__ == "__main__":
    import asyncio
    
    async def main():
        system = IntelligentTodoSystem(
            project_id="real-estate-intelligence",
            gemini_api_key="YOUR_API_KEY"
        )
        
        # Create a task
        task = await system.create_task(
            title="Analyze market trends for Q1 2026",
            description="Collect and analyze real estate market data for first quarter",
            assigned_to="vision_cortex"
        )
        
        print(f"Created task: {task.title}")
        print(f"Priority: {task.priority.name}, Auto-executable: {task.auto_executable}")
        
        # Get next actions
        actions = await system.get_next_best_actions()
        print(f"\n📋 Next {len(actions)} best actions:")
        for i, action in enumerate(actions, 1):
            print(f"  {i}. [{action.priority.name}] {action.title}")
    
    asyncio.run(main())
