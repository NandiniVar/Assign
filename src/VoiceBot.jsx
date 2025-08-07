import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function VoiceBot() {
  const [response, setResponse] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);

  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

  const handleListen = async () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();
    setListening(true);

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      recognition.stop();
      setListening(false);
      await sendToGPT(transcript);
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setListening(false);
    };
  };

  const sendToGPT = async (input) => {
    setLoading(true);
    try {
      const baseAnswers = {
        "life story": "I’m Nandini Varshney, a Computer Science graduate who discovered her passion for tech while solving real-world problems during college. I’ve interned at companies like Groples and CSRBOX, where I built full-stack applications using React, Tailwind, and AWS. I’ve also mentored peers as a Microsoft Learn Student Ambassador and led workshops for 300+ students. I believe in learning by doing, and I’m now eager to build tools that add real value to people’s lives.",
        "superpower": "My superpower is adaptability. I thrive in fast-changing environments, quickly picking up new tools and frameworks. Whether it was deploying scalable APIs or leading workshops on cloud computing, I step up to challenges with confidence and curiosity.",
        "grow": "First, I want to deepen my skills in system design and architecture. Second, I’d love to get hands-on with advanced AI tools and LLM integration. Third, I want to grow as a leader — someone who can mentor, build strong teams, and drive projects from 0 to 1.",
        "misconception": "People sometimes think I’m quiet because I listen more than I speak — but I’m deeply thoughtful and collaborative. Once I understand a problem, I’m the one who brings clarity, structure, and creative solutions to the table.",
        "boundaries": "I say yes to challenges that scare me — like giving my first tech talk or building a chatbot solo. I believe in learning by doing, so I constantly take on projects, contribute to communities, and explore beyond my comfort zone."
      };

      const lowerInput = input.toLowerCase();
      for (const key in baseAnswers) {
        if (lowerInput.includes(key)) {
          const reply = baseAnswers[key];
          setResponse(reply);
          speak(reply);
          setLoading(false);
          return;
        }
      }

      const prompt = `You are Nandini Varshney. Answer the following personal question in a natural, confident tone as if you're speaking about your real self.\nQuestion: ${input}`;
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_OPENAI_API_KEY`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are a helpful assistant speaking as Nandini Varshney." },
            { role: "user", content: prompt },
          ],
        }),
      });
      const data = await res.json();
      const reply = data.choices[0].message.content;
      setResponse(reply);
      speak(reply);
    } catch (err) {
      setResponse("Something went wrong. Try again later.");
      console.error(err);
    }
    setLoading(false);
  };

  const speak = (text) => {
    if (synth) {
      const utterance = new SpeechSynthesisUtterance(text);
      synth.speak(utterance);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4 text-center">
      <h1 className="text-2xl font-bold">🎤 Ask Me Anything</h1>
      <p>Click the button below and ask a question about Nandini's life, values, or career.</p>
      <Button onClick={handleListen} disabled={listening || loading}>
        {listening ? "Listening..." : loading ? "Generating..." : "Start Speaking"}
      </Button>
      {response && (
        <div className="mt-4 p-4 bg-gray-100 rounded-xl text-left">
          <strong>Response:</strong>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
