'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import html2canvas from 'html2canvas';

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  async function fetchHistory() {
    const res = await fetch('/api/history');
    const data = await res.json();
    setHistory(data);
    setLoading(false);
  }

  async function handleDelete(id) {
    const confirm = window.confirm('Are you sure you want to delete this record?');
    if (!confirm) return;

    const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } else {
      alert('Failed to delete');
    }
  }

  async function handleShare(id) {
    const targetElement = document.getElementById(`card-${id}`);
    if (!targetElement) {
      console.error('Target element not found for sharing');
      return;
    }
    try {
      targetElement.classList.add('force-compatible-colors');
      const canvas = await html2canvas(targetElement, {
        useCORS: true,
        backgroundColor: '#ffffff', // ensure a white background for Instagram
      });

      // ✅ Clean up fallback styling
      targetElement.classList.remove('force-compatible-colors');      
      
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'body-shape-result.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Body Shape Result',
          text: 'Check out my result!',
          files: [file],
        });
      } else {
        alert('Sharing not supported on this browser');
      }
    } catch (err) {
      console.error('Share failed:', err);
      alert('Failed to share. Try manually taking a screenshot.');
    }
  }

  useEffect(() => {
    fetchHistory();
  }, []);
  
  if (loading) return <p className="text-center mt-10">Loading...</p>;

  if (!session) {
    return (
      <div className="text-center mt-10">
        <p>You must be logged in to view your history.</p>
        <Link href="/" className="text-blue-600 underline">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 bg-white shadow rounded">
      <h1 className="text-xl font-semibold mb-4 text-center">Your Calculation History</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {history.length === 0 ? (
        <p className="text-gray-600 text-center">No history found.</p>
      ) : (
        <ul className="space-y-4">
        {history.map((item) => (
          <li
            key={item.id}
            className="p-4 bg-white rounded shadow flex justify-between items-start relative"
            id={`card-${item.id}`}
          >
            <div>
              <p><strong>Result:</strong> {item.result}</p>
              <p><strong>Bust:</strong> {item.bust} cm</p>
              <p><strong>Waist:</strong> {item.waist} cm</p>
              <p><strong>Hips:</strong> {item.hips} cm</p>
              <p><strong>Shoulders:</strong> {item.shoulders} cm</p>
              <p className="text-xs text-gray-500">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-col gap-1 ml-4">
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-600 hover:underline text-sm"
              >
                Delete
              </button>

              <button
                onClick={() => handleShare(item.id)}
                className="text-blue-600 hover:underline text-sm"
              >
                Share
              </button>
            </div>
          </li>
        ))}
        </ul>
      )}

      <div className="text-center mt-6">
        <Link href="/" className="text-blue-600 underline">← Back to Calculator</Link>
      </div>
    </div>
  );
}
