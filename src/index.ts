import express from "express";
import { config } from "dotenv";
import { Client, TextMessage } from "@line/bot-sdk";
import { resolve } from "path";
import { Configuration, OpenAIApi } from "openai";

config({ path: resolve(__dirname, "../.env") });
const app = express();

const client = new Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
});

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

function handleEvent(event: any): Promise<any> {
  if (event.type === "message" && event.message.type === "text") {
    const message: string = event.message.text;
    const textMessage: TextMessage = {
      type: "text",
      text: "Hello, world!",
    };

    return client.replyMessage(event.replyToken, textMessage);
  }

  return Promise.resolve(null);
}

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
