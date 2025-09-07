module.exports = { config: { name: "calculator", aliases: ["calc"], version: "1.0", author: "moye moye 🐤", countDown: 3, role: 0, description: "Perform simple mathematical calculations", category: "utility" },

onStart: async function ({ message, args, event, api }) { if (args.length === 0) { return message.reply("Please provide a math expression to evaluate. Example: !calc 5 + 3 * 2"); }

const input = args.join(" ");

try {
  const result = Function(`"use strict"; return (${input})`)();

  if (typeof result === "number") {
    const reply = `📐 Expression: ${input}\n🧮 Result: ${result}`;

    api.sendMessage({
      body: reply,
      attachment: null,
      canvas: {
        width: 512,
        height: 256,
        draw: ({ ctx }) => {
          ctx.fillStyle = "#1a1a1a";
          ctx.fillRect(0, 0, 512, 256);

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 26px Arial";
          ctx.fillText("Math Expression:", 20, 60);

          ctx.fillStyle = "#00ffcc";
          ctx.font = "bold 32px Arial";
          ctx.fillText(input, 40, 110);

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 26px Arial";
          ctx.fillText("Result:", 20, 180);

          ctx.fillStyle = "#00ff66";
          ctx.font = "bold 32px Arial";
          ctx.fillText(result.toString(), 40, 230);
        }
      }
    }, event.threadID);

  } else {
    message.reply("❌ Invalid expression.");
  }
} catch (err) {
  message.reply("❌ Error evaluating the expression. Make sure it's a valid math expression.");
}

} };