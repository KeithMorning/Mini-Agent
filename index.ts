import { MockModel } from "./src/model";
import { calculate, TestTool } from "./src/tools";
import { Agent } from "./src/agent";

import { OpenAICompatibleAdapter } from "./src/openai-adapter";


const baseURL = process.env.MODEL_BASE_URL;
const apiKey = process.env.MODEL_API_KEY;
const modelName = process.env.MODEL_NAME;

if (!baseURL || !apiKey || !modelName) {
    throw new Error("Missing model configuration");
}

const model = new OpenAICompatibleAdapter(
    baseURL,
    apiKey,
    modelName,
);

const agent = new Agent(
	model,
	[calculate,TestTool]
)

const result = await agent.run("Caculate 12 + 8");
console.log(JSON.stringify(result,null,2))
