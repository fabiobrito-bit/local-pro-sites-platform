import React, { useState } from 'react';
import axios from 'axios';

const ResetPassword: React.FC = () => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post('/api/auth/reset-password', { token, password });
      if (res.data.success) {
        setMessage('Password reset successful! You can now log in.');
      } else {
        setMessage(res.data.message || 'Reset failed.');
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Reset Token</label>
          <input
            type="text"
            value={token}
            onChange={e => setToken(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">New Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
        {message && <div className="mt-2 text-center">{message}</div>}
      </form>
    </div>
  );
};

export default ResetPassword;
