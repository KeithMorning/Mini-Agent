import { MathEvaluator } from "./evaluator";
import type { Tool, Model, AgentState, Observation, ToolSchema } from "./types";

export class Agent {
	private tools: Map<string, Tool>;
	private evaluator = new MathEvaluator(20);

	constructor(private model: Model, tools: Tool[]) {
		this.tools = new Map(tools.map(tool => [tool.name, tool]));
	}

	private getToolSchemas(): ToolSchema[] {
		return Array.from(this.tools.values()).map(
			({ name, description, parameters }) => ({
				name,
				description,
				parameters
			})
		)
	}

	async run(goal: string, maxSteps = 5) {
		const state: AgentState = {
			goal, executeHistory: [], conversation: [
				{
					role: "user",
					content: goal,
				},
			],
		}

		for (let i = 0; i < maxSteps; i++) {

			//1. 决策
			const decision = await this.model.decide(state, this.getToolSchemas());
			state.conversation.push(decision.message);


			//2 判断是否结束
			if (decision.type == "finish") {
				const evaluation = await this.evaluator.evaluate(state, decision.output)
				state.executeHistory.push({
					type: "evaluation",
					answer: decision.output.answer,
					passed: evaluation.passed,
					feedback: evaluation.feedback
				})
				if (evaluation.passed) {
					return {
						status: "finish" as const,
						answer: decision.output.answer,
						result: decision.output.result,
						state
					}
				}else{
					state.conversation.push({
						role: "user",
						content: `[Harness evaluation feedback]: ${evaluation.feedback
							}. Please correct your result.`,
					});
				}
				continue
			}

			//3 查找工具
			const { action } = decision;
			const tool = this.tools.get(action.tool);
			let observation: Observation;

			try {
				observation = tool ? await tool.execute(action.input) : { success: false, output: "Unknown tools" }
			} catch (error) {
				observation = { success: false, output: String(error) }
			}

			state.executeHistory.push({ type: "tool_result", action: action, observation: observation })
			state.conversation.push({role:"tool",toolCallId:action.callId,content:JSON.stringify(observation)})
		}

		return { status: "budget_exhausted" as const, state }
	}
}