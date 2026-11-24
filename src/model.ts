import type { AgentState, Decision, Model } from "./types";

export class MockModel implements Model {
	async decide(state:AgentState):Promise<Decision>{
		if(state.history.length === 0){
			return {
				type:"action",
				action:{
					tool:"calculate",
					input:{a:10,b:290}
				}
			}
		}

		const last = state.history.at(-1);
		if(last?.type === "tool_result"){
			if(!last.observation.success){
				return {
					type: "finish",
					output:{answer: "Calculation failed.",result:null}
				}
			}
			return {
				type:"finish",
				output:{answer:`this answer is ${last.observation.output}`,result:last.observation.output},
			}

		}

		return {
			type:"finish",
			output:{answer:"No calculation result available",result:null},
		}
		

		
	}
}