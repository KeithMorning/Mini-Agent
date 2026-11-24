
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


export type HistoryEvent = 
| { type:"tool_result";action:Action;observation:Observation;}
| { type: "evaluation"; answer:string; passed:boolean; feedback:string;}


/*
* Agent 内部运行状态
*/
export interface AgentState {
	goal: string,
	history: HistoryEvent[];
}


/**
 * 模型的决策
*/

export type Decision =
 | {type:"action",action:Action}
 | {type:"finish",output:{answer:string,result:unknown}};

/**
 * 模型适配的接口 
*/

export interface Model {
	decide(state: AgentState,tools:ToolSchema[]):Promise<Decision>
}

/**
 * 工具接口
*/

export interface Tool extends ToolSchema{
	execute(input: unknown): Promise<Observation>
}


/**
 * Tools 定义集合
*/

export interface ToolSchema {
	name:string;
	description:string;
	parameters:Record<string,unknown>;
}