// ✅ spotify.js

/**
 * Construct backend login URL for Spotify OAuth.
 */
export const getAuthUrl = () => {
  return `${process.env.REACT_APP_BACKEND_URL}/login`;
};

