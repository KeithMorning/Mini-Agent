import type { Tool,Model, AgentState, Observation } from "./types";

export class Agent {
	private tools: Map<string,Tool>;

	constructor(private model:Model, tools:Tool[]){
		this.tools = new Map(tools.map(tool=>[tool.name,tool]));
	}

	async run(goal:string,maxSteps=20){
		const state:AgentState = {goal, history:[]}

		for(let i = 0; i < maxSteps; i++){

			//决策
			const decision = await this.model.decide(state);

			//2 判断是否结束
			if(decision.type == "finish"){
				return {
					status:"finish" as const,
					answer: decision.answer,
					state
				}
			}

			//3 查找工具
			const {action} = decision;
			const tool = this.tools.get(action.tool);
			let observation: Observation;

			try {
				observation = tool ? await tool.execute(action.input) : {success:false,output:"Unknown tools"}
			}catch(error){
				observation = {success:false,output:String(error)}
			}

			state.history.push({action:action,observation:observation})
		}

		return {status:"budget_exhausted" as const,state}
	}
}