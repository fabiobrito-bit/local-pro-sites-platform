import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function TenantList() {
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    api.get('/tenants').then(res => setTenants(res.data));
  }, []);

  return (
    <div>
      <h2>Tenants</h2>
      <ul>
        {tenants.map((tenant: any) => (
          <li key={tenant.id}>{tenant.name}</li>
        ))}
      </ul>
    </div>
  );
}
