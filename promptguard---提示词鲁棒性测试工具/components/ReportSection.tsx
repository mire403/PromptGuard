import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, ReferenceLine } from 'recharts';
import { RobustnessReport } from '../types';
import MetricCard from './MetricCard';
import TestResultRow from './TestResultRow';
import ReactMarkdown from 'react-markdown';
import { Activity, TrendingUp, TrendingDown, Target, ListChecks, FileJson } from 'lucide-react';

interface ReportSectionProps {
  report: RobustnessReport;
}

const ReportSection: React.FC<ReportSectionProps> = ({ report }) => {
  const completedRuns = report.runs.filter(r => r.status === 'completed' && r.evaluation);
  
  // Calculate stats
  const scores = completedRuns.map(r => r.evaluation?.score || 0);
  const minScore = scores.length ? Math.min(...scores) : 0;
  const maxScore = scores.length ? Math.max(...scores) : 0;
  
  // Prepare chart data
  const chartData = completedRuns.map((run, idx) => ({
    name: `V${idx + 1}`,
    score: run.evaluation?.score || 0,
  }));

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#34d399'; // Emerald 400
    if (score >= 70) return '#facc15'; // Yellow 400
    return '#f87171'; // Red 400
  };

  const scoreColorClass = 
    report.averageScore >= 90 ? 'text-emerald-400' : 
    report.averageScore >= 70 ? 'text-yellow-400' : 'text-red-400';

  // Gauge Chart Data
  const gaugeData = [
    { name: 'Score', value: report.averageScore },
    { name: 'Remaining', value: 100 - report.averageScore },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
            <div className="bg-slate-800/80 border border-slate-700/50 p-6 rounded-2xl shadow-lg h-full flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50"></div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">平均鲁棒性得分</h3>
                <div className="h-32 w-full relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={gaugeData}
                                cx="50%"
                                cy="70%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell key="score" fill={getScoreColor(report.averageScore)} />
                                <Cell key="remaining" fill="#1e293b" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className={`absolute bottom-2 text-4xl font-black ${scoreColorClass}`}>
                        {report.isComplete ? Math.round(report.averageScore) : '--'}
                    </div>
                </div>
                <p className="text-slate-500 text-xs mt-[-10px]">
                    {report.averageScore >= 90 ? '表现极佳' : report.averageScore >= 70 ? '表现良好' : '需要优化'}
                </p>
            </div>
        </div>

        <MetricCard 
          label="最低一致性" 
          value={completedRuns.length > 0 ? minScore : '-'} 
          colorClass="text-red-400"
          icon={TrendingDown}
          subtext="最差变体的得分"
        />
        <MetricCard 
          label="最高一致性" 
          value={completedRuns.length > 0 ? maxScore : '-'} 
          colorClass="text-emerald-400"
          icon={TrendingUp}
          subtext="最佳变体的得分"
        />
        <MetricCard 
          label="已测试变体" 
          value={`${completedRuns.length} / ${report.runs.length}`} 
          colorClass="text-indigo-400"
          icon={ListChecks}
          subtext="覆盖率 100%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Visualizations & Baseline */}
        <div className="lg:col-span-7 space-y-6">
           
           {/* Bar Chart */}
           <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 shadow-sm min-h-[300px]">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-slate-200 font-semibold text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    变体一致性分布
                </h3>
                <div className="flex gap-2 text-xs">
                    <span className="flex items-center gap-1 text-slate-400"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> &gt;90</span>
                    <span className="flex items-center gap-1 text-slate-400"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> 70-90</span>
                    <span className="flex items-center gap-1 text-slate-400"><div className="w-2 h-2 rounded-full bg-red-400"></div> &lt;70</span>
                </div>
             </div>
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                   <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                   <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                   <Tooltip 
                      cursor={{fill: '#334155', opacity: 0.2}}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ color: '#f1f5f9' }}
                   />
                   <ReferenceLine y={90} stroke="#34d399" strokeDasharray="3 3" opacity={0.5} />
                   <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={50}>
                     {chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>

           {/* Baseline Output */}
           <div className="bg-slate-900 border border-slate-700/70 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700/50 flex items-center gap-2">
                 <FileJson className="w-4 h-4 text-indigo-400" />
                 <h3 className="text-slate-200 font-semibold text-sm">基准模型输出 (Baseline)</h3>
                 <span className="ml-auto text-xs text-slate-500 font-mono bg-slate-800 px-2 py-0.5 rounded">Original</span>
              </div>
              <div className="p-6 bg-slate-950">
                <div className="text-slate-300 text-sm max-h-[400px] overflow-y-auto pr-2 prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
                    {report.originalOutput ? (
                    <ReactMarkdown>{report.originalOutput}</ReactMarkdown>
                    ) : (
                    <div className="flex items-center justify-center h-20 text-slate-600 italic">
                        正在生成基准...
                    </div>
                    )}
                </div>
              </div>
           </div>
        </div>

        {/* Right Column: Variation Details */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <h3 className="text-slate-200 font-semibold mb-6 text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                变体详细分析
            </h3>
            <div className="space-y-4">
                {report.runs.map((run, idx) => (
                <TestResultRow key={run.id} run={run} index={idx} />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportSection;