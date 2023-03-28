import express from "express";
import { config } from "dotenv";
import { Client, TextMessage } from "@line/bot-sdk";
import { resolve } from "path";
import { Configuration, OpenAIApi } from "openai";

config({ path: resolve(__dirname, "../.env") });
const app = express();

// LINEの設定値
const client = new Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
});

// OpenAIの設定値
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// OpenAIへの接続
export async function ask(content: string, model = "gpt-3.5-turbo-0301") {
  const response = await openai.createChatCompletion({
    model: model,
    messages: [
      {
        role: "system",
        content:
          "あなたは社員に対してアドバイスを行うビジネスコーチです。相手の話を聞いて内省を促してください。",
      },
      { role: "user", content: content },
    ],
  });

  const answer = response.data.choices[0].message?.content;
  return answer;
}

const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/callback", (req, res) => {
  console.log(req.body);
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((error) => {
      console.error(error);
      res.status(500).end();
    });
});

async function handleEvent(event: any): Promise<any> {
  if (event.type === "message" && event.message.type === "text") {
    const message: string = event.message.text;
    const answer = await ask(message);
    const textMessage: TextMessage = {
      type: "text",
      text: answer as unknown as string,
    };

    return client.replyMessage(event.replyToken, textMessage);
  }

  return Promise.resolve(null);
}

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
