'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  if (status === 'loading') return <p>Loading...</p>;
  if (!session) return <p>You must be signed in to edit your profile.</p>;

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, birthdate, location, phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setMessage('Profile saved successfully!');
      router.refresh(); // Optional: reload data if needed
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-xl font-bold mb-4">Edit Profile</h1>

        <label className="block mb-2">
          Full Name
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border p-2 rounded mt-1" required />
        </label>

        <label className="block mb-2">
          Birthdate
          <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="w-full border p-2 rounded mt-1" required />
        </label>

        <label className="block mb-2">
          Location
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border p-2 rounded mt-1" />
        </label>

        <label className="block mb-4">
          Phone
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border p-2 rounded mt-1" />
        </label>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Save Profile
        </button>

        {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>}
      </form>
    </div>
  );
}
