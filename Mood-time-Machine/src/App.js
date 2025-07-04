import { useEffect, useState } from "react";
import MoodChart from "./components/MoodChart";
import { generateMoodReflection } from "./utils/gpt";
import { getRecentTracks, getAudioFeatures } from "./utils/spotifyApi";
import { FiMusic, FiTrendingUp, FiClock, FiLogIn } from "react-icons/fi";

function App() {
  const [token, setToken] = useState("");
  const [tracks, setTracks] = useState([]);
  const [reflection, setReflection] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("spotify_refresh_token");
    const backendURL = process.env.REACT_APP_BACKEND_URL;

    if (!refreshToken) return null;

    try {
      const res = await fetch(`${backendURL}/refresh_token?refresh_token=${refreshToken}`);
      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem("spotify_token", data.access_token);
        return data.access_token;
      }
    } catch (err) {
      console.error("Error refreshing access token:", err);
    }
    return null;
  };

  useEffect(() => {
    const stored = localStorage.getItem("spotify_token");
    const queryParams = new URLSearchParams(window.location.search);
    const accessToken = queryParams.get("access_token");
    const refreshToken = queryParams.get("refresh_token");

    if (accessToken) {
      setToken(accessToken);
      localStorage.setItem("spotify_token", accessToken);

      if (refreshToken) {
        localStorage.setItem("spotify_refresh_token", refreshToken);
      }

      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (stored) {
      setToken(stored);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchTracksAndFeatures = async (retry = false) => {
      try {
        setError(null);
        const recent = await getRecentTracks(token);

        if (!recent.length && !retry) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            setToken(newToken);
          }
          return;
        }

        const ids = recent.map((t) => t.track.id).filter(Boolean);
        if (!ids.length) return;

        const features = await getAudioFeatures(token, ids);

        const enrichedTracks = recent.map((item, i) => ({
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists[0].name,
          played_at: item.played_at,
          valence: features[i]?.valence,
          energy: features[i]?.energy,
          danceability: features[i]?.danceability,
          albumCover: item.track.album?.images[0]?.url,
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

  const login = () => {
    const backendURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
    window.location.href = `${backendURL}/login`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      {!token ? (
        <div className="h-screen flex flex-col justify-center items-center p-6 text-center">
          <div className="max-w-md space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
                Mood Waves
              </h1>
              <p className="text-gray-400">
                Visualize your Spotify listening habits and get AI-powered mood insights
              </p>
            </div>
            <button
              onClick={login}
              className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 text-white font-medium hover:from-purple-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <FiLogIn className="text-lg" />
              Connect with Spotify
            </button>
          </div>
        </div>
      ) : (
        <div className="container mx-auto p-4 md:p-6 max-w-6xl">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
              Your Mood Analysis
            </h1>
            <p className="text-gray-400">
              Based on your recent Spotify listening activity
            </p>
          </header>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 text-red-100 rounded-lg backdrop-blur-sm border border-red-800/50">
              {error}
            </div>
          )}

          <section className="mb-8 bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 shadow-lg">
            <div className="flex items-center gap-2 mb-4 text-blue-400">
              <FiTrendingUp className="text-xl" />
              <h2 className="text-xl font-semibold">Mood Trends</h2>
            </div>
            <div className="h-96">
              <MoodChart tracks={tracks} />
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 shadow-lg">
              <div className="flex items-center gap-2 mb-4 text-purple-400">
                <FiMusic className="text-xl" />
                <h2 className="text-xl font-semibold">Recent Tracks</h2>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {tracks.map((track) => (
                  <div key={track.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-200">
                    {track.albumCover && (
                      <img 
                        src={track.albumCover} 
                        alt="Album cover" 
                        className="w-12 h-12 rounded-md object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{track.name}</h3>
                      <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      <div>V: {track.valence?.toFixed(2)}</div>
                      <div>E: {track.energy?.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 shadow-lg">
              <div className="flex items-center gap-2 mb-4 text-blue-400">
                <FiClock className="text-xl" />
                <h2 className="text-xl font-semibold">Mood Reflection</h2>
              </div>
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-700 rounded w-4/6"></div>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 whitespace-pre-line">
                    {reflection || "No reflection available"}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;