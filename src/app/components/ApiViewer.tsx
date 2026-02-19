import React, { useState } from "react";
import apiRequest from "../../lib/api";

export default function ApiViewer({ url }: { url: string }) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    async function callApi() {
        setLoading(true);
        setError(null);
        setResult(null);
        const res = await apiRequest(url, { timeoutMs: 15000 });
        setLoading(false);
        if (res.ok) {
            setResult(res.data);
        } else {
            setError(typeof res.error === "string" ? res.error : JSON.stringify(res.error));
        }
    }

    return (
        <div className="p-4 border rounded bg-white">
            <div className="flex gap-2 items-center mb-3">
                <input className="flex-1 border px-2 py-1" value={url} readOnly />
                <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={callApi} disabled={loading}>
                    {loading ? "Loading..." : "Fetch"}
                </button>
            </div>

            {error && <pre className="text-red-600">Error: {error}</pre>}

            {result && (
                <div>
                    <div className="mb-2 flex gap-2">
                        <button
                            className="px-2 py-1 border rounded"
                            onClick={() => navigator.clipboard?.writeText(JSON.stringify(result, null, 2))}
                        >
                            Copy JSON
                        </button>
                    </div>
                    <pre className="whitespace-pre-wrap overflow-auto max-h-60">{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
