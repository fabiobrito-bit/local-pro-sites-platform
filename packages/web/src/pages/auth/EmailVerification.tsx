import React, { useState } from 'react';
import axios from 'axios';

const EmailVerification: React.FC = () => {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post('/api/auth/verify-email', { token });
      if (res.data.success) {
        setMessage('Email verified! You can now log in.');
      } else {
        setMessage(res.data.message || 'Verification failed.');
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Verify Email</h2>
      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Verification Token</label>
          <input
            type="text"
            value={token}
            onChange={e => setToken(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
        {message && <div className="mt-2 text-center">{message}</div>}
      </form>
    </div>
  );
};

export default EmailVerification;
