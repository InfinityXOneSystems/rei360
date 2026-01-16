"""
Document Evolution System
Tracks every document change, learns patterns, auto-suggests improvements
Complete audit trail with AI-powered analysis
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
import difflib
import json
from pathlib import Path
import google.generativeai as genai
from google.cloud import firestore


@dataclass
class EvolutionRecord:
    """Single document evolution event"""
    doc_id: str
    version: int
    timestamp: datetime
    author: str
    reason: str
    diff: str
    old_hash: str
    new_hash: str
    impact_score: float
    quality_delta: float
    change_type: str  # 'create', 'update', 'delete', 'merge'
    lines_added: int
    lines_removed: int
    files_affected: List[str]


class DocumentEvolutionSystem:
    """
    Comprehensive document lifecycle tracking and learning system
    Learns from every change to improve future documents
    """
    
    def __init__(self, project_id: str, gemini_api_key: str):
        self.firestore_db = firestore.Client(project=project_id)
        genai.configure(api_key=gemini_api_key)
        self.gemini_model = genai.GenerativeModel('gemini-pro')
        
        self.evolution_log = []
        self.pattern_detector = PatternDetector(self.gemini_model)
        self.quality_analyzer = QualityAnalyzer(self.gemini_model)
    
    async def track_change(
        self,
        doc_id: str,
        old_content: str,
        new_content: str,
        author: str,
        reason: str,
        change_type: str = 'update'
    ) -> EvolutionRecord:
        """Track and analyze document change"""
        
        # Calculate diff
        diff = list(difflib.unified_diff(
            old_content.splitlines(keepends=True),
            new_content.splitlines(keepends=True),
            lineterm=''
        ))
        
        # Count changes
        lines_added = sum(1 for line in diff if line.startswith('+'))
        lines_removed = sum(1 for line in diff if line.startswith('-'))
        
        # Get version
        version = await self._get_next_version(doc_id)
        
        # Calculate impact and quality
        impact_score = await self._calculate_impact(doc_id, new_content, diff)
        quality_delta = await self.quality_analyzer.measure_quality_change(
            old_content, new_content
        )
        
        # Create evolution record
        record = EvolutionRecord(
            doc_id=doc_id,
            version=version,
            timestamp=datetime.utcnow(),
            author=author,
            reason=reason,
            diff=''.join(diff),
            old_hash=self._hash_content(old_content),
            new_hash=self._hash_content(new_content),
            impact_score=impact_score,
            quality_delta=quality_delta,
            change_type=change_type,
            lines_added=lines_added,
            lines_removed=lines_removed,
            files_affected=[doc_id]
        )
        
        # Store in Firestore
        await self._store_evolution(record)
        
        # Add to memory
        self.evolution_log.append(record)
        
        # Trigger pattern analysis
        await self.pattern_detector.analyze_pattern(record)
        
        # Generate insights
        await self._generate_insights(record)
        
        return record
    
    async def _calculate_impact(self, doc_id: str, new_content: str, diff: List[str]) -> float:
        """Calculate impact score of the change"""
        
        # Factors: size of change, importance of doc, downstream dependencies
        change_size = len(diff) / max(len(new_content.splitlines()), 1)
        
        # Check if doc is referenced by others
        references = await self._count_references(doc_id)
        reference_impact = min(references / 10, 1.0)
        
        # Combine factors
        impact = (change_size * 0.5) + (reference_impact * 0.5)
        
        return min(impact, 1.0)
    
    async def _count_references(self, doc_id: str) -> int:
        """Count how many other docs reference this one"""
        refs = self.firestore_db.collection('document_references').where(
            'referenced_doc', '==', doc_id
        ).stream()
        return len(list(refs))
    
    def _hash_content(self, content: str) -> str:
        """Generate hash of content"""
        import hashlib
        return hashlib.sha256(content.encode()).hexdigest()
    
    async def _get_next_version(self, doc_id: str) -> int:
        """Get next version number"""
        query = self.firestore_db.collection('document_evolution').where(
            'doc_id', '==', doc_id
        ).order_by('version', direction=firestore.Query.DESCENDING).limit(1)
        
        docs = list(query.stream())
        if docs:
            return docs[0].get('version') + 1
        return 1
    
    async def _store_evolution(self, record: EvolutionRecord):
        """Store evolution record in Firestore"""
        doc_ref = self.firestore_db.collection('document_evolution').document()
        doc_ref.set(asdict(record))
    
    async def _generate_insights(self, record: EvolutionRecord):
        """Generate AI insights about the change"""
        
        prompt = f"""
        Analyze this document change and provide insights:
        
        Document: {record.doc_id}
        Change Type: {record.change_type}
        Lines Added: {record.lines_added}
        Lines Removed: {record.lines_removed}
        Reason: {record.reason}
        Quality Delta: {record.quality_delta}
        
        Diff:
        {record.diff[:1000]}
        
        Provide:
        1. What improved?
        2. What risks were introduced?
        3. What could be better?
        4. Patterns observed
        """
        
        response = self.gemini_model.generate_content(prompt)
        
        # Store insights
        self.firestore_db.collection('document_insights').document().set({
            'doc_id': record.doc_id,
            'version': record.version,
            'timestamp': datetime.utcnow(),
            'insights': response.text
        })
    
    async def get_document_history(self, doc_id: str, limit: int = 50) -> List[EvolutionRecord]:
        """Get full evolution history of a document"""
        
        query = self.firestore_db.collection('document_evolution').where(
            'doc_id', '==', doc_id
        ).order_by('version', direction=firestore.Query.DESCENDING).limit(limit)
        
        records = []
        for doc in query.stream():
            data = doc.to_dict()
            records.append(EvolutionRecord(**data))
        
        return records
    
    async def get_evolution_report(self, period_days: int = 30) -> Dict:
        """Generate evolution report for period"""
        
        start_date = datetime.utcnow() - timedelta(days=period_days)
        
        query = self.firestore_db.collection('document_evolution').where(
            'timestamp', '>=', start_date
        ).stream()
        
        evolutions = [EvolutionRecord(**doc.to_dict()) for doc in query]
        
        return {
            'period_days': period_days,
            'total_changes': len(evolutions),
            'documents_changed': len(set(e.doc_id for e in evolutions)),
            'total_lines_added': sum(e.lines_added for e in evolutions),
            'total_lines_removed': sum(e.lines_removed for e in evolutions),
            'avg_quality_delta': sum(e.quality_delta for e in evolutions) / len(evolutions) if evolutions else 0,
            'top_contributors': self._get_top_contributors(evolutions),
            'most_evolved_docs': self._get_most_evolved(evolutions),
            'quality_trend': await self._calculate_quality_trend(evolutions)
        }
    
    def _get_top_contributors(self, evolutions: List[EvolutionRecord]) -> List[Dict]:
        """Get top contributors"""
        from collections import Counter
        authors = Counter(e.author for e in evolutions)
        return [{'author': author, 'changes': count} for author, count in authors.most_common(10)]
    
    def _get_most_evolved(self, evolutions: List[EvolutionRecord]) -> List[Dict]:
        """Get most frequently changed documents"""
        from collections import Counter
        docs = Counter(e.doc_id for e in evolutions)
        return [{'doc_id': doc, 'changes': count} for doc, count in docs.most_common(10)]
    
    async def _calculate_quality_trend(self, evolutions: List[EvolutionRecord]) -> List[Dict]:
        """Calculate quality trend over time"""
        
        sorted_evolutions = sorted(evolutions, key=lambda e: e.timestamp)
        
        trend = []
        for i, evolution in enumerate(sorted_evolutions):
            trend.append({
                'timestamp': evolution.timestamp.isoformat(),
                'quality_delta': evolution.quality_delta,
                'cumulative_quality': sum(e.quality_delta for e in sorted_evolutions[:i+1])
            })
        
        return trend


class PatternDetector:
    """Detects patterns in document evolution"""
    
    def __init__(self, gemini_model):
        self.gemini_model = gemini_model
        self.patterns = []
    
    async def analyze_pattern(self, record: EvolutionRecord):
        """Analyze single evolution for patterns"""
        
        # Common patterns:
        # - Frequent small fixes (quality issue)
        # - Large rewrites (understanding issue)
        # - Rapid iterations (experimental)
        # - Consistent improvements (learning)
        
        pattern = {
            'type': self._classify_change(record),
            'record': record,
            'timestamp': datetime.utcnow()
        }
        
        self.patterns.append(pattern)
    
    def _classify_change(self, record: EvolutionRecord) -> str:
        """Classify type of change"""
        
        if record.lines_added < 5 and record.lines_removed < 5:
            return 'minor_fix'
        elif record.lines_added > 100 or record.lines_removed > 100:
            return 'major_refactor'
        elif record.quality_delta > 0.3:
            return 'quality_improvement'
        elif record.quality_delta < -0.3:
            return 'quality_degradation'
        else:
            return 'regular_update'


class QualityAnalyzer:
    """Analyzes document quality"""
    
    def __init__(self, gemini_model):
        self.gemini_model = gemini_model
    
    async def measure_quality_change(self, old_content: str, new_content: str) -> float:
        """Measure quality delta between versions"""
        
        old_quality = await self._assess_quality(old_content)
        new_quality = await self._assess_quality(new_content)
        
        return new_quality - old_quality
    
    async def _assess_quality(self, content: str) -> float:
        """Assess quality of content (0-1 scale)"""
        
        prompt = f"""
        Assess the quality of this document on a scale of 0-1:
        
        {content[:2000]}
        
        Consider:
        - Clarity and readability
        - Completeness
        - Accuracy
        - Structure
        - Actionability
        
        Return only a number between 0 and 1.
        """
        
        try:
            response = self.gemini_model.generate_content(prompt)
            quality = float(response.text.strip())
            return max(0.0, min(1.0, quality))
        except:
            return 0.5  # Default neutral quality


if __name__ == "__main__":
    import asyncio
    
    async def main():
        system = DocumentEvolutionSystem(
            project_id="real-estate-intelligence",
            gemini_api_key="YOUR_API_KEY"
        )
        
        # Track a change
        record = await system.track_change(
            doc_id="README.md",
            old_content="# Project\nOld description",
            new_content="# Project\nNew improved description with more detail",
            author="system",
            reason="Improve documentation"
        )
        
        print(f"Tracked change v{record.version}: {record.doc_id}")
        print(f"Impact: {record.impact_score:.2f}, Quality Δ: {record.quality_delta:.2f}")
    
    asyncio.run(main())
