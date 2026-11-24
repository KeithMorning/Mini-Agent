
const baseURL = process.env.MODEL_BASE_URL;
const apiKey = process.env.MODEL_API_KEY;
const model = process.env.MODEL_NAME;

if (!baseURL || !apiKey || !model) {
  throw new Error("Missing model configuration");
}

const endpoint =
  `${baseURL.replace(/\/+$/, "")}/chat/completions`;

const response = await fetch(endpoint, {
  method: "POST",

  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
  },

  body: JSON.stringify({
    model,

    messages: [
      {
        role: "system",
        content:
          "You are testing tool calling. Call the calculate tool exactly once with a=10 and b=290. Do not answer directly.",
      },
      {
        role: "user",
        content: "Calculate 10 + 290.",
      },
    ],

    tools: [
      {
        type: "function",
        function: {
          name: "calculate",
          description: "Add two numbers.",
          parameters: {
            type: "object",
            properties: {
              a: { type: "number" },
              b: { type: "number" },
            },
            required: ["a", "b"],
            additionalProperties: false,
          },
        },
      },
    ],

    tool_choice:"auto",
  }),
});

const raw = await response.text();

if (!response.ok) {
  throw new Error(
    `HTTP ${response.status}: ${raw}`
  );
}

const data = JSON.parse(raw);

const message = data.choices?.[0]?.message;

if (!message) {
  throw new Error("Invalid model response");
}

if (!message.tool_calls?.length) {
  console.log("Model content:", message.content);
  throw new Error("Model did not return a Tool Call");
}

console.log("Tool Calls:");

for (const call of message.tool_calls) {
  console.log({
    id: call.id,
    name: call.function.name,
    arguments: call.function.arguments,
  });
}
