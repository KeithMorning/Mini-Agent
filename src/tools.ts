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