import React, { useState } from 'react';
import { Play, Sparkles, AlertCircle, Settings2, Zap } from 'lucide-react';
import { AppStatus } from '../types';

interface PromptInputProps {
  onStartTest: (prompt: string, variationCount: number, temperature: number) => void;
  status: AppStatus;
}

const PromptInput: React.FC<PromptInputProps> = ({ onStartTest, status }) => {
  const [prompt, setPrompt] = useState('');
  const [variationCount, setVariationCount] = useState(3);
  const [temperature, setTemperature] = useState(0.5);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isLocked = status !== AppStatus.IDLE && status !== AppStatus.COMPLETED && status !== AppStatus.ERROR;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLocked) {
      onStartTest(prompt, variationCount, temperature);
    }
  };

  return (
    <div className="relative group">
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-30 group-hover:opacity-60 blur transition duration-500"></div>
      
      <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Sparkles className="text-indigo-400 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">测试配置</h2>
            <p className="text-slate-400 text-xs">配置您的 Prompt 及鲁棒性测试参数</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex justify-between">
              <span>待测试的提示词 (Prompt)</span>
              <span className="text-xs text-slate-500">{prompt.length} 字符</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLocked}
              placeholder="例如：请用种地的比喻，向一个5岁的孩子解释量子纠缠..."
              className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none resize-none transition-all disabled:opacity-50 text-sm leading-relaxed font-mono"
              required
            />
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowAdvanced(!showAdvanced)}>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Settings2 className="w-4 h-4 text-slate-400" />
                高级设置
              </div>
              <button type="button" className={`text-xs text-indigo-400 font-medium hover:text-indigo-300 transition-colors`}>
                {showAdvanced ? '收起' : '展开'}
              </button>
            </div>

            {showAdvanced && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    变体数量 ({variationCount})
                  </label>
                  <input 
                    type="range" 
                    min="2" 
                    max="5" 
                    step="1"
                    value={variationCount}
                    onChange={(e) => setVariationCount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>2</span>
                    <span>5</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    温度 / Temperature ({temperature})
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>精准 (0.0)</span>
                    <span>创意 (1.0)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
             <div className="flex items-start gap-2 text-xs text-slate-500 max-w-[60%]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-slate-600" />
              <p>
                我们将生成 {variationCount} 个语义变体，并在 Temperature {temperature} 下运行测试，最后由 AI 裁判评分。
              </p>
            </div>

            <button
              type="submit"
              disabled={isLocked || !prompt.trim()}
              className={`relative overflow-hidden group flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all w-auto min-w-[160px]
                ${isLocked || !prompt.trim() 
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-95'}
              `}
            >
              {isLocked ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  处理中...
                </span>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                  开始测试
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromptInput;