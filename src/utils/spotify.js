export const authEndpoint = "https://accounts.spotify.com/authorize";

const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const redirectUri = process.env.REACT_APP_REDIRECT_URI;
const scopes = process.env.REACT_APP_SCOPES;

export const getAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "token",
    redirect_uri: redirectUri,
    scope: scopes,
  });
  return `${authEndpoint}?${params.toString()}`;
};
