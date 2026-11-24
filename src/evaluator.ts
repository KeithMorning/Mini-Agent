import type { AgentState } from "./types";

export interface EvaluationResult{
	passed: boolean,
	feedback:string;
}

export interface AgentOutput{
	answer: string;
	result: unknown;
}

export interface Evaluator {
	evaluate(
		state:AgentState,
		output:AgentOutput,
	):Promise<EvaluationResult>;
}

export class MathEvaluator implements Evaluator {
	constructor(private expected:number){}
	async evaluate(state:AgentState,output:AgentOutput):Promise<EvaluationResult>{
		const actual = output.result;
		const passed = typeof actual === "number"  && Number.isFinite(actual) && actual === this.expected;
		return {
			passed,
			feedback:passed ? "Task verified successfully" : "Incorrect result recheck the calculation"
		}
	}
}