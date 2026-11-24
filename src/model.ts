import type { AgentState, Decision, Model } from "./types";

export class MockModel implements Model {
	async decide(state: AgentState): Promise<Decision> {
		if (state.executeHistory.length === 0) {
			return {
				type: "action",
				action: {
					callId: "xxx",
					tool: "calculate",
					input: { a: 10, b: 290 }
				},
				message: {
					role: "assistant",
					content: JSON.stringify(""),
				}
			}
		}

		const last = state.executeHistory.at(-1);
		if (last?.type === "tool_result") {
			if (!last.observation.success) {
				return {
					type: "finish",
					output: { answer: "Calculation failed.", result: null }, message: {
						role: "assistant",
						content: JSON.stringify(""),
					}
				}
			}
			return {
				type: "finish",
				output: { answer: `this answer is ${last.observation.output}`, result: last.observation.output },
				message: {
					role: "assistant",
					content: JSON.stringify(""),
				}
			}

		}

		return {
			type: "finish",
			output: { answer: "No calculation result available", result: null },
			message: {
				role: "assistant",
				content: JSON.stringify(""),
			}
		}



	}
}

