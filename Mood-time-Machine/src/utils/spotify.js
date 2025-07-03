// src/utils/spotify.js
export const getAuthUrl = () => {
  return `${process.env.REACT_APP_BACKEND_URL}/login`;
};
