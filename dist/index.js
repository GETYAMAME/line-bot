"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ask = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const bot_sdk_1 = require("@line/bot-sdk");
const path_1 = require("path");
const openai_1 = require("openai");
(0, dotenv_1.config)({ path: (0, path_1.resolve)(__dirname, "../.env") });
const app = (0, express_1.default)();
// LINEの設定値
const client = new bot_sdk_1.Client({
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
});
// OpenAIの設定値
const configuration = new openai_1.Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new openai_1.OpenAIApi(configuration);
// OpenAIへの接続　修正箇所
function ask(content, model = "gpt-4") {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield openai.createChatCompletion({
            model: model,
            messages: [
                {
                    role: "system",
                    content: process.env.SYSTEM_CHARACTER,
                },
                { role: "user", content: content },
            ],
        });
        const answer = (_a = response.data.choices[0].message) === null || _a === void 0 ? void 0 : _a.content;
        return answer;
    });
}
exports.ask = ask;
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.post("/callback", (req, res) => {
    console.log(req.body);
    Promise.all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((error) => {
        console.error(error);
        res.status(500).end();
    });
});
function handleEvent(event) {
    return __awaiter(this, void 0, void 0, function* () {
        if (event.type === "message" && event.message.type === "text") {
            const message = event.message.text;
            const answer = yield ask(message);
            const textMessage = {
                type: "text",
                text: answer,
            };
            return client.replyMessage(event.replyToken, textMessage);
        }
        return Promise.resolve(null);
    });
}
app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
