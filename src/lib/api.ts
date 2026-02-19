/**
 * Lightweight API helper that attaches common security headers (CSRF, X-Requested-With,
 * Authorization from localStorage/cookies) and returns parsed JSON with a consistent
 * shape. Assumptions:
 * - Bearer token (if any) may be stored in localStorage under `authToken` or as a cookie
 *   named `authToken`.
 * - A CSRF token (if used) is available in a meta tag: <meta name="csrf-token" content="..." />
 * - Backend returns JSON for success and error cases.
 */

export type ApiOptions = {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    credentials?: RequestCredentials;
    timeoutMs?: number;
};

function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

function getCsrfToken(): string | null {
    if (typeof document === "undefined") return null;
    const el = document.querySelector('meta[name="csrf-token"]');
    return (el && el.getAttribute("content")) || null;
}

function getAuthToken(): string | null {
    try {
        if (typeof localStorage !== "undefined") {
            const t = localStorage.getItem("authToken");
            if (t) return t;
        }
    } catch (e) {
        // ignore localStorage access errors
    }
    return getCookie("authToken");
}

export async function apiRequest<T = any>(endpoint: string, options: ApiOptions = {}) {
    const { method = "GET", body, headers = {}, credentials = "same-origin", timeoutMs = 10_000 } = options;

    const securityHeaders: Record<string, string> = {
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...headers,
    };

    const csrf = getCsrfToken();
    if (csrf) securityHeaders["X-CSRF-Token"] = csrf;

    const token = getAuthToken();
    if (token) securityHeaders["Authorization"] = `Bearer ${token}`;

    if (body !== undefined && !(body instanceof FormData)) {
        securityHeaders["Content-Type"] = securityHeaders["Content-Type"] || "application/json";
    }

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(endpoint, {
            method,
            headers: securityHeaders,
            body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
            credentials,
            signal: controller.signal,
        });
        clearTimeout(id);

        const contentType = res.headers.get("content-type") || "";
        let data: any = null;
        if (contentType.includes("application/json")) {
            data = await res.json();
        } else {
            data = await res.text();
        }

        if (!res.ok) {
            return { ok: false, status: res.status, error: data } as const;
        }

        return { ok: true, status: res.status, data: data as T } as const;
    } catch (err: any) {
        clearTimeout(id);
        const isAbort = err && err.name === "AbortError";
        return { ok: false, status: isAbort ? 0 : -1, error: isAbort ? "timeout" : err } as const;
    }
}

export default apiRequest;
