# PromptGuard✨
**A Robustness Testing Framework for LLM Prompts**

🚀 "让 Prompt 不再脆弱，让输出更稳定。"

🔍 “Test how stable your prompt truly is—automatically.”

## 🖼️ 界面预览 (UI Preview)

Cyber-Neon 赛博霓虹界面，用于高质量 Prompt 鲁棒性测试

<div align="center">
  <img src="https://github.com/mire403/PromptGuard/blob/main/promptguard---%E6%8F%90%E7%A4%BA%E8%AF%8D%E9%B2%81%E6%A3%92%E6%80%A7%E6%B5%8B%E8%AF%95%E5%B7%A5%E5%85%B7/%E4%B8%BB%E9%A1%B5.png">
</div>

## 🌟 项目简介 / Project Overview

**PromptGuard**是一个用于测试大语言模型**Prompt鲁棒性**的全流程工具。

它可以根据原始提示词自动生成语义变体，执行多轮模型调用，并使用 AI 裁判评估输出一致性，从而衡量你的提示词是否稳定、可靠。

适合：

🔬 AI / NLP 研究人员

🧪 Prompt 工程师

🤖 LLM 应用开发者

📈 对模型稳定性敏感的生产环境

**PromptGuard** is a full-pipeline tool for evaluating the **robustness of LLM prompts**.

It automatically generates semantic prompt variations, runs multi-threaded test executions, and uses AI-as-a-Judge to evaluate consistency against the baseline output.

Perfect for:

🔬 AI/NLP researchers

🧪 Prompt engineers

🤖 Developers building LLM systems

📈 Production environments requiring stable LLM behavior

## ⚙️ 核心功能 / Key Features

### 🌀 1. 语义变异生成

**Semantic Variation Generation**

基于原始 Prompt 自动生成多个表达不同但语义等价的变体，测试 Prompt 的耐受能力。

Based on your prompt, the system creates multiple semantically equivalent variations.

### ⚡ 2. 高并发执行

**High-Parallel Execution**

并行执行多轮模型调用，实现快速鲁棒性测试。

Run all variations in parallel to speed up evaluation.

### 🤖 3. AI 智能裁判（LLM-as-Judge）

**AI Judging System**

使用 LLM 对每次输出进行打分、提供评分理由（reasoning），确保评估可解释。

LLM evaluates consistency and provides human-readable reasoning.

### 📊 4. 鲁棒性报告

**Robustness Report**

报告包括：

基线输出（Baseline Output）

变体输出（Run Outputs）

每轮得分

平均稳定性分数

错误分析

完整 reasoning

A complete and transparent robustness evaluation.

## 🧩 数据结构 / Data Structures

PromptGuard 的类型定义（你提供的接口）如下：

```ts
export interface PromptVariation {
  id: string;
  text: string;
}

export interface EvaluationResult {
  score: number; // 0 to 100
  reasoning: string;
}

export interface TestRun {
  id: string;
  variation: PromptVariation;
  output: string;
  evaluation?: EvaluationResult;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
}

export interface RobustnessReport {
  originalPrompt: string;
  originalOutput: string;
  runs: TestRun[];
  averageScore: number;
  isComplete: boolean;
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING_VARIATIONS = 'GENERATING_VARIATIONS',
  RUNNING_BASELINE = 'RUNNING_BASELINE',
  RUNNING_TESTS = 'RUNNING_TESTS',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ProgressState {
  current: number;
  total: number;
  message: string;
}
```

## 🚀 使用流程 / How It Works

```css
[用户输入 Prompt]
        ↓
[生成语义变体]
        ↓
[执行 baseline 输出]
        ↓
[并行执行变体测试]
        ↓
[AI Judge 自动评分]
        ↓
[生成鲁棒性报告]
```

## 📥 安装与运行 / Install & Run

```bash
git clone https://github.com/yourname/promptguard
cd promptguard
npm install
npm run dev
```

## 📚 项目亮点 / Highlights

🟣 赛博霓虹 UI（Cyber-Neon UI）

🎯 自动化 Prompt Stress Testing

⚡ 多线程并发执行

🧠 LLM-as-Judge 自解释评估

📈 可视化评分

📦 完整类型系统（TypeScript）

🪶 前端使用 React + Tailwind + ShadCN UI

## ❤️ 贡献者 / Contributing

欢迎 PR、Issue，也欢迎你提交新的测试方法与鲁棒性指标！
