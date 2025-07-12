# 📋✨ To-Do Chatbot & Task Manager

A **Next.js + React** application combining:

1. 🤖 **Gemini-powered Chatbot**  
   • Upload a small clustered dataset of “cluster tasks”  
   • Embed them via Google Gemini Embeddings  
   • Serve a conversational Q&A over your tasks  

2. ✅ **Interactive To-Do List**  
   • Create, search, complete, and delete tasks  
   • Each task has a **title**, **notes**, **due date/time**, **priority**, **status**, and optional **image**  
   • Persistent in **localStorage** so tasks survive page reloads  
   • Built-in analytics: three “donut” charts for Not Started / In Progress / Completed percentages  
   • Embedded 📅 **react-calendar** to visualize dates  
   • Separate “Completed Tasks” panel with thumbnails  

---

## 🚀 Features

- **💬 Chatbot**  
  • Uses Gemini Embeddings to find top-3 relevant “cluster tasks”  
  • Calls Gemini Chat to answer user queries in context  

- **📝 To-Do Manager**  
  • ➕ Add tasks with:  
    – Title, notes, due date/time, priority (High/Medium/Low), status (Not Started/In Progress/Completed), image upload  
  • 🔍 Search/filter tasks  
  • ✔️ Mark tasks complete (with confirmation)  
  • 🗑️ Delete tasks  
  • 💾 Persist tasks in browser `localStorage`  

- **📊 Analytics & 📆 Calendar**  
  • Donut charts showing % of tasks in each status  
  • Monthly calendar view  
  • “Completed Tasks” list with completion date & image  

---

## 🛠️ Tech Stack

- **🖥️ Frontend & SSR**: Next.js 14  
- **🤖 Chat & Embeddings**: Google Gemini REST API  
- **⚛️ State & Storage**: React Hooks + `localStorage`  
- **🎨 UI**: Tailwind CSS, `react-calendar`, `react-feather` icons  
- **📈 Charts**: Inline SVG “donut” graphs  

---

## 🔧 Getting Started

1. **Clone & Install**  
   ```bash
   git clone (https://github.com/SumiSushmA/Todo-Chatbot.git)
   cd Todo-Chatbot
   npm install

2. **Environment**


Create a .env.local in project root with your Gemini API key:

GEMINI_API_KEY=YOUR_GOOGLE_GEN_API_KEY


3. **Run in Dev**
  ```bash
npm run dev

