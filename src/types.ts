
/*
 * Agent 发起的行动
 * 
 */

export interface Action {
	tool:string;
	input:unknown;
}

/**
 * 环境返回的结果
*/
export interface Observation {
	success:boolean;
	output:unknown;
}


/**
 * 一轮行动与反馈记录
*/

export interface Step {
	action: Action;
	observation: Observation;
}


/*
* Agent 内部运行状态
*/
export interface AgentState {
	goal: string,
	history: Step[];
}


/**
 * 模型的决策
*/

export type Decision =
 | {type:"action",action:Action}
 | {type:"finish",answer:string};

/**
 * 模型适配的接口 
*/

export interface Model {
	decide(state: AgentState):Promise<Decision>
}

/**
 * 工具接口
*/

export interface Tool {
	name: string;
	description:string;
	execute(input: unknown): Promise<Observation>
}