// src/pages/LoadingScreen.tsx
import React from "react";
import Lottie from "lottie-react";
 import animation from "../../assets/lottie/loading.json";

const LoadingScreen: React.FC = () => {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-100"
      style={{
        textAlign: "center",
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Lottie
        animationData={animation}
        loop
        style={{ width: 220, height: 220 }}
      />
      <h2 className="text-xl font-semibold text-gray-700 mt-4">
        Preparing your flight experience...
      </h2>
      <p className="text-sm text-gray-500 mt-1">
        Please wait while we load your destination ✈️
      </p>
    </div>
  );
};

export default LoadingScreen;
