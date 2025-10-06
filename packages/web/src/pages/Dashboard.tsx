import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>Welcome to the protected dashboard! You are successfully logged in.</p>
      <p>Your JWT token is stored in localStorage and protects this route.</p>
      <button
        onClick={handleLogout}
        style={{ padding: '10px 20px', cursor: 'pointer', marginTop: '20px' }}
      >
        Logout
      </button>
    </div>
  );
};
