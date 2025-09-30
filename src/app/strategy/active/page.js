// src/app/strategy/active/page.js
"use client";
import useSWR from "swr";
const fetcher = (u) => fetch(u).then(r => r.json());

export default function ActiveRunsPage() {
  const { data, error } = useSWR("/api/strategy/live/status", fetcher, { refreshInterval: 5000 });

  if (error) return <div>Error loading runs</div>;
  const runs = data?.runs || [];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Active & Historical Live Runs</h1>
      {runs.length === 0 ? <div>No runs</div> : (
        <div className="space-y-4">
          {runs.map(r => (
            <div key={r._id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-semibold">{r.symbol} — {r.interval}</div>
                  <div className="text-sm text-gray-600">Status: {r.status} • Allocated: ${r.allocatedCapital} • Remaining: ${r.remainingCapital?.toFixed?.(2)}</div>
                </div>
                <div className="text-sm text-gray-500">Started: {new Date(r.createdAt).toLocaleString()}</div>
              </div>
              <div className="mt-2">
                <div><strong>Positions:</strong></div>
                <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(r.positions || {}, null, 2)}</pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
