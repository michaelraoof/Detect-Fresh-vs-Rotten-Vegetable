"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const imageRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState({
    naturalWidth: 0,
    naturalHeight: 0,
    displayedWidth: 0,
    displayedHeight: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadImageBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
    });
  };

  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageDimensions({
        naturalWidth: imageRef.current.naturalWidth,
        naturalHeight: imageRef.current.naturalHeight,
        displayedWidth: imageRef.current.offsetWidth,
        displayedHeight: imageRef.current.offsetHeight,
      });
    }
  };

  const getScaledBoxDimensions = (prediction) => {
    const scaleX =
      imageDimensions.displayedWidth / imageDimensions.naturalWidth;
    const scaleY =
      imageDimensions.displayedHeight / imageDimensions.naturalHeight;

    return {
      x: (prediction.x - prediction.width / 2) * scaleX,
      y: (prediction.y - prediction.height / 2) * scaleY,
      width: prediction.width * scaleX,
      height: prediction.height * scaleY,
    };
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null); // Reset previous results
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

  if (!mounted) {
    return null;
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      {/* Salute Section */}
      <SaluteSection />

      {/* Detection Interface */}
      <h1 className="text-2xl mt-8">Fresh vs Rotten Vegetable Detection</h1>
      <form onSubmit={handleSubmit} className="mt-4">
        <input
          className="cursor-pointer"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        <button
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          type="submit"
          disabled={loading}
        >
          {loading ? "Detecting..." : "Detect"}
        </button>
      </form>

      {/* Image with Detection Overlay */}
      {file && (
        <div className="relative mt-8 max-w-4xl mx-auto">
          <img
            ref={imageRef}
            src={URL.createObjectURL(file)}
            alt="Detection preview"
            className="w-full h-auto rounded-lg shadow-xl"
            onLoad={handleImageLoad}
          />

          {result?.predictions?.map((prediction, index) => {
            const { x, y, width, height } = getScaledBoxDimensions(prediction);
            const [status, vegetable] = prediction.class.split("_");
            const isRotten = status.toLowerCase() === "rotten";

            return (
              <div
                key={index}
                className="absolute border-2 pointer-events-none"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${width}px`,
                  height: `${height}px`,
                  borderColor: isRotten ? "#dc2626" : "#16a34a",
                  backgroundColor: `${isRotten ? "#dc2626" : "#16a34a"}20`,
                  zIndex: 10,
                }}
              >
                <div
                  className="absolute bottom-full left-0 text-xs px-2 py-1 text-white font-medium"
                  style={{
                    backgroundColor: isRotten ? "#dc2626" : "#16a34a",
                    minWidth: "120px",
                  }}
                >
                  <span className="capitalize">{vegetable.toLowerCase()}</span>
                  <span className="mx-2">•</span>
                  <span className="uppercase">{status.toLowerCase()}</span>
                  <span className="ml-2 opacity-75">
                    ({Math.round(prediction.confidence * 100)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Text Results */}
      {result && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-500 ">
            Detection Summary:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result?.predictions?.map((item, index) => {
              const [status, vegetable] = item.class.split("_");
              return (
                <div key={index} className="p-4 rounded-lg bg-white shadow-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        status.toLowerCase() === "rotten"
                          ? "bg-red-600"
                          : "bg-green-600"
                      }`}
                    ></div>
                    <span className=" text-gray-500 font-medium capitalize">
                      {vegetable.toLowerCase()}
                    </span>
                    <span className="text-gray-500 text-sm">
                      ({Math.round(item.confidence * 100)}% confidence)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
function SaluteSection() {
  const [showCool, setShowCool] = useState(false);

  const handleClick = () => {
    setShowCool((prev) => !prev);
  };

  return (
    <div className="mt-8 text-center cursor-pointer" onClick={handleClick}>
      {!showCool ? (
        <>
          <h2 className="text-4xl mb-4">A Special Salute to General Fady! 🫡</h2>
          <br/><br/>
          <div className="inline-block animate-bounce">
            <img
              src="/salute.gif"
              alt="Military salute animation"
              className="w-48 h-48 rounded-lg shadow-lg"
            />
          </div>
          <p className="mt-4 text-lg font-semibold animate-pulse text-blue-600">
            "Honor and Loyalty!"
          </p>
        </>
      ) : (
        <>
          <h2 className="text-4xl mb-4">Stand Down, Soldier! 🎖️</h2>
          <div className="inline-block animate-spin">
            <img
            key="555"
              src="/coolMilitary.gif"
              alt="Cool military action"
              className="w-56 h-56 rounded-lg shadow-lg"
            />
          </div>
          <p className="mt-4 text-lg font-bold text-green-600">
          General Fady, Hooah! Your command ignites Operation Ironclad—lead with honor!
          </p>
        </>
      )}
    </div>
  );
}