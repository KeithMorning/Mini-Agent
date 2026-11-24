import type { AgentState, AssistantMessage, ConversationMessage, Decision, Model, ToolCall, ToolSchema } from "./types";

function encodeMessage(message: ConversationMessage){
	switch(message.role){
		case "user":
			return {role:"user",content:message.content}
		case "assistant":
			return {
				role:"assistant",
				content:message.content, 
				...(message.toolCalls?.length ? {
					tool_calls:message.toolCalls.map(call=>({
						id:call.id,
						type:"function",
						function:{ name: call.name, arguments:call.arguments}
					}))
				}:{}),
			}
		case "tool":
			return {
				role:"tool",
				tool_call_id:message.toolCallId,
				content:message.content
			};
	}
}




export class OpenAICompatibleAdapter implements Model{
	constructor(
		private baseURL:string,
		private apiKey:string,
		private modelName:string,
	){}

	async decide(state: AgentState, tools: ToolSchema[]): Promise<Decision> {
	const messages = [
		{
			role: "system",
			content: `
	You are an autonomous task-solving agent.

	Use the available tools to solve the user's task.
	Observe tool results before deciding what to do next.

	When the task is complete, return only a JSON object:
	{
		"answer": "Human-readable answer",
		"result": <actual result>
	}

	Do not wrap the JSON in markdown.
			`.trim(),
		},

		...state.conversation.map(encodeMessage)
	];

		const hasToolResult = state.conversation.some(message => message.role === "tool")
		const response = await fetch(
			`${this.baseURL.replace(/\/+$/, "")}/chat/completions`,
			{
				method:"POST",
				headers:{
					"Content-Type": "application/json",
                    "Authorization": `Bearer ${this.apiKey}`,
				},
				body: JSON.stringify({
					model:this.modelName,
					messages,
					...(tools.length > 0 ? {
                        tools: tools.map(tool => ({
                            type: "function",
                            function: {
                                name: tool.name,
                                description: tool.description,
                                parameters: tool.parameters,
                            },
                        })),

                        tool_choice: hasToolResult
                            ? "auto"
                            : "required",
                    } : {}),
					
				}),
				signal: AbortSignal.timeout(60000),
			})

			if(!response.ok){
				throw new Error(`HTTP ${response.status}:${await response.text()}`)
			}

			const data = await response.json();
			return this.decode(data);
	}

	
	private decode(data:unknown):Decision {
		const response = data as {
			choices?: Array<{
				message?: {
                content?: string | null;
                tool_calls?: Array<{
                    id: string;
                    type: string;
                    function: {
                        name: string;
                        arguments: string;
                    };
                }>;
            	};
			}>
		}

		const raw = response?.choices?.[0]?.message;
		if (!raw) {
  	      throw new Error("Invalid model response");
		}
		const calls = raw.tool_calls ?? [];
		// V0.0 暂时只支持单工具调用
		if (calls.length > 1) {
			throw new Error("Multiple tool calls are not supported yet");
		}

		// 情况一：模型请求执行工具
		if (calls.length === 1) {

			const call = calls[0];

			if (
				!call ||
				call.type !== "function" ||
				typeof call.id !== "string" ||
				typeof call.function?.name !== "string" ||
				typeof call.function?.arguments !== "string"
			) {
				throw new Error("Invalid tool call");
			}

			const toolCall: ToolCall = {
				id: call.id,
				name: call.function.name,
				arguments: call.function.arguments,
			};

			const message: AssistantMessage = {
				role: "assistant",
				content: raw.content ?? null,
				toolCalls: [toolCall],
			};
			return {
            	type: "action",
				action: {
					callId: toolCall.id,
					tool: toolCall.name,
					input: JSON.parse(toolCall.arguments),
				},
				message,
        	};
		}

		    // 情况二：模型提交最终结果
		if (typeof raw.content !== "string") {
			throw new Error("Missing final response");
		}

		const output: unknown = JSON.parse(raw.content);

		if (
			typeof output !== "object" ||
			output === null ||
			!("answer" in output) ||
			typeof output.answer !== "string" ||
			!("result" in output)
		) {
			throw new Error("Invalid structured output");
		}

		return {
			type: "finish",

			output: {
				answer: output.answer,
				result: output.result,
			},

			message: {
				role: "assistant",
				content: raw.content,
			},
		};
	}
}