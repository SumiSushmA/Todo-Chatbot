# 📋🤖 AI-Powered Conversational Task Management System for Optimizing Productivity

This project is part of a **thesis assignment** focusing on developing a productivity optimization tool that integrates an **AI-powered conversational interface** with an **interactive task management system**.  
The system aims to enhance individual productivity by enabling **natural language interactions**, **intelligent task querying**, and **real-time analytics**.

---

## 🎯 Project Overview

The **AI-Powered Conversational Task Management System** combines:
1. **Conversational AI (Google Gemini)** for contextual task-related queries.
2. **Task Management Dashboard** for organizing, tracking, and analyzing productivity.
3. **Visual Analytics** to monitor progress and optimize workflow.

The AI assistant can:
- Answer queries about stored tasks.
- Suggest actions or provide summaries.
- Retrieve relevant task clusters using embeddings.

The task manager allows:
- Adding, editing, and deleting tasks with multiple attributes.
- Persisting tasks locally to maintain data after reloads.
- Viewing progress in charts and calendar format.

---

## 🛠️ Features

### **1. AI-Powered Conversational Chatbot**
- Uses **Google Gemini API** for natural language processing.
- Embeds clustered task datasets for context-based answers.
- Retrieves **top-3 relevant task clusters** per query.
- Supports both **text and voice** input (speech-to-text & text-to-speech).

### **2. Task Manager**
- Create tasks with:
  - Title & description
  - Due date/time
  - Priority level (High / Medium / Low)
  - Status (Not Started / In Progress / Completed)
  - Optional image upload
- Search and filter tasks.
- Mark tasks as complete.
- Local persistence via **`localStorage`**.

### **3. Analytics & Calendar**
- Donut charts displaying task distribution by status.
- Monthly calendar view for deadline visualization.
- Completed tasks panel with thumbnails and completion dates.

---

## 🛠️ Technology Stack

| Component          | Technology |
|--------------------|------------|
| Frontend           | Next.js 14, React, Tailwind CSS |
| Conversational AI  | Google Gemini REST API |
| Charts             | Inline SVG donut graphs |
| Calendar           | `react-calendar` |
| State Management   | React Hooks + LocalStorage |
| Voice Features     | Web Speech API (SpeechRecognition & SpeechSynthesis) |

---

## 📂 Project Structure

```

/components       → Reusable UI components (Chatbot, Task Manager, Charts, Voice Control)
/pages            → Next.js pages
/lib              → API utilities & Gemini integration
/public           → Static assets (images, icons)
/styles           → Tailwind CSS styling

````

---

## 🔧 Setup & Installation

### 1️⃣ Clone & Install
```bash
git clone https://github.com/SumiSushmA/Todo-Chatbot.git
cd Todo-Chatbot
npm install
````

### 2️⃣ Configure Environment

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=YOUR_GOOGLE_GEN_API_KEY
```

### 3️⃣ Run the Application

```bash
npm run dev
```

Access the app at: **[http://localhost:3000](http://localhost:3000)**

---

## 💡 How to Use

1. **Chatbot Interface**

   * Navigate to the chatbot page.
   * Type or speak your question about tasks.
   * Receive AI-generated contextual answers.
   * Voice responses are enabled for bot replies.

2. **Task Management**

   * Add new tasks with full details.
   * Update or delete tasks anytime.
   * Mark tasks complete when done.
   * View analytics and upcoming deadlines.

3. **Analytics & Calendar**

   * Track progress visually via donut charts.
   * Use the calendar to see due dates.
   * Review completed tasks with images.

---

## 📊 Research Objective

The primary objective is to **optimize productivity** by merging **AI conversational capabilities** with structured task management.
By enabling natural language interaction and integrating real-time analytics, the system:

* Improves task retrieval and organization efficiency.
* Provides quick contextual insights.
* Encourages consistent task completion.

---

## 🏗️ Future Enhancements

* Cloud database integration for multi-device sync.
* Advanced NLP for task intent detection.
* Integration with third-party productivity tools (Google Calendar, Trello, etc.).
* Push notifications for deadlines.

---


