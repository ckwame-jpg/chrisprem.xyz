'use client';
import { useState, useRef } from 'react';
import { apiConfigs } from '@/lib/v1/playground-config';

const methodColors: Record<string, string> = {
  GET: 'text-green-400',
  POST: 'text-blue-400',
  PUT: 'text-yellow-400',
  DELETE: 'text-red-400',
};

export default function APIPlayground() {
  const [selectedApi, setSelectedApi] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [response, setResponse] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const tokenRef = useRef<string | null>(null);

  const api = apiConfigs[selectedApi];
  const mode = api.baseUrl ? 'live' : 'mock';
  const selected = api.endpoints[selectedIndex];

  const switchApi = (index: number) => {
    setSelectedApi(index);
    setSelectedIndex(0);
    setResponse(null);
    setStatusCode(null);
    setResponseTime(null);
    tokenRef.current = null;
  };

  const authenticate = async (): Promise<string | null> => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', api.demoCredentials.email);
      formData.append('password', api.demoCredentials.password);

      const res = await fetch(`${api.baseUrl}${api.loginPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });
      if (!res.ok) return null;
      const data = await res.json();
      tokenRef.current = data.access_token;
      return data.access_token;
    } catch {
      return null;
    }
  };

  const handleMockRun = () => {
    const delay = 80 + Math.random() * 120;
    setTimeout(() => {
      setResponse(JSON.stringify(selected.mockResponse.body, null, 2));
      setStatusCode(selected.mockResponse.status);
      setResponseTime(Math.round(delay));
      setLoading(false);
    }, delay);
  };

  const handleLiveRun = async () => {
    let token = tokenRef.current;
    if (!token && selected.requiresAuth) {
      token = await authenticate();
      if (!token) {
        handleMockRun();
        return;
      }
    }

    const start = performance.now();

    try {
      const headers: Record<string, string> = {};
      if (token && selected.requiresAuth) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let body: string | undefined;
      if (selected.path === api.loginPath && selected.requestBody) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        const formData = new URLSearchParams();
        const reqBody = selected.requestBody as Record<string, string>;
        Object.entries(reqBody).forEach(([k, v]) => formData.append(k, v));
        body = formData.toString();
      } else if (selected.requestBody) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(selected.requestBody);
      }

      const res = await fetch(`${api.baseUrl}${selected.path}`, {
        method: selected.method,
        headers,
        body,
      });

      const data = await res.json();

      if (selected.path === api.loginPath && res.ok && data.access_token) {
        tokenRef.current = data.access_token;
      }

      setResponse(JSON.stringify(data, null, 2));
      setStatusCode(res.status);
      setResponseTime(Math.round(performance.now() - start));
      setLoading(false);
    } catch {
      handleMockRun();
    }
  };

  const handleRun = () => {
    setLoading(true);
    setResponse(null);

    if (mode === 'mock' || !api.baseUrl) {
      handleMockRun();
    } else {
      handleLiveRun();
    }
  };

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--card-bg)] backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border-subtle)]">
        <div className="w-3 h-3 rounded-full bg-red-500/60" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
        <div className="w-3 h-3 rounded-full bg-green-500/60" />
        <div className="ml-2 flex items-center gap-1">
          {apiConfigs.map((cfg, i) => (
            <button
              key={cfg.slug}
              type="button"
              onClick={() => switchApi(i)}
              className={`px-2 py-0.5 text-xs font-mono rounded transition ${
                i === selectedApi
                  ? 'bg-[var(--border-subtle)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {cfg.name}
            </button>
          ))}
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-xs font-mono">
          <span className={`w-1.5 h-1.5 rounded-full ${mode === 'live' ? 'bg-green-400' : 'bg-yellow-400'}`} />
          <span className="text-[var(--text-faint)]">{mode === 'live' ? 'live' : 'mock'}</span>
        </span>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)]">
        <span className={`text-xs font-mono font-bold ${methodColors[selected.method] ?? 'text-green-400'}`}>{selected.method}</span>
        <select
          aria-label="Select endpoint"
          value={selectedIndex}
          onChange={(e) => {
            setSelectedIndex(Number(e.target.value));
            setResponse(null);
            setStatusCode(null);
            setResponseTime(null);
          }}
          className="flex-1 min-w-0 bg-transparent text-[var(--text-primary)] text-sm font-mono border border-[var(--border-subtle)] rounded px-2 py-1 outline-none focus:border-[var(--border-hover)] transition"
        >
          {api.endpoints.map((ep, i) => (
            <option key={i} value={i} className="bg-[var(--bg-primary)]">
              {ep.path} - {ep.description}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleRun}
          disabled={loading}
          className="px-4 py-1.5 text-sm font-mono rounded border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--card-bg)] transition disabled:opacity-50"
        >
          {loading ? 'Running...' : 'Run'}
        </button>
      </div>

      {/* Request Body */}
      {selected.requestBody != null && (
        <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--text-muted)] font-mono mb-1">Request Body</p>
          <pre className="text-sm font-mono text-[var(--text-secondary)] whitespace-pre-wrap break-words">
            {JSON.stringify(selected.requestBody, null, 2)}
          </pre>
        </div>
      )}

      {/* Response */}
      <div className="px-4 py-3 font-mono text-sm min-h-[120px] max-h-[300px] overflow-auto">
        {!response && !loading && (
          <p className="text-[var(--text-muted)]">Select an endpoint and click Run to see the response.</p>
        )}
        {loading && (
          <p className="text-[var(--text-muted)] animate-pulse">
            {mode === 'live' ? 'Hitting live server...' : 'Sending request...'}
          </p>
        )}
        {response && (
          <>
            <div className="flex items-center gap-3 mb-2 text-xs">
              <span className={`font-bold ${statusCode && statusCode < 300 ? 'text-green-400' : 'text-red-400'}`}>
                {statusCode}
              </span>
              <span className="text-[var(--text-muted)]">{responseTime}ms</span>
            </div>
            <pre className="text-[var(--text-secondary)] whitespace-pre-wrap break-words">{response}</pre>
          </>
        )}
      </div>
    </div>
  );
}
