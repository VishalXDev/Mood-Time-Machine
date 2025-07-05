const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const querystring = require("querystring");
const OpenAI = require("openai");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  FRONTEND_URI,
  OPENAI_API_KEY
} = process.env;

// 🔁 Log env variable to debug redirect_uri issue
console.log("🔁 REDIRECT_URI from env:", REDIRECT_URI);

if (!REDIRECT_URI) {
  console.error("❌ REDIRECT_URI is missing. Make sure it's defined in Render → Environment tab.");
}

// 🎧 Spotify OAuth routes...
app.get("/login", (req, res) => {
  const scopes = [
    "user-read-recently-played",
    "user-top-read",
    "user-library-read"
  ].join(" ");

  const authURL = `https://accounts.spotify.com/authorize?` + querystring.stringify({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: scopes,
    redirect_uri: REDIRECT_URI
  });

  console.log("🔗 Redirecting to Spotify Auth URL:", authURL);
  res.redirect(authURL);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code || null;

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;

    const params = querystring.stringify({
      access_token,
      refresh_token,
      expires_in
    });

    res.redirect(`${FRONTEND_URI}/?${params}`);
  } catch (error) {
    console.error("Error getting tokens:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to get tokens" });
  }
});

app.get("/refresh_token", async (req, res) => {
  const refresh_token = req.query.refresh_token;

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "refresh_token",
        refresh_token
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const { access_token } = response.data;
    res.json({ access_token });
  } catch (error) {
    console.error("Error refreshing token:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to refresh token" });
  }
});

// 🔮 GPT Mood Reflection Endpoint
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

app.post("/generate-reflection", async (req, res) => {
  const tracks = req.body.tracks;
  if (!tracks || !Array.isArray(tracks)) {
    return res.status(400).json({ error: "Missing or invalid tracks" });
  }

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
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    res.json({ message: response.choices[0]?.message?.content });
  } catch (err) {
    console.error("❌ OpenAI error:", err);
    res.status(500).json({ error: "Failed to generate mood reflection." });
  }
});

// 🟢 Health check (optional)
app.get("/", (req, res) => {
  res.send("✅ Mood-Time-Machine backend running.");
});

// 🚀 Port
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🎵 Spotify Auth Server running at http://localhost:${PORT}`);
});
