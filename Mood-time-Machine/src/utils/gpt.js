// ✅ gpt.js
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // ✅ for development only
});

/**
 * Generate a mood reflection using OpenAI from audio features.
 */
export const generateMoodReflection = async (tracks) => {
  const moodSummary = tracks
    .map(
      (t) =>
        `${t.name} by ${t.artist} - valence: ${t.valence?.toFixed(
          2
        )}, energy: ${t.energy?.toFixed(2)}`
    )
    .join("\n");

  const prompt = `You're an empathetic AI mood companion. A user listened to these tracks recently:\n\n${moodSummary}\n\nBased on the audio features (valence = happiness, energy = activity), reflect on the emotional state of the listener in a short, supportive paragraph. Be friendly, insightful, and gentle.`;

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    return res.choices[0]?.message?.content;
  } catch (err) {
    if (err.status === 429) {
      console.warn("⏳ OpenAI rate limit hit.");
      return "OpenAI quota exceeded. Please try again after some time.";
    }
    console.error("❌ Error in generateMoodReflection:", err);
    return "Failed to generate mood reflection.";
  }
};
