/**
 * Generate a mood reflection using your backend (secure).
 */
export const generateMoodReflection = async (tracks) => {
  try {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/generate-reflection`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ tracks })
    });

    const data = await res.json();
    return data.message || "No reflection generated.";
  } catch (err) {
    if (err.status === 429) {
      console.warn("⏳ OpenAI rate limit hit.");
      return "OpenAI quota exceeded. Please try again after some time.";
    }
    console.error("❌ Error in generateMoodReflection:", err);
    return "Failed to generate mood reflection.";
  }
};
