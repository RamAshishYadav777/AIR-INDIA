import React, { useState, useEffect, useRef } from "react";
import {
  Fab,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Fade,
  IconButton,
  Tooltip,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import { supabase } from "../lib/supabase";

interface Message {
  role: "user" | "bot";
  text: string;
}

const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastMessageTime, setLastMessageTime] = useState(0);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "bot",
          text: "👋 Namaste! I’m your Air India Assistant. How can I help you today?",
        },
      ]);
    }
  }, [open]);





  // const generateResponse... (removed)

  const handleSend = async () => {
    if (!input.trim()) return;

    // ✅ Prevent spamming: 1.5 sec cooldown
    if (Date.now() - lastMessageTime < 1500) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⏳ Please wait a moment before sending another message." },
      ]);
      return;
    }
    setLastMessageTime(Date.now());

    const userMsg: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    // Play Send Sound
    if (soundEnabled) {
      const audio = new Audio("/mixkit-sci-fi-click-900.mp3");
      audio.play().catch((e) => console.log("Audio play failed", e));
    }

    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { message: userMsg.text },
      });

      if (error) throw error;

      const botMsg: Message = { role: "bot", text: data.reply };

      setMessages((prev) => [...prev, botMsg]);

      // Play Reply Sound
      if (soundEnabled) {
        const audio = new Audio("/mixkit-sci-fi-confirmation-914.mp3");
        audio.play().catch((e) => console.log("Audio play failed", e));
      }
    } catch (err) {
      console.error("AI Error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "❌ Sorry, I'm having trouble connecting right now." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Fab
        color="error"
        onClick={() => setOpen(!open)}
        sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1500 }}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </Fab>

      {/* Chat Window */}
      <Fade in={open}>
        <Paper
          elevation={6}
          sx={{
            position: "fixed",
            zIndex: 2000,
            bottom: 90,
            right: 24,
            width: 360,
            height: 480,
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: "error.main",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                src="https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/Air_India_Logo.svg/640px-Air_India_Logo.svg.png"
                alt="Air India"
                sx={{ width: 32, height: 32, bgcolor: "white" }}
              />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Air India Assistant
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                  Ask about flights, baggage, or booking ✈️
                </Typography>
              </Box>
            </Box>

            <Tooltip title={soundEnabled ? "Mute chat sounds" : "Unmute chat sounds"}>
              <IconButton color="inherit" onClick={() => setSoundEnabled(!soundEnabled)} size="small">
                {soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Messages */}
          <Box sx={{ flex: 1, p: 2, overflowY: "auto", bgcolor: "#fafafa" }}>
            {messages.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  mb: 1.5,
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <Box
                  sx={{
                    bgcolor: msg.role === "user" ? "error.main" : "white",
                    color: msg.role === "user" ? "white" : "black",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: "80%",
                    boxShadow:
                      msg.role === "user"
                        ? "0 2px 4px rgba(255,0,0,0.2)"
                        : "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <Typography variant="body2">{msg.text}</Typography>
                </Box>
              </Box>
            ))}

            {loading && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "gray", ml: 1 }}>
                <Avatar
                  src="https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/Air_India_Logo.svg/640px-Air_India_Logo.svg.png"
                  sx={{ width: 22, height: 22 }}
                />
                <Typography variant="body2">Typing...</Typography>
              </Box>
            )}
            <div ref={chatEndRef} />
          </Box>

          {/* Input */}
          <Box sx={{ display: "flex", borderTop: "1px solid #ddd", p: 1, bgcolor: "white" }}>
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <Button onClick={handleSend} variant="contained" color="error" sx={{ ml: 1 }} disabled={loading}>
              Send
            </Button>
          </Box>
        </Paper>
      </Fade>
    </>
  );
};

export default Chatbot;
