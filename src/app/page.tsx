// src/app/page.tsx
"use client";

import Chatbot from "./components/Chatbot";
import Header from "./components/Header";
import { TodoList } from "./components/TodoList";
import TypingHeading from "./components/TypingHeading";

export default function Home() {
  return (
    <>
      <Header />
      <hr />
      <TypingHeading />
      <main className="p-4 max-w-3xl mx-auto">
        <TodoList />
      </main>

      {/* ← your Gemini-powered chatbot */}
      <Chatbot />
    </>
  );
}
