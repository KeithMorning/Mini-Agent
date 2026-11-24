# 第一节课 自主Agent 学习

自主Agent 最小的实现单元为 Agent Loop，Model Agnostic，Tool System，Skills，Memory，Multi-Agent，Safe Policy， Observability， Human-in-the-loop


决策权不等于执行权：LLM 提出行动，Harness 决定是否执行。
工具调用是一个协议过程：一次响应可能包含多个 Tool Calls。
完成声明不等于任务完成：Evaluator 必须独立验收。

感知任务 → 自主选择工具 → 动态生成参数 → 执行行动 → 观察反馈 → 再次决策。