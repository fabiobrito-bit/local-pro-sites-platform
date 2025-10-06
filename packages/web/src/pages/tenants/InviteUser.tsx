import { useState } from 'react';
import { api } from '../../lib/api';

export default function InviteUser({ tenantId }: { tenantId: string }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [status, setStatus] = useState('');

  const handleInvite = async () => {
    try {
      await api.post('/invites', { tenantId, email, role });
      setStatus('Invite sent!');
    } catch {
      setStatus('Error sending invite');
    }
  };

  return (
    <div>
      <h3>Invite User</h3>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </select>
      <button onClick={handleInvite}>Send Invite</button>
      <div>{status}</div>
    </div>
  );
}
