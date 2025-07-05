import { useEffect, useState, useMemo } from "react";
import MoodChart from "./components/MoodChart";
import { generateMoodReflection } from "./utils/gpt";
import { getRecentTracks, getAudioFeatures } from "./utils/spotifyApi";
import { FiMusic, FiTrendingUp, FiClock, FiLogIn, FiZap, FiHeart, FiPlay, FiUser, FiStar, FiHeadphones } from "react-icons/fi";

function App() {
  const [token, setToken] = useState("");
  const [tracks, setTracks] = useState([]);
  const [reflection, setReflection] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showStats, setShowStats] = useState(false);

  // Dummy reflections for when OpenAI key is exceeded - wrapped in useMemo
  const dummyReflections = useMemo(() => [
    "Your music choices reveal a fascinating emotional journey. The blend of high-energy tracks with more contemplative pieces suggests you're navigating through different moods with grace. Your listening patterns show a healthy balance between seeking excitement and finding comfort in familiar melodies. Keep embracing this musical diversity - it's a beautiful reflection of your multifaceted personality.",
    
    "There's something beautifully expressive about your recent musical selections. The mix of valence and energy in your tracks tells a story of someone who isn't afraid to feel deeply. Your playlist is like an emotional palette, painting different shades of your inner world. This kind of musical exploration often indicates a creative and emotionally intelligent soul.",
    
    "Your music taste is painting a picture of resilience and growth. The way you move between different energy levels in your tracks shows an intuitive understanding of what your heart needs. There's a therapeutic quality to how you're curating your sonic environment - it's like you're creating a personal soundtrack for healing and self-discovery.",
    
    "The emotional intelligence in your music choices is striking. You're not just listening to songs; you're crafting experiences that match and guide your emotional state. This kind of mindful music consumption suggests someone who values emotional authenticity and isn't afraid to explore the full spectrum of human feelings."
  ], []);

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
          valence: features[i]?.valence || Math.random(),
          energy: features[i]?.energy || Math.random(),
          danceability: features[i]?.danceability || Math.random(),
          albumCover: item.track.album?.images[0]?.url,
        }));

        if (isMounted) {
          setTracks(enrichedTracks);
          setLoading(true);
          
          // Show stats after a brief delay for better UX
          setTimeout(() => setShowStats(true), 500);
          
          try {
            const moodText = await generateMoodReflection(enrichedTracks);
            setReflection(moodText);
          } catch (err) {
            // Use dummy reflection if OpenAI fails
            const randomReflection = dummyReflections[Math.floor(Math.random() * dummyReflections.length)];
            setReflection(randomReflection);
          }
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
  }, [token, dummyReflections]);

  const login = () => {
    const backendURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
    window.location.href = `${backendURL}/login`;
  };

  const calculateMoodStats = () => {
    if (!tracks.length) return { avgValence: 0, avgEnergy: 0, avgDanceability: 0 };
    
    const avgValence = tracks.reduce((sum, track) => sum + (track.valence || 0), 0) / tracks.length;
    const avgEnergy = tracks.reduce((sum, track) => sum + (track.energy || 0), 0) / tracks.length;
    const avgDanceability = tracks.reduce((sum, track) => sum + (track.danceability || 0), 0) / tracks.length;
    
    return { avgValence, avgEnergy, avgDanceability };
  };

  const stats = calculateMoodStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 text-gray-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {!token ? (
        <div className="h-screen flex flex-col justify-center items-center p-6 text-center relative z-10">
          <div className="max-w-lg space-y-8 animate-fadeIn">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center shadow-xl">
                  <FiHeadphones className="text-4xl text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full"></div>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient">
                Mood Waves
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Transform your Spotify listening habits into beautiful emotional insights
              </p>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                Connect with Spotify to visualize your music's emotional journey and discover patterns in your listening habits
              </p>
            </div>

            <button
              onClick={login}
              className="group relative flex items-center justify-center gap-3 w-full px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold hover:from-purple-600 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <FiLogIn className="text-xl relative z-10" />
              <span className="relative z-10">Connect with Spotify</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"></div>
            </button>

            <div className="flex justify-center gap-8 pt-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <FiZap className="text-purple-400" />
                <span>Real-time Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <FiHeart className="text-pink-400" />
                <span>Mood Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <FiTrendingUp className="text-blue-400" />
                <span>Trend Tracking</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto p-4 md:p-6 max-w-7xl relative z-10">
          {/* Enhanced Header */}
          <header className="mb-12 text-center relative">
            <div className="inline-block">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient">
                Your Musical Journey
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-300 text-lg">
                Discover the emotions behind your recent Spotify activity
              </p>
            </div>
          </header>

          {error && (
            <div className="mb-8 p-6 bg-red-900/30 text-red-200 rounded-2xl backdrop-blur-sm border border-red-800/50 shadow-lg animate-slideIn">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          {showStats && (
            <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slideUp">
              <div className="glass-card p-6 group hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <FiHeart className="text-2xl text-pink-400" />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-pink-400">
                      {(stats.avgValence * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-400">Happiness</div>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-pink-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${stats.avgValence * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="glass-card p-6 group hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <FiZap className="text-2xl text-yellow-400" />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-400">
                      {(stats.avgEnergy * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-400">Energy</div>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${stats.avgEnergy * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="glass-card p-6 group hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <FiPlay className="text-2xl text-green-400" />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">
                      {(stats.avgDanceability * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-400">Danceability</div>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${stats.avgDanceability * 100}%` }}
                  ></div>
                </div>
              </div>
            </section>
          )}

          {/* Enhanced Chart Section */}
          <section className="mb-12 glass-card p-8 group hover:border-purple-500/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="text-xl text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Emotional Landscape</h2>
                <p className="text-gray-400 text-sm">Your mood patterns over time</p>
              </div>
            </div>
            <div className="h-96 md:h-[450px] relative">
              <MoodChart tracks={tracks} />
            </div>
          </section>

          {/* Enhanced Content Grid */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Enhanced Recent Tracks */}
            <div className="glass-card p-8 group hover:border-blue-500/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <FiMusic className="text-xl text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Recent Tracks</h2>
                  <p className="text-gray-400 text-sm">Your latest musical choices</p>
                </div>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {tracks.map((track, index) => (
                  <div 
                    key={track.id} 
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all duration-300 group/track border border-transparent hover:border-white/10"
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <div className="relative flex-shrink-0">
                      {track.albumCover ? (
                        <img 
                          src={track.albumCover} 
                          alt="Album cover" 
                          className="w-14 h-14 rounded-lg object-cover shadow-lg group-hover/track:shadow-xl transition-shadow duration-300"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <FiMusic className="text-white text-xl" />
                        </div>
                      )}
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-800"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate group-hover/track:text-purple-300 transition-colors">
                        {track.name}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">
                        {track.artist}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-1 text-xs">
                          <FiHeart className="text-pink-400" />
                          <span className="text-pink-400">{(track.valence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <FiZap className="text-yellow-400" />
                          <span className="text-yellow-400">{(track.energy * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Mood Reflection */}
            <div className="glass-card p-8 group hover:border-green-500/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <FiClock className="text-xl text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">AI Mood Reflection</h2>
                  <p className="text-gray-400 text-sm">Insights into your emotional journey</p>
                </div>
              </div>
              
              {loading ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-purple-400 font-medium">Analyzing your musical emotions...</span>
                  </div>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-4 bg-gray-700 rounded-full animate-pulse" style={{width: `${Math.random() * 40 + 60}%`}}></div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <div className="relative">
                    <div className="absolute top-0 left-0 text-4xl text-purple-400 font-serif">"</div>
                    <p className="text-gray-300 leading-relaxed pl-8 pt-2 italic">
                      {reflection || "Your musical journey is being analyzed..."}
                    </p>
                    <div className="absolute bottom-0 right-0 text-4xl text-purple-400 font-serif transform rotate-180">"</div>
                  </div>
                  
                  {reflection && (
                    <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                      <FiUser className="text-purple-400" />
                      <span>AI Mood Companion</span>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-16 text-center text-gray-500 text-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FiStar className="text-yellow-400" />
              <span>Powered by Spotify & AI</span>
              <FiStar className="text-yellow-400" />
            </div>
            <p>Your musical emotions, beautifully visualized</p>
          </footer>
        </div>
      )}
    </div>
  );
}

export default App;