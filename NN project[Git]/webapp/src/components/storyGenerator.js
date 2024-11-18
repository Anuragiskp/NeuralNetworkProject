import React, { useState } from "react";

const StoryGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [wordCount, setWordCount] = useState(50);
  const [generatedStory, setGeneratedStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setGeneratedStory("");

    // Validate input
    if (!prompt) {
      setError("Prompt cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      // Send POST request to Flask backend
      const response = await fetch("http://127.0.0.1:5000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          max_length: wordCount,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setGeneratedStory(data.generated_text);
      } else {
        setError(data.error || "An error occurred.");
      }
    } catch (err) {
      setError("Failed to connect to the backend. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>Story Generator</h1>
      <div>
        <label htmlFor="prompt">Enter Prompt:</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows="4"
          style={{ width: "100%", marginBottom: "10px" }}
        />
      </div>
      <div>
        <label htmlFor="wordCount">Word Count(default: 200):</label>
        <input
          id="wordCount"
          type="number"
          value={wordCount}
          onChange={(e) => setWordCount(Number(e.target.value))}
          style={{ width: "100%", marginBottom: "10px" }}
          min="1"
        />
      </div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Story"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {generatedStory && (
        <div style={{ marginTop: "20px" }}>
          <h2>Generated Story:</h2>
          <p>{generatedStory}</p>
        </div>
      )}
    </div>
  );
};

export default StoryGenerator;
