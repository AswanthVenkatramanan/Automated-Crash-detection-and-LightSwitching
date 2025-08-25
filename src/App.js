// src/App.js
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css"; // ✅ import your CSS

function App() {
  const [status, setStatus] = useState({
    crash: false,
    gsm: null,
    email: null,
    location: null,
  });

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("arduino:data", (data) => {
      console.log("Frontend received:", data);

      if (data.type === "crash") {
        setStatus((prev) => ({
          ...prev,
          crash: true,
          location: data.location,
        }));
      } else if (data.type === "gsm") {
        setStatus((prev) => ({ ...prev, gsm: data.status }));
      } else if (data.type === "email") {
        setStatus((prev) => ({ ...prev, email: data.status }));
      }
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div
      className={`app-container ${status.crash ? "bg-red" : "bg-green"}`}
      style={{
        color: "white",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        transition: "background 3s ease-in-out", // smooth transition
      }}
    >
      <h1>🚨 Crash Detection System</h1>

      {!status.crash ? (
        <p style={{ fontSize: "20px" }}>✅ System running... No crash detected.</p>
      ) : (
        <>
          <p style={{ fontSize: "22px", color: "yellow" }}>⚠ Crash Detected!</p>

          {status.location && (
            <p>
              📍 Location:{" "}
              <a
                href={status.location}
                target="_blank"
                rel="noreferrer"
                style={{ color: "cyan" }}
              >
                View on Maps
              </a>
            </p>
          )}

          {status.gsm && (
            <p>
              📲 GSM SMS:{" "}
              <span style={{ color: status.gsm === "sent" ? "lime" : "red" }}>
                {status.gsm === "sent" ? "Sent ✅" : "Failed ❌"}
              </span>
            </p>
          )}

          {status.email && (
            <p>
              📩 Backup Email:{" "}
              <span style={{ color: status.email === "sent" ? "lime" : "red" }}>
                {status.email === "sent" ? "Sent ✅" : "Failed ❌"}
              </span>
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default App;
