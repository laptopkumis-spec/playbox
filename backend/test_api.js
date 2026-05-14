async function test() {
  try {
    const loginRes = await fetch('http://localhost:3000/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'test1@example.com', password: 'password123' }) });
    const loginData = await loginRes.json();
    const token = loginData.access_token;
    console.log('Got token');
    
    const dashRes = await fetch('http://localhost:3000/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } });
    console.log('Dashboard OK', await dashRes.json());
    
    const reportsRes = await fetch('http://localhost:3000/api/admin/reports', { headers: { Authorization: `Bearer ${token}` } });
    console.log('Reports OK', await reportsRes.json());
    
    const bookingsRes = await fetch('http://localhost:3000/api/admin/bookings', { headers: { Authorization: `Bearer ${token}` } });
    console.log('Bookings OK', await bookingsRes.json());
  } catch (err) {
    console.error('ERROR:', err);
  }
}
test();
