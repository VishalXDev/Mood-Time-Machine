 🎧 Mood Time Machine

> Your music, your emotions — visualized and reflected.

Mood Time Machine is a React + AI-based prototype that analyzes a user's recent Spotify listening activity to visualize mood trends and generate thoughtful reflections using GPT-4. It aligns with **MoodScale's mission** of helping users understand and manage their mental well-being through music.

---

## 📌 Features

- 🔐 **Spotify Login**: OAuth 2.0 authentication
- 🎶 **Track Analysis**: Fetches recently played tracks
- 📊 **Mood Metrics**: Uses `valence`, `energy`, and `danceability` from Spotify's Audio Features API
- 📈 **Mood Chart**: Line graph showing valence over time (Chart.js)
- 🤖 **AI Reflection**: GPT-4 generates a friendly, emotional summary of the user's recent listening mood

---

## 🛠️ Tech Stack

- **Frontend**: React + Tailwind CSS
- **Data Sources**: Spotify Web API
- **AI Model**: OpenAI GPT-4 (via `openai` SDK)
- **Visualization**: Chart.js (via `react-chartjs-2`)
- **Deployment**: [Vercel](https://vercel.com/) or Streamlit Share

---

## 📂 Folder Structure

```txt
src/
├── components/
│   └── MoodChart.js         # Valence line chart
├── utils/
│   ├── spotify.js           # OAuth URL builder
│   ├── spotifyApi.js        # Spotify fetch logic
│   └── gpt.js               # OpenAI GPT mood reflection
├── App.js                   # Main logic
├── index.css                # Tailwind setup
🚀 How to Run Locally
Clone the repo

bash
Copy
Edit
git clone https://github.com/yourusername/mood-time-machine.git
cd mood-time-machine
Install dependencies

bash
Copy
Edit
npm install
Set up environment variables
Create a .env file in the root directory:

env
Copy
Edit
REACT_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id
REACT_APP_REDIRECT_URI=http://localhost:3000/callback
REACT_APP_SCOPES=user-read-recently-played user-top-read
REACT_APP_OPENAI_API_KEY=your_openai_api_key
Start the development server

bash
Copy
Edit
npm start
⚙️ APIs & Tools Used
Tool/API	Purpose
Spotify Web API	Auth, recent tracks, audio features
OpenAI GPT-4	Reflection generation
Chart.js	Mood trend visualization
Tailwind CSS	UI styling

📈 Challenges Faced
Handling token expiry and OAuth redirect flows

Balancing prompt clarity for GPT vs. creative output

Mapping quantitative metrics (valence, energy) to subjective moods

💡 Future Improvements
Add time range selection (1 week, 1 month, etc.)

Support mood journaling side-by-side with music analysis

Compare mood patterns across multiple users

Improve GPT prompt with more personalized memory/context

Secure OpenAI keys via backend proxy in production

🤝 Credits
Made with 💙 for the MoodScale Internship Assignment
By Vishal
