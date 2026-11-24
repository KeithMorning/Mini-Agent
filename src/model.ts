import type { AgentState, Decision, Model } from "./types";

export class MockModel implements Model {
	async decide(state:AgentState):Promise<Decision>{
		if(state.history.length === 0){
			return {
				type:"action",
				action:{
					tool:"calculate",
					input:{a:12,b:8}
				}
			}
		}

		const last = state.history.at(-1);
		if(!last?.observation.success){
			return {
				type: "finish",
				answer: "Calculation failed."
			}
		}

		return {type:"finish",answer: `the answer is ${last.observation.output}`}
	}
}