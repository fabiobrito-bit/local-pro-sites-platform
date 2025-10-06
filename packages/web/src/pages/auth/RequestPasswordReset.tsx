import React, { useState } from 'react';
import axios from 'axios';

const RequestPasswordReset: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post('/api/auth/request-password-reset', { email });
      if (res.data.success) {
        setMessage('Password reset email sent!');
      } else {
        setMessage(res.data.message || 'Request failed.');
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Request Password Reset</h2>
      <form onSubmit={handleRequest} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? 'Requesting...' : 'Request Reset'}
        </button>
        {message && <div className="mt-2 text-center">{message}</div>}
      </form>
    </div>
  );
};

export default RequestPasswordReset;
