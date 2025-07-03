import { useEffect, useState } from "react";
import MoodChart from "./components/MoodChart";
import { getAuthUrl } from "./utils/spotify";
import { generateMoodReflection } from "./utils/gpt";
import { getRecentTracks, getAudioFeatures } from "./utils/spotifyApi";

function App() {
  const [token, setToken] = useState("");
  const [tracks, setTracks] = useState([]);
  const [reflection, setReflection] = useState("");
  const [loading, setLoading] = useState(false);

  // Get token from URL or localStorage
  useEffect(() => {
    const hash = window.location.hash;
    const stored = window.localStorage.getItem("spotify_token");
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      if (accessToken) {
        setToken(accessToken);
        window.localStorage.setItem("spotify_token", accessToken);
        window.location.hash = "";
      }
    } else if (stored) {
      setToken(stored);
    }
  }, []);

  // Fetch tracks + features
  useEffect(() => {
    const fetchTracksAndFeatures = async () => {
      const recent = await getRecentTracks(token);
      const ids = recent.map((t) => t.track.id);
      const features = await getAudioFeatures(token, ids);

      const enrichedTracks = recent.map((item, i) => ({
        id: item.track.id,
        name: item.track.name,
        artist: item.track.artists[0].name,
        played_at: item.played_at,
        valence: features[i]?.valence,
        energy: features[i]?.energy,
        danceability: features[i]?.danceability,
      }));

      setTracks(enrichedTracks);

      // Generate mood reflection
      setLoading(true);
      const moodText = await generateMoodReflection(enrichedTracks);
      setReflection(moodText);
      setLoading(false);
    };

    if (token) fetchTracksAndFeatures();
  }, [token]);

  const login = () => {
    window.location.href = getAuthUrl();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {!token ? (
        <div className="h-screen flex justify-center items-center">
          <button
            onClick={login}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold"
          >
            Login with Spotify
          </button>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold mb-6">🎧 Recent Mood Tracks</h1>
          <MoodChart tracks={tracks} />

          <div className="mt-8 p-6 bg-gray-800 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-2">🧠 GPT Mood Reflection</h2>
            {loading ? (
              <p className="text-gray-400">Thinking...</p>
            ) : (
              <p className="text-gray-200 whitespace-pre-line">{reflection}</p>
            )}
          </div>

          <ul className="space-y-3 mt-8">
            {tracks.map((track) => (
              <li key={track.id} className="bg-gray-800 p-4 rounded-lg">
                <div className="font-semibold">
                  {track.name} - {track.artist}
                </div>
                <div className="text-sm text-gray-300">
                  Valence: {track.valence?.toFixed(2)} | Energy:{" "}
                  {track.energy?.toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;