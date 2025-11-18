## Problem 2 – Swap Desk (Vite) ##
The UI for problem 2 lives inside `src/problem2/` as a standalone Vite project.

### Prerequisites
- Node.js 18+

### Install & Run
```bash
cd src/problem2
npm install --cache .npm-cache
npm run dev                      # starts Vite on http://localhost:5173
```

### Production Build
```bash
npm run build
npm run preview                  # serves the dist bundle
```

The app fetches token prices from `https://interview.switcheo.com/prices.json`, displays token icons from the Switcheo repo, validates inputs, and remains responsive down to 320px.
