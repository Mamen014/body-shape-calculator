'use client'

import { useState } from 'react'
import { signIn, signOut, useSession } from "next-auth/react";
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession();

  // Just after your useSession() hook
  const authSection = (
    <div className="flex justify-between items-center mb-4">
      {session ? (
        <>
          <p className="text-sm text-gray-600">Signed in as {session.user.email}</p>
          <button onClick={() => signOut()} className="text-blue-600 underline">
            Sign out
          </button>
        </>
      ) : (
        <button onClick={() => signIn("google")} className="text-blue-600 underline">
          Sign in with Google
        </button>
      )}
    </div>
  );

  const [bust, setBust] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [shoulders, setShoulders] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({
    bust: '',
    waist: '',
    hips: '',
    shoulders: '',
  });

  if (status === "loading") return <p>Loading...</p>;

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-lg shadow max-w-md w-full text-center">
          <p className="mb-4 text-gray-700">You must be signed in to use the Body Shape Calculator.</p>
          <button
            onClick={() => signIn('google')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  async function calculateShape() {
    setError('');
    setErrors('');

    const newErrors = {
      bust: '',
      waist: '',
      hips: '',
      shoulders: '',
    };

    const bustNum = Number(bust);
    const waistNum = Number(waist);
    const hipsNum = Number(hips);
    const shouldersNum = Number(shoulders);

    if (!bustNum || bustNum <= 0) {
      newErrors.bust = 'Bust must be a positive number';
    }
    if (!waistNum || waistNum <= 0) {
      newErrors.waist = 'Waist must be a positive number';
    }
    if (!hipsNum || hipsNum <= 0) {
      newErrors.hips = 'Hips must be a positive number';
    }
    if (!shouldersNum || shouldersNum <= 0) {
      newErrors.shoulders = 'Shoulders must be a positive number';
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((err) => err !== '');
    if (hasErrors) {
      setResult('');
      return;
    }

    if (
      !bustNum || !waistNum || !hipsNum || !shouldersNum ||
      bustNum <= 0 || waistNum <= 0 || hipsNum <= 0 || shouldersNum <= 0
    ) {
      setResult('');
      setError('Please enter valid measurements for all fields.');
      return;
    }

    // Determine result
    let shape = '';

    if (
      Math.abs(bustNum - hipsNum) <= bustNum * 0.05 &&
      waistNum < bustNum * 0.75
    ) {
      shape = 'Hourglass';
    } else if (hipsNum > bustNum && hipsNum > shouldersNum) {
      shape = 'Pear';
    } else if (shouldersNum > hipsNum && shouldersNum > bustNum) {
      shape = 'Inverted Triangle';
    } else if (
      Math.abs(bustNum - hipsNum) < 5 &&
      Math.abs(bustNum - waistNum) < 5
    ) {
      shape = 'Rectangle';
    } else {
      shape = 'Undefined or Mixed';
    }

    setResult(shape);

    // 🔽 Send data to backend
    try {
      const res = await fetch('/api/save-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bust: bustNum,
          waist: waistNum,
          hips: hipsNum,
          shoulders: shouldersNum,
          result: shape,
          userEmail: session?.user?.email,
          userId: session?.user?.id,
        }),
      });

      if (!res.ok) {
        console.error('Failed to save history:', await res.text());
      }
    } catch (err) {
      console.error('API error:', err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow max-w-lg w-full">
        {authSection}
        {session && (
          <div className="mt-4 text-right">
            <a
              href="/history"
              className="inline-block px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              View History
            </a>
          </div>
        )}
        <h1>Body Shape Calculator</h1>

        <label className='block text-sm font-medium text-gray-700 m-4'>
          Bust (cm):
          <input
            type="number"
            value={bust}
            onChange={(e) => setBust(e.target.value)}
            min="0"
            max="300"
            required
            className={`w-full border px-3 py-2 rounded 
              ${errors.bust ? 'border-red-500' : 'border-gray-300'}
            `}         
          />
          {errors.bust && (
            <p className="text-red-500 text-xs mt-1">{errors.bust}</p>
          )}          
        </label>

        <label className='block text-sm font-medium text-gray-700 m-4'>
          Waist (cm):
          <input
            type="number"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
            min="0"
            max="300"
            required
            className={`w-full border px-3 py-2 rounded 
              ${errors.waist ? 'border-red-500' : 'border-gray-300'}
            `}          
          />
          {errors.waist && (
            <p className="text-red-500 text-xs mt-1">{errors.waist}</p>
          )}          
        </label>

        <label className='block text-sm font-medium text-gray-700 m-4'>
          Hips (cm):
          <input
            type="number"
            value={hips}
            onChange={(e) => setHips(e.target.value)}
            min="0"
            max="300"
            required
            className={`w-full border px-3 py-2 rounded 
              ${errors.hips ? 'border-red-500' : 'border-gray-300'}
            `}          
          />
          {errors.hips && (
            <p className="text-red-500 text-xs mt-1">{errors.hips}</p>
          )}
        </label>

        <label className='block text-sm font-medium text-gray-700 m-4'>
          Shoulders (cm):
          <input
            type="number"
            value={shoulders}
            onChange={(e) => setShoulders(e.target.value)}
            min="0"
            max="300"
            required
            className={`w-full border px-3 py-2 rounded 
              ${errors.shoulders ? 'border-red-500' : 'border-gray-300'}
            `}
          />
          {errors.shoulders && (
            <p className="text-red-500 text-xs mt-1">{errors.shoulders}</p>
          )}          
        </label>  

        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}

        <button
          onClick={calculateShape}
          disabled={!bust || !waist || !hips || !shoulders}
          className={`w-full py-2 px-4 rounded text-white transition
            ${!bust || !waist || !hips || !shoulders
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'}
          `}
        >
          Calculate
        </button>

        {result && (
          <div className="mt-6 text-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Your body shape is:
            </h2>
            <div className='bg-green-300 text-center rounded-xl p-2'>
              <p className="text-2xl font-bold text-blue-600 m-2">{result}</p>
            </div>
          </div>
        )}

        {result && !error && (
          <p className="text-indigo-600 text-center mt-4">Calculation complete!</p>
        )}
      
      </div>
    </div>
  );
}
