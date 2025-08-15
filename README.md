# Persona LLM Chat (Next.js)

## Live Demo URLs

- [https://persona-genai.vercel.app/](https://persona-genai.vercel.app/)
- [https://personas-amank736836.vercel.app/](https://personas-amank736836.vercel.app/)
- [https://amank736836-personas.vercel.app/](https://amank736836-personas.vercel.app/)

A modern, interactive chat app built with Next.js, featuring dynamic AI personas (like Hitesh, Piyush, and custom personas), side-by-side persona comparison, and public profile enrichment. Designed for both users and testers to explore LLM-powered conversations with real and custom personalities.

---

## Features

- **Multiple Personas:**
  - "HiPi" (Hitesh & Piyush side-by-side, default)
  - Hitesh Choudhary (single)
  - Piyush Garg (single)
  - Custom persona (by name or @username, with public profile enrichment)
- **Dynamic Persona Creation:**
  - Enter any name or @username to create a new persona.
  - GitHub and other public profiles are used to enrich custom personas.
- **Chat Experience:**
  - Glassmorphic, animated, and responsive UI
  - Wide, accessible input field
  - Clickable/copyable links in chat, with a "Visit" button for direct links
  - Animated feedback and error handling
  - Scroll helpers for long chats
  - Prompt transparency: see the actual prompt sent to the LLM
  - Only working/authentic links are included for custom personas (checked live); all links from tone JSON are included for built-in personas
- **LLM Integration:**
  - Uses Groq (Llama-3) and Google Gemini (fallback)
  - Persona tone/style is loaded from JSON files in `/data` (built-in) or cookies (custom)
- **History & Storage:**
  - Chat history and custom persona data are stored in cookies (stateless, Vercel/serverless compatible)
  - No file writes on the backend; all storage is client-side
  - History is cleared on page reload or persona change

---

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

2. **Run the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

---

## Usage Guide

- **Select a Persona:**
  - Use the top selector to choose "HiPi" (both), Hitesh, Piyush, or create a custom persona.
  - "HiPi" mode shows Hitesh and Piyush responses side by side for every message.
- **Create a Custom Persona:**
  - Enter a name or @username (e.g., `@amank736836`) and click "Create Persona".
  - The app will try to fetch public profile data for enrichment.
- **Chat:**
  - Type your message and press Enter or click Send.
  - Links in responses are clickable and copyable, with a "Visit" button for direct links.
  - Use scroll buttons to navigate long chats.
- **Prompt Transparency:**
  - The actual prompt sent to the LLM is shown for debugging and learning.
- **Resetting:**
  - Changing persona resets the chat area.

---

## Project Structure (Key Files)

- `src/app/page.tsx` — Main chat UI and logic
- `src/app/components/PersonaSelector.tsx` — Persona selection UI
- `src/app/components/ChatArea.tsx` — Chat rendering (side-by-side, links, copy, visit button)
- `src/app/components/MessageInput.tsx` — Message input field
- `src/app/components/CustomPersonaInput.tsx` — Custom persona creation
- `src/app/components/PromptDisplay.tsx` — Shows the LLM prompt
- `src/app/api/chat/route.ts` — Chat API (handles persona logic, LLM calls, stateless, cookies for custom personas/history, link checking)
- `src/app/api/create-persona/route.ts` — Custom persona creation & enrichment (stateless, stores persona data in cookies)
- `src/app/api/fetch-image/route.ts` — Fetches persona images
- `src/lib/prompt.js` — Prompt construction logic
- `src/lib/llm.js` — LLM API integration
- `data/` — Persona tone/style JSON files (for built-in personas only)

---

## Testing

- Try chatting with "HiPi", Hitesh, Piyush, or a custom persona.
- Test @username enrichment by entering a GitHub handle.
- Check prompt transparency and link copy/visit features.
- Switch personas to see chat area reset.

---

## Requirements

- Node.js 18+
- Internet connection (for LLM API and public profile enrichment)
- Vercel or any serverless-compatible deployment (no file writes required)

---

## Customization

- Add new persona tone files in `/data` (see `hitesh-tone.json`, `piyush-tone.json` for format; only for built-in personas)
- Extend persona enrichment in `create-persona/route.ts` (custom personas use cookies)
- Adjust UI in component files under `src/app/components/`

---

## Deployment

This project is fully compatible with Vercel and other serverless platforms. No file writes are performed on the backend; all persistent data is stored in cookies on the client side.

---

## License

MIT
