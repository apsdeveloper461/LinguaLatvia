import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import axios from "axios";
import { deeplClient } from "./config/deepl.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.status(200).send({
    message:
      "This is virtual assistant server url, please visit https://lingua-latvia.vercel.app/ to see the app",
  });
});

app.post("/", async (req, res) => {
  try {
    console.log("🔍 Request Body:", req.body); // ✅ Log the request body

    // Check if the request body is empty
    const result = await deeplClient.translateText(
      req.body.input,
      null,
      "en-US"
    ); // Updated targetLang to 'en-US'
    // console.log("result:", result); // ✅ Log the translation result
    const translatedText = result.text;
    // console.log("Translated Text:", translatedText); // ✅ Log the translated text
    const options = {
      method: "POST",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      data: {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a friendly Latvian language partner named LinguaLatvia. You chat naturally with the user in an informal and friendly tone, like a native Latvian friend helping someone practice their Latvian.

The user is learning Latvian and may make grammar mistakes or write awkward sentences. Your job is to:

1. Understand what they’re trying to say (even if it’s a bit incorrect).
2. Reply with a friendly message in English (to be translated to Latvian).
3. Gently point out and correct any grammar or sentence structure mistakes they made, if any.
4. Optionally, explain a better way to say the sentence naturally in Latvian.

Be encouraging and supportive. Make the conversation feel natural and not like a classroom. Use casual tone, slang, or cultural references if appropriate. 

Your main goals are:
- Help the user improve their Latvian.
- Keep the conversation flowing like a real friend.
- **Avoid repeating the same suggestion or correction multiple times.**
- **Ensure your responses are varied and do not repeat the same sentences or phrases. Keep it fresh and engaging.**
`,
          },
          {
            role: "user",
            content: translatedText,
          },
        ],
        temperature: 0.9,
        max_tokens: 1024,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
    };
    const response = await axios.request(options);
    const content = response.data.choices[0].message.content;
    // console.log("content:", content);
    //  reconvert into latvian language

    const result2 = await deeplClient.translateText(content, null, "lv"); // Updated targetLang to 'lv'
    // console.log("result:", result); // ✅ Log the translation result
    // console.log("Translated Text:", result2.text); // ✅ Log the translated text
    res.status(200).send({
      bot: {
        en: content,
        lt:result2.text,
      }
    });
  } catch (error) {
    console.log("FAILED:", req.body.input);
    console.error(
      "error while generating result from AI",
      error && error.response ? error.response.data : error
    );
    res.status(500).send(error);
  }
});

// app.post("/game01", async (req, res) => {
//   try {
//     const previous = req.body.data || []; // Get the previous data from the request body
//     const parseData = `Here is the list of words already provided: ${JSON.stringify(previous.map(item => item.lt))}. Do not repeat any of these.`; // Refined prompt for distinct data
//     // console.log("Previous data:", parseData); // Log the previous data

//     const messages = [
//       {
//         role: "system",
//         content: "You are a helpful assistant that provides 10 simple Latvian words and their English meanings for children. Respond only in json  format: [{lt: 'Latvian', en: 'English'}, ...].",
//       },
//       {
//         role: "system",
//         content: parseData,
//       },
//       {
//         role: "user",
//         content: "Provide 10 unique simple Latvian words with their English meanings that have not been given before.",
//       },
//     ];

//     const options = {
//       method: "POST",
//       url: "https://api.openai.com/v1/chat/completions",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//       },
//       data: {
//         model: "gpt-4o-mini",
//         messages,
//         temperature: 0.5,
//         max_tokens: 512,
//       },
//     };

//     const response = await axios.request(options);
//     const content = response.data.choices[0].message.content;
//     // console.log("content:", content); // Log the response content


//       // Remove Markdown formatting (e.g., ```json and ```) and parse as JSON
//       const tasks = JSON.parse(content.replace(/```json|```/g, "").trim());
    

//     res.status(200).send({ gameData: tasks });
//   } catch (error) {
//     console.error("Error in /game01:", error.response?.data || error.message || error);
//     res.status(500).send({ error: "Failed to generate game data." });
//   }
// });


app.post("/game01", async (req, res) => {
  const { data: previous = [], difficulty } = req.body; // Extract difficulty 
  //from request body
  // console.log(difficulty,previous)
  const parseData = `Here is the list of words already provided: ${JSON.stringify(previous.map(item => item.word))}. Do not repeat any of these.`; // Refined prompt for distinct data

  const messages = [
    {
      role: "system",
      content: `You are a helpful assistant that provides five unique Latvian words with their English meaning as clue. Focus on the difficulty level: ${difficulty}. Respond in JSON format:
[{ "word": "hello", "clue": "sveiki" }]. Ensure the words are unique and do not repeat any previously provided words.`,
    },
    {
      role: "system",
      content: parseData,
    },
    {
      role: "user",
      content: "Provide five unique Latvian words with their English meanings.",
    },
  ];

  try {
    const options = {
      method: "POST",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      data: {
        model: "gpt-4o-mini",
        messages,
        temperature: 0.5,
        max_tokens: 512,
      },
    };

    const completion = await axios.request(options);
    const content = completion.data.choices[0].message.content;

    // Parse the JSON response and handle errors if parsing fails
    const tasks = JSON.parse(content.replace(/```json|```/g, "").trim());

    res.json(tasks);
  } catch (error) {
    console.error("Error generating words:", error.response?.data || error.message || error);
    res.status(500).json({ error: "Failed to fetch words." });
  }
});

// // Endpoint to check answer
// app.post('/api/check', (req, res) => {
//   const { guess, answer } = req.body;
//   res.json({ correct: guess.toLowerCase() === answer.toLowerCase() });
// });

app.post("/game02", async (req, res) => {
  try {
    const { data: previous = [], difficulty } = req.body; // Extract difficulty from request body
    // console.log(previous, difficulty);

    const parseData = `Here is the list of questions already provided: ${JSON.stringify(previous)}. Do not repeat any of these.`;

    const messages = [
      {
        role: "system",
        content: `You are an assistant that generates Latvian vocabulary questions for children learning Latvian. Focus on the difficulty level: ${difficulty}. Each question must:
- Be grammatically correct and natural.
- Include a sentence with a missing word (fill-in-the-blank format).
- Provide an English translation of the sentence.
- Include three options for the missing word.
- Specify the correct answer.

Respond in this JSON format:
[
  {
    "sentence": "_ _ _ ir liela",
    "translation": "The house is big",
    "options": ["māja", "auto", "skola"],
    "correctAnswer": "māja"
  },
  ...
]

Ensure:
1. The questions are unique and do not repeat any previously provided data.
2. The options are relevant to the sentence.
3. The correct answer is accurate.
${parseData}`,
      },
      {
        role: "user",
        content: "Provide 10 unique vocabulary questions in the specified format.",
      },
    ];

    const options = {
      method: "POST",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      data: {
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      },
    };

    const response = await axios.request(options);
    const content = response.data.choices[0].message.content;

    // Validate and parse the JSON response
    let questions;
    try {
      questions = JSON.parse(content);
      if (!Array.isArray(questions) || questions.some(q => !q.sentence || !q.translation || !q.options || !q.correctAnswer)) {
        throw new Error("Invalid response format");
      }
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      return res.status(500).send({ error: "Failed to parse AI response." });
    }

    res.status(200).send({ gameData: questions });
  } catch (error) {
    console.error("Error in /game02:", error.response?.data || error.message || error);
    res.status(500).send({ error: "Failed to generate game data." });
  }
});

app.post("/game03", async (req, res) => {
  try {
    const { data: previous = [], difficulty } = req.body; // Extract difficulty 
    // from request body
    // console.log(difficulty,previous)
    const parseData = `Here is the list of translations already provided: ${JSON.stringify(previous)}. Do not repeat any of these.`;

    const messages = [
      {
        role: "system",
        content: `You are a helpful assistant that translates simple English words or phrases into Latvian. Focus on the difficulty level: ${difficulty}. Respond in JSON format with 4 items like this format and two extra options to confuse the user: 
{
  "matchQ": [
    { "question": "...", "answer": "..." },
    ...
  ],
  "extraOption": ["...", "..."]
}. Ensure the translations are unique and do not repeat any previously provided data.`,
      },
      {
        role: "system",
        content: parseData,
      },
      {
        role: "user",
        content: "Provide 4 unique English to Latvian translations with two extra options.",
      },
    ];

    const options = {
      method: "POST",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      data: {
        model: "gpt-4o-mini",
        messages,
        temperature: 0.5,
        max_tokens: 1024,
      },
    };

    const response = await axios.request(options);
    let content = response.data.choices[0].message.content;

    // Parse the JSON response and handle the structure
    content = content.replace(/```json|```/g, "").trim();
    const parsedContent = JSON.parse(content);
    const matchQ = parsedContent.matchQ || [];
    const extraOption = parsedContent.extraOption || [];

    res.status(200).send({ gameData: matchQ, extraOption });
  } catch (error) {
    console.error("Error in /game03:", error.response?.data || error);
    res.status(500).send({ error: "Failed to generate game data." });
  }
});

app.listen(4000, () => console.log("Server is running."));
