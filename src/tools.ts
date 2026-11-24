import type { Tool } from "./types";

export const calculate: Tool = {
	name: "calculate",
	description: "add two number",
	parameters:{
		type:"object",
		properties:{
			a: {type: "number"},
			b: {type: "number"}
		},
		require:["a","b"],
		additionalProperties:false
	},
	async execute(input: unknown){
		if(typeof(input) !== "object"
			|| input === null
			|| !("a" in input)
			|| !("b" in input)
			|| typeof input.a !== "number"
			|| typeof input.b !== "number"
			|| !Number.isFinite(input.a)
			|| !Number.isFinite(input.b)
		){
			return {success:false, output:"Invalid input"}
		}

		return {success:true,output:input.a + input.b}
	}
}


export const TestTool:Tool = {
	name: "echo_hello_test",
	description:"You can use this for test for tools",
	parameters:{
		type:"object",
		properties:{
			input:{type:"string"}
		},
	},
	async execute(input:unknown){
		if(typeof(input) === "string" && input !== null && input.length > 0){
			return {success:true,output:input}
		}
		return {success:false,output:"invalid input or empty input"}
	}
}