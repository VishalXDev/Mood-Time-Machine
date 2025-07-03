import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // 👈 only for dev. Don’t use in production
});

export const generateMoodReflection = async (tracks) => {
  const moodSummary = tracks
    .map((t) => `${t.name} by ${t.artist} - valence: ${t.valence?.toFixed(2)}, energy: ${t.energy?.toFixed(2)}`)
    .join("\n");

  const prompt = `
You're an empathetic AI mood companion. A user listened to these tracks recently:

${moodSummary}

Based on the audio features (valence = happiness, energy = activity), reflect on the emotional state of the listener in a short, supportive paragraph. Be friendly, insightful, and gentle.
  `;

  const res = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return res.choices[0]?.message?.content;
};
