const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const querystring = require("querystring");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  FRONTEND_URI
} = process.env;

// Step 1: Redirect user to Spotify login
app.get("/login", (req, res) => {
  const scopes = [
    "user-read-recently-played",
    "user-top-read",
    "user-library-read"
  ].join(" ");

  const authURL = `https://accounts.spotify.com/authorize?` +
    querystring.stringify({
      response_type: "code",
      client_id: CLIENT_ID,
      scope: scopes,
      redirect_uri: REDIRECT_URI
    });

  res.redirect(authURL);
});

// Step 2: Spotify redirects to this route with a code → we exchange it for an access token
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

    console.log("✅ Access Token Issued:", access_token);

    // Redirect to frontend with access_token in query string
    const params = querystring.stringify({
      access_token,
      refresh_token,
      expires_in
    });

    res.redirect(`${FRONTEND_URI}/dashboard?${params}`);
  } catch (error) {
    console.error("❌ Error getting tokens:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to get tokens" });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🎵 Spotify Auth Server running at http://localhost:${PORT}`);
});
