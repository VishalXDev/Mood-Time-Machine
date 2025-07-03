export const getRecentTracks = async (token, limit = 20) => {
  const res = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return data.items || [];
};

export const getAudioFeatures = async (token, trackIds = []) => {
  const ids = trackIds.join(',');
  const res = await fetch(`https://api.spotify.com/v1/audio-features?ids=${ids}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return data.audio_features || [];
};
