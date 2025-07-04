// ✅ spotifyApi.js

/**
 * Fetch user's recently played tracks from Spotify.
 * If token is expired (401), throws "Unauthorized" to trigger refresh.
 */
export const getRecentTracks = async (token, limit = 20) => {
  try {
    const res = await fetch(
      `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.status === 401) {
      console.warn("⚠️ Access token expired or invalid");
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const errorData = await res.json();
      console.error("❌ Failed to fetch recent tracks:", errorData);
      throw new Error(
        `Spotify API error: ${errorData.error?.message || "Unknown error"}`
      );
    }

    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error("❌ Error in getRecentTracks:", error.message);
    if (error.message === "Unauthorized") throw error;
    return [];
  }
};

/**
 * Fetch audio features (valence, energy, danceability, etc.) for track IDs.
 * Spotify limits to 100 IDs max, so we slice and dedupe.
 */
export const getAudioFeatures = async (token, trackIds = []) => {
  const ids = [...new Set(trackIds.filter(Boolean))].slice(0, 100).join(",");

  if (!ids) {
    console.warn("⚠️ No valid track IDs provided to getAudioFeatures.");
    return [];
  }

  try {
    const res = await fetch(
      `https://api.spotify.com/v1/audio-features?ids=${ids}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.status === 401) {
      console.warn("⚠️ Token expired");
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const errorData = await res.json();
      console.error("❌ Failed to fetch audio features:", errorData);
      throw new Error(
        `Spotify API error: ${errorData.error?.message || "Unknown error"}`
      );
    }

    const data = await res.json();
    return data.audio_features || [];
  } catch (error) {
    console.error("❌ Error in getAudioFeatures:", error.message);
    if (error.message === "Unauthorized") throw error;
    return [];
  }
};
