import { deflateSync } from "bun";
import { MathEvaluator } from "./evaluator";
import type { Tool,Model, AgentState, Observation } from "./types";
import { calculate } from "./tools";

export class Agent {
	private tools: Map<string,Tool>;
	private evaluator = new MathEvaluator(300);

	constructor(private model:Model, tools:Tool[]){
		this.tools = new Map(tools.map(tool=>[tool.name,tool]));
	}

	async run(goal:string,maxSteps=20){
		const state:AgentState = {goal, history:[]}

		for(let i = 0; i < maxSteps; i++){

			//1. 决策
			const decision = await this.model.decide(state,[calculate]);
			

			//2 判断是否结束
			if(decision.type == "finish"){
				const evaluation = await this.evaluator.evaluate(state,decision.output)
				state.history.push({
					type:"evaluation",
					answer:decision.output.answer,
					passed:evaluation.passed,
					feedback:evaluation.feedback
				})
				if(evaluation.passed){
					return {
						status:"finish" as const,
						answer: decision.answer,
						state
					}
				}
				continue
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

			state.history.push({type:"tool_result",action:action,observation:observation})
		}

		return {status:"budget_exhausted" as const,state}
	}
}