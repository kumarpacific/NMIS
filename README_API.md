# API helper and viewer

This workspace now contains a small API helper and a React component to fetch and display JSON responses.

Files added:

- `src/lib/api.ts` - apiRequest(endpoint, options) - attaches common security headers (X-Requested-With, X-CSRF-Token, Authorization from localStorage/cookie) and returns a consistent { ok, status, data, error } shape. Supports timeout.
- `src/app/components/ApiViewer.tsx` - a tiny React component you can render and pass `url` to. It fetches the URL using `apiRequest` and displays the JSON result or error, with a copy button.

How to use:

1. Import and render the component in your app, for example in `App.tsx`:

```tsx
import ApiViewer from "./components/ApiViewer";

function App(){
  return <ApiViewer url="/api/your-endpoint" />;
}
```

2. Ensure your auth token is in `localStorage.authToken` or a cookie named `authToken`, and if you use CSRF tokens they are set in a meta tag `<meta name="csrf-token" content="..." />`.

Notes:
- The helper uses fetch and aborts after the provided timeout (default 10s).
- If your app uses a different auth token location, adapt `getAuthToken()` in `src/lib/api.ts`.
