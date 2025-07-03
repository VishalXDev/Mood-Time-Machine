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

    if (!res.ok) {
      const errorData = await res.json();
      console.error("❌ Failed to fetch recent tracks:", errorData);
      return [];
    }

    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error("❌ Error in getRecentTracks:", error);
    return [];
  }
};

export const getAudioFeatures = async (token, trackIds = []) => {
  const ids = trackIds.join(',');

  if (!ids || trackIds.length === 0) {
    console.warn("⚠️ No track IDs provided to getAudioFeatures.");
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

    if (!res.ok) {
      const errorData = await res.json();
      console.error("❌ Failed to fetch audio features:", errorData);
      return [];
    }

    const data = await res.json();
    return data.audio_features || [];
  } catch (error) {
    console.error("❌ Error in getAudioFeatures:", error);
    return [];
  }
};
