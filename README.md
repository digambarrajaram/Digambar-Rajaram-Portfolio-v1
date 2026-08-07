# Digambar Rajaram Portfolio

A polished, high-performance portfolio website for Digambar Rajaram, built with React, TypeScript, Vite, Tailwind CSS, and a lightweight Express server. The site presents a modern SRE/DevOps-inspired experience with animated sections, interactive storytelling, and an AI-powered assistant powered by Groq.

## Overview

This portfolio is designed to showcase:

- a strong professional profile in AI platforms, cloud infrastructure, and systems engineering
- key projects, achievements, and technical depth
- a visually immersive interface with motion-driven interactions
- an intelligent chat experience for visitors to explore the profile quickly

## What You’ll Find Here

- Professional background and experience highlights
- A curated skills matrix and technology stack
- Project showcases with practical engineering context
- Interactive console-style demos and incident simulation visuals
- Contact details and social links
- A conversational AI assistant experience backed by Groq

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Motion for animation
- Express.js for API and chat routes
- Groq SDK for AI chat capabilities

## Prerequisites

- Node.js 18+
- npm

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/digambarrajaram/Digambar-Rajaram-Portfolio-v1.git
cd Digambar-Rajaram-Portfolio-v1
npm install
```

## Environment Setup

Create a `.env.local` file in the project root and add your Groq API key:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

You may also optionally configure:

```bash
PORT=3000
ALLOWED_ORIGIN=https://your-domain.com
```

## Running Locally

Start the development server:

```bash
npm run dev
```

Then open the local URL shown in the terminal.

## Available Scripts

- `npm run dev` — start the app in development mode
- `npm run build` — build the production bundle
- `npm run start` — run the production build
- `npm run lint` — run TypeScript checks

## Project Structure

- `src/` — application UI, components, styles, and content
- `src/server/` — AI chat agent logic
- `server.ts` — Express server entry point
- `api/` — API route handlers
- `assets/` — static assets and media

## Deployment

This project is suitable for deployment on modern hosting platforms such as Vercel, Render, Railway, or any Node.js-compatible environment.

## License

This project is for personal portfolio use and is not intended for redistribution without permission.

