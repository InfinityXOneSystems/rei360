/**
 * INFINITY X AI - ADMIN IDE (Live Editor)
 * Exact implementation from infinity-matrix/frontend
 * Visual effects removed per user request
 */

import React, { useState } from 'react';
import { 
  Code2, Play, Save, RefreshCw, Terminal, 
  FileCode, FolderTree, Settings, GitBranch,
  Check, X, AlertTriangle, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
}

const MOCK_FILES: FileNode[] = [
  {
    name: 'src',
    type: 'folder',
    children: [
      { name: 'App.tsx', type: 'file', content: '// Main App Component\nimport React from "react";\n\nexport default function App() {\n  return <div>Hello World</div>;\n}' },
      { name: 'index.tsx', type: 'file', content: '// Entry point\nimport { createRoot } from "react-dom/client";\nimport App from "./App";\n\ncreateRoot(document.getElementById("root")!).render(<App />);' },
      {
        name: 'components',
        type: 'folder',
        children: [
          { name: 'Button.tsx', type: 'file', content: '// Button Component\nexport const Button = ({ children }) => <button>{children}</button>;' },
          { name: 'Card.tsx', type: 'file', content: '// Card Component\nexport const Card = ({ children }) => <div className="card">{children}</div>;' },
        ]
      }
    ]
  },
  {
    name: 'package.json',
    type: 'file',
    content: '{\n  "name": "infinity-x-ai",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^19.0.0"\n  }\n}'
  }
];

const FileTree: React.FC<{
  nodes: FileNode[];
  selectedFile: string | null;
  onSelectFile: (name: string, content: string) => void;
  depth?: number;
}> = ({ nodes, selectedFile, onSelectFile, depth = 0 }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ src: true, components: true });

  return (
    <div className="space-y-0.5">
      {nodes.map((node) => (
        <div key={node.name}>
          <button
            onClick={() => {
              if (node.type === 'folder') {
                setExpanded(prev => ({ ...prev, [node.name]: !prev[node.name] }));
              } else if (node.content) {
                onSelectFile(node.name, node.content);
              }
            }}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
              selectedFile === node.name 
                ? "bg-[#39FF14]/20 text-[#39FF14]" 
                : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            {node.type === 'folder' ? (
              <FolderTree size={14} className="text-yellow-500" />
            ) : (
              <FileCode size={14} className="text-blue-400" />
            )}
            <span>{node.name}</span>
          </button>
          {node.type === 'folder' && expanded[node.name] && node.children && (
            <FileTree 
              nodes={node.children} 
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              depth={depth + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const AdminIDE: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>('App.tsx');
  const [code, setCode] = useState('// Main App Component\nimport React from "react";\n\nexport default function App() {\n  return <div>Hello World</div>;\n}');
  const [output, setOutput] = useState<string[]>([
    '[INFO] IDE initialized',
    '[INFO] Connected to development server',
    '[SUCCESS] All systems operational'
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const handleSelectFile = (name: string, content: string) => {
    setSelectedFile(name);
    setCode(content);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(prev => [...prev, '[INFO] Compiling...']);
    await new Promise(r => setTimeout(r, 1000));
    setOutput(prev => [...prev, '[SUCCESS] Build completed in 234ms']);
    setOutput(prev => [...prev, '[INFO] Hot reload triggered']);
    setIsRunning(false);
    toast.success('Code executed successfully');
  };

  const handleSave = () => {
    toast.success(`${selectedFile} saved successfully`);
    setOutput(prev => [...prev, `[INFO] Saved ${selectedFile}`]);
  };

  return (
    <div className="h-full flex flex-col bg-transparent text-white overflow-hidden rounded-tl-2xl border-l-2 border-t-2 border-white/20">
      
      {/* Header */}
      <div className="h-16 border-b-2 border-white/20 flex items-center px-6 justify-between bg-black/40 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center border-2 border-purple-500">
            <Code2 className="text-purple-400" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-wide text-white">
              Live<span className="text-purple-400">Editor</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleSave}
            className="border-white/20"
          >
            <Save size={14} className="mr-2" /> Save
          </Button>
          <Button 
            size="sm"
            onClick={handleRun}
            disabled={isRunning}
            className="bg-[#39FF14] text-black hover:bg-[#32e612]"
          >
            {isRunning ? <RefreshCw size={14} className="mr-2 animate-spin" /> : <Play size={14} className="mr-2" />}
            Run
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* File Explorer */}
        <div className="w-64 border-r border-white/10 bg-black/20 overflow-y-auto p-2">
          <div className="text-xs font-bold text-white/40 uppercase tracking-wider px-2 py-2 mb-2">
            Explorer
          </div>
          <FileTree 
            nodes={MOCK_FILES}
            selectedFile={selectedFile}
            onSelectFile={handleSelectFile}
          />
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="h-10 border-b border-white/10 flex items-center px-2 bg-black/20">
            {selectedFile && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-t border-t border-l border-r border-white/10 text-sm">
                <FileCode size={12} className="text-blue-400" />
                <span className="text-white">{selectedFile}</span>
                <button className="ml-2 text-white/40 hover:text-white">
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Code Area */}
          <div className="flex-1 overflow-hidden">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-[#0d0d0d] text-white/90 font-mono text-sm p-4 resize-none outline-none"
              spellCheck={false}
            />
          </div>

          {/* Terminal */}
          <div className="h-48 border-t border-white/10 bg-black/40">
            <div className="h-8 border-b border-white/10 flex items-center px-4 gap-2">
              <Terminal size={14} className="text-white/40" />
              <span className="text-xs font-bold text-white/40 uppercase">Output</span>
            </div>
            <div className="h-[calc(100%-2rem)] overflow-y-auto p-4 font-mono text-xs space-y-1">
              {output.map((line, i) => (
                <div 
                  key={i}
                  className={cn(
                    line.includes('[SUCCESS]') ? 'text-green-400' :
                    line.includes('[ERROR]') ? 'text-red-400' :
                    line.includes('[WARNING]') ? 'text-yellow-400' :
                    'text-white/60'
                  )}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminIDE;
