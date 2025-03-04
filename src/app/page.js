"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Wait until the component is mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render nothing until the component is mounted to avoid SSR mismatches.
    return null;
  }

  // Convert file to base64 string (without data URL prefix)
  const loadImageBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove data URL prefix
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    try {
      const base64Image = await loadImageBase64(file);
      const response = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error during detection:", error);
      setResult({ error: "Detection failed" });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <div className="mt-8 text-center">
        <h2 className="text-4xl mb-4">A Special Salute to General Fady! 🫡</h2>
        <br />
        {/* Animated GIF container */}
        <div className="inline-block animate-bounce">
          <img
            src="/salute.gif" // Place your GIF in public folder
            alt="Military salute animation"
            className="w-48 h-48 rounded-lg shadow-lg"
          />
        </div>

        {/* Animated text */}
        <p className="mt-4 text-lg font-semibold animate-pulse text-blue-600">
          "Honor and Loyalty!"
        </p>
      </div>
      <h1>Fresh vs Rotten Vegetable Detection and</h1>
      <form onSubmit={handleSubmit}>
        <input
          class="cursor-pointer	"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        <button
          class="cursor-pointer	"
          type="submit"
          style={{ marginLeft: "1rem" }}
        >
          {loading ? "Detecting..." : "Detect"}
        </button>
      </form>
      {result && (
        <div style={{ marginTop: "2rem", color: "black" }}>
          <h2>Detection Result:</h2>
          <pre style={{ background: "#f4f4f4", padding: "1rem" }}>
            {result?.predictions?.map((item, index) => {
              const [condition, vegetable] = item.class.split("_");
              return (
                <div key={index} className="mb-2 p-2 border rounded">
                  <span className="font-semibold">Vegetable type: </span>
                  {vegetable.toLowerCase()}
                  <br />
                  <span className="font-semibold">Condition: </span>
                  <span
                    className={`${
                      condition.toLowerCase() === "rotten"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {condition.toLowerCase()}
                  </span>
                </div>
              );
            })}
          </pre>
        </div>
      )}
    </div>
  );
}
