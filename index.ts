import { MockModel } from "./src/model";
import { calculate } from "./src/tools";
import { Agent } from "./src/agent";

const agent = new Agent(
	new MockModel(),
	[calculate]
)

const result = await agent.run("Caculate 12 + 8");
console.log(JSON.stringify(result,null,2))
