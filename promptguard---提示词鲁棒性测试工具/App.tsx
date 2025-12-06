import React, { useState, useCallback } from 'react';
import { ShieldCheck, Activity, Zap, GitCompare, BrainCircuit, Layout } from 'lucide-react';
import PromptInput from './components/PromptInput';
import ReportSection from './components/ReportSection';
import { 
  AppStatus, 
  RobustnessReport, 
  ProgressState, 
  TestRun 
} from './types';
import * as geminiService from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [progress, setProgress] = useState<ProgressState>({ current: 0, total: 0, message: '' });
  const [report, setReport] = useState<RobustnessReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startTest = useCallback(async (prompt: string, count: number, temperature: number) => {
    setStatus(AppStatus.GENERATING_VARIATIONS);
    setError(null);
    setReport(null);
    setProgress({ current: 0, total: count + 1, message: '正在生成提示词变体...' });

    try {
      // 1. Generate Variations
      const variations = await geminiService.generatePromptVariations(prompt, count);
      
      // Initialize Report Structure
      const initialRuns: TestRun[] = variations.map(v => ({
        id: v.id,
        variation: v,
        output: '',
        status: 'pending'
      }));

      const newReport: RobustnessReport = {
        originalPrompt: prompt,
        originalOutput: '',
        runs: initialRuns,
        averageScore: 0,
        isComplete: false
      };
      setReport(newReport);

      // 2. Run Baseline
      setStatus(AppStatus.RUNNING_BASELINE);
      setProgress(prev => ({ ...prev, message: '正在执行原始提示词...' }));
      
      const baselineOutput = await geminiService.executePrompt(prompt, temperature);
      
      newReport.originalOutput = baselineOutput;
      setReport({ ...newReport }); // Update UI

      // 3. Run Variations & Evaluate (Sequentially to be safe with rate limits/ordering)
      setStatus(AppStatus.RUNNING_TESTS);
      
      for (let i = 0; i < initialRuns.length; i++) {
        const run = initialRuns[i];
        
        // Update Run Status to Running
        newReport.runs[i].status = 'running';
        setReport({ ...newReport });
        setProgress(prev => ({ 
           ...prev, 
           current: i + 1, 
           message: `正在测试变体 ${i + 1} / ${count}...` 
        }));

        try {
          // A. Execute Variation
          const output = await geminiService.executePrompt(run.variation.text, temperature);
          newReport.runs[i].output = output;
          
          // B. Evaluate Consistency
          const evalResult = await geminiService.evaluateConsistency(baselineOutput, output, prompt);
          newReport.runs[i].evaluation = evalResult;
          newReport.runs[i].status = 'completed';
        } catch (err) {
          console.error(`Error in run ${i}`, err);
          newReport.runs[i].status = 'failed';
          newReport.runs[i].error = '执行或评估失败';
        }

        // Update Average Score on the fly
        const completed = newReport.runs.filter(r => r.status === 'completed' && r.evaluation);
        if (completed.length > 0) {
          const totalScore = completed.reduce((sum, r) => sum + (r.evaluation?.score || 0), 0);
          newReport.averageScore = totalScore / completed.length;
        }

        setReport({ ...newReport });
      }

      newReport.isComplete = true;
      setReport({ ...newReport });
      setStatus(AppStatus.COMPLETED);
      setProgress(prev => ({ ...prev, message: '完成！' }));

    } catch (err: any) {
      console.error(err);
      setError(err.message || "发生了意外错误。");
      setStatus(AppStatus.ERROR);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 pb-20 selection:bg-indigo-500/30 relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[128px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[128px]"></div>
          <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/5 rounded-full blur-[96px]"></div>
      </div>

      {/* Header */}
      <header className="bg-slate-900/70 backdrop-blur-md border-b border-slate-800/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-none">PromptGuard</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-1">Prompt 鲁棒性评估</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {status !== AppStatus.IDLE && status !== AppStatus.COMPLETED && status !== AppStatus.ERROR && (
               <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700/50 shadow-sm animate-in fade-in slide-in-from-top-4">
                 <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
                 <span className="text-xs font-medium text-slate-300 tabular-nums tracking-wide">{progress.message}</span>
                 <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-indigo-500 transition-all duration-500 ease-out"
                        style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }}
                    />
                 </div>
               </div>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="max-w-4xl mx-auto">
           <PromptInput onStartTest={startTest} status={status} />
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 flex items-center gap-3 animate-in shake">
            <ShieldCheck className="w-5 h-5 text-red-400" />
            {error}
          </div>
        )}

        {report ? (
           <ReportSection report={report} />
        ) : (
          /* Empty State / Hero */
          <div className="max-w-5xl mx-auto mt-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800/60 transition-colors group">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <GitCompare className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">语义变异生成</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        基于原始提示词，自动生成多个语义相同但表述不同的变体，模拟不同用户的提问方式。
                    </p>
                </div>
                <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800/60 transition-colors group">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Zap className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">高并发执行</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        并行运行多个提示词变体，快速获取模型响应，支持 Temperature 调节以测试确定性。
                    </p>
                </div>
                <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800/60 transition-colors group">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <BrainCircuit className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">AI 智能裁判</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        采用 LLM-as-a-Judge 模式，自动评估各变体输出与基准输出的一致性，量化 Prompt 鲁棒性。
                    </p>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full py-6 text-center text-slate-600 text-xs border-t border-slate-800/50 bg-slate-900/80 backdrop-blur z-0 pointer-events-none">
         <div className="pointer-events-auto">
            Powered by Google Gemini 2.5 Flash &bull; PromptGuard v1.0
         </div>
      </footer>
    </div>
  );
};

export default App;