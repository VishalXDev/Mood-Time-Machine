import { useEffect, useState } from "react";
import MoodChart from "./components/MoodChart";
import { generateMoodReflection } from "./utils/gpt";
import { getRecentTracks, getAudioFeatures } from "./utils/spotifyApi";

function App() {
  const [token, setToken] = useState("");
  const [tracks, setTracks] = useState([]);
  const [reflection, setReflection] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Refresh token logic
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("spotify_refresh_token");
    const backendURL = process.env.REACT_APP_BACKEND_URL;

    if (!refreshToken) return null;

    try {
      const res = await fetch(`${backendURL}/refresh_token?refresh_token=${refreshToken}`);
      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem("spotify_token", data.access_token);
        console.log("🔄 Refreshed token:", data.access_token);
        return data.access_token;
      }
    } catch (err) {
      console.error("❌ Error refreshing access token:", err);
    }

    return null;
  };

  // ✅ Extract tokens from URL and store in localStorage
  useEffect(() => {
    const stored = localStorage.getItem("spotify_token");
    const queryParams = new URLSearchParams(window.location.search);
    const accessToken = queryParams.get("access_token");
    const refreshToken = queryParams.get("refresh_token");

    if (accessToken) {
      console.log("✅ Access token received from callback:", accessToken);
      setToken(accessToken);
      localStorage.setItem("spotify_token", accessToken);

      if (refreshToken) {
        console.log("✅ Refresh token stored:", refreshToken);
        localStorage.setItem("spotify_refresh_token", refreshToken);
      }

      // ✅ Clean up URL after storing tokens
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (stored) {
      setToken(stored);
    }
  }, []);

  // ✅ Fetch recent tracks and audio features
  useEffect(() => {
    let isMounted = true;

    const fetchTracksAndFeatures = async (retry = false) => {
      try {
        setError(null);
        const recent = await getRecentTracks(token);

        if (!recent.length && !retry) {
          console.log("🔐 Token might be expired, attempting refresh...");
          const newToken = await refreshAccessToken();
          if (newToken) {
            setToken(newToken); // triggers re-run
          }
          return;
        }

        const ids = recent.map((t) => t.track.id).filter(Boolean);
        if (!ids.length) {
          console.warn("⚠️ No track IDs found.");
          return;
        }

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

        if (isMounted) {
          setTracks(enrichedTracks);
          setLoading(true);
          const moodText = await generateMoodReflection(enrichedTracks);
          setReflection(moodText);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to fetch data. Please try again.");
          console.error(err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (token) fetchTracksAndFeatures();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // ✅ Trigger login flow
  const login = () => {
    const backendURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
    window.location.href = `${backendURL}/login`;
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

          {error && (
            <div className="mb-4 p-4 bg-red-900 text-red-100 rounded-lg">
              {error}
            </div>
          )}

          <MoodChart tracks={tracks} />

          <div className="mt-8 p-6 bg-gray-800 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-2">🧠 GPT Mood Reflection</h2>
            {loading ? (
              <p className="text-gray-400">Analyzing your listening habits...</p>
            ) : (
              <p className="text-gray-200 whitespace-pre-line">
                {reflection || "No reflection available"}
              </p>
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
                  {track.energy?.toFixed(2)} | Danceability:{" "}
                  {track.danceability?.toFixed(2)}
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
