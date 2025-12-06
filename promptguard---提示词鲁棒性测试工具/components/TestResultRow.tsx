import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, XCircle, FileText, Copy, Check } from 'lucide-react';
import { TestRun } from '../types';
import ReactMarkdown from 'react-markdown';

interface TestResultRowProps {
  run: TestRun;
  index: number;
}

const TestResultRow: React.FC<TestResultRowProps> = ({ run, index }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(run.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const getScoreBadge = (score: number) => {
     if (score >= 90) return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.1)]';
     if (score >= 70) return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.1)]';
     return 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_10px_rgba(248,113,113,0.1)]';
  };

  return (
    <div 
        className={`border rounded-xl overflow-hidden transition-all duration-200 
        ${expanded ? 'bg-slate-800 border-indigo-500/30 ring-1 ring-indigo-500/20' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600'}
        `}
    >
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs font-mono
            ${expanded ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-700/50 text-slate-400'}
          `}>
            V{index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-200 font-medium truncate pr-4 font-mono opacity-90">
              {run.variation.text}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 pl-4 border-l border-slate-700/50 ml-2">
          {run.status === 'completed' && run.evaluation ? (
            <div className={`px-2.5 py-1 rounded-md border text-xs font-bold font-mono whitespace-nowrap ${getScoreBadge(run.evaluation.score)}`}>
              {run.evaluation.score}
            </div>
          ) : run.status === 'failed' ? (
             <XCircle className="w-5 h-5 text-red-500/80" />
          ) : (
            <div className="w-5 h-5 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin" />
          )}
          
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-700/50 bg-slate-900/30 p-5 animate-in fade-in slide-in-from-top-1">
          
          {/* Prompt Comparison */}
          <div className="mb-5">
             <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">变体提示词</h4>
             <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800 text-slate-300 text-sm font-mono leading-relaxed">
                {run.variation.text}
             </div>
          </div>

          {/* Analysis */}
          {run.evaluation && (
            <div className="mb-5">
               <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">AI 裁判分析</h4>
               <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-lg text-indigo-200/90 text-sm flex gap-3 leading-relaxed">
                  <div className="mt-0.5 shrink-0"><CheckCircle className="w-4 h-4 text-indigo-400" /></div>
                  <div>{run.evaluation.reasoning}</div>
               </div>
            </div>
          )}

          {/* Output */}
          <div className="relative group/output">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                    <FileText className="w-3 h-3" />
                    模型输出
                </h4>
                <button 
                    onClick={handleCopy}
                    className="text-xs flex items-center gap-1.5 text-slate-500 hover:text-indigo-400 transition-colors bg-slate-800/50 px-2 py-1 rounded border border-transparent hover:border-slate-700"
                >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? '已复制' : '复制'}
                </button>
            </div>
            
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 text-sm max-h-80 overflow-y-auto custom-scrollbar prose prose-invert prose-sm max-w-none prose-p:my-2 prose-headings:text-slate-200">
               <ReactMarkdown>{run.output || "*未生成输出*"}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResultRow;