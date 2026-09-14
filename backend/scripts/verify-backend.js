import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import http from 'http';

let mongoServer;
let server;
let baseUrl;

const startTestServer = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`[Test Server] Running at ${baseUrl}`);
      resolve();
    });
  });
};

const stopTestServer = async () => {
  if (server) await new Promise((res) => server.close(res));
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
};

const apiRequest = async (path, options = {}, token = null) => {
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    'x-timezone': 'Asia/Kolkata',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
};

const runVerification = async () => {
  console.log('====================================================');
  console.log('🧪 RUNNING AUTH & SCOPED EXPENSES VERIFICATION SUITE');
  console.log('====================================================\n');

  try {
    await startTestServer();

    // 1. Health Check
    console.log('1️⃣ Testing Health Check...');
    const health = await apiRequest('/api/health');
    if (health.status !== 200 || health.data.status !== 'ok') {
      throw new Error(`Health check failed: ${JSON.stringify(health)}`);
    }
    console.log('  ✅ Health check returned status 200 OK\n');

    // 2. Auth Flow (Signup, Login, Duplicates)
    console.log('2️⃣ Testing Authentication Flow...');
    
    // Test 2a: User Signup
    const resSignup = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Ajeet Kumar',
        email: 'ajeet@example.com',
        password: 'password123'
      })
    });
    if (resSignup.status !== 201 || !resSignup.data.token || resSignup.data.user.email !== 'ajeet@example.com') {
      throw new Error(`Signup failed: ${JSON.stringify(resSignup)}`);
    }
    const tokenUser1 = resSignup.data.token;
    console.log('  ✅ User 1 signed up successfully and received JWT');

    // Test 2b: Duplicate email signup rejection
    const resDup = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Ajeet Duplicate',
        email: 'ajeet@example.com',
        password: 'password123'
      })
    });
    if (resDup.status !== 400) {
      throw new Error(`Expected duplicate signup to fail with 400, got: ${resDup.status}`);
    }
    console.log('  ✅ Duplicate email signup rejected (400 Bad Request)');

    // Test 2c: User Login
    const resLogin = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'ajeet@example.com',
        password: 'password123'
      })
    });
    if (resLogin.status !== 200 || !resLogin.data.token) {
      throw new Error(`Login failed: ${JSON.stringify(resLogin)}`);
    }
    console.log('  ✅ User 1 logged in successfully with matching password');

    // Test 2d: Invalid password login rejection
    const resWrongPass = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'ajeet@example.com',
        password: 'wrongpassword'
      })
    });
    if (resWrongPass.status !== 401) {
      throw new Error(`Expected 401 for wrong password, got ${resWrongPass.status}`);
    }
    console.log('  ✅ Wrong password rejected (401 Unauthorized)');

    // Test 2e: Get Me profile
    const resMe = await apiRequest('/api/auth/me', {}, tokenUser1);
    if (resMe.status !== 200 || resMe.data.user.email !== 'ajeet@example.com') {
      throw new Error(`GetMe profile failed: ${JSON.stringify(resMe)}`);
    }
    console.log('  ✅ /api/auth/me returned authenticated user profile\n');

    // 3. Unauthorized Protected Route Protection
    console.log('3️⃣ Testing Protected Route Security...');
    const resUnauth = await apiRequest('/api/expenses');
    if (resUnauth.status !== 401) {
      throw new Error(`Expected 401 on /api/expenses without token, got: ${resUnauth.status}`);
    }
    console.log('  ✅ Access to /api/expenses without token rejected with 401 Unauthorized\n');

    // 4. Create User 2 for Multi-tenant Data Isolation Test
    console.log('4️⃣ Testing Multi-User Data Isolation...');
    const resSignup2 = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Second User',
        email: 'user2@example.com',
        password: 'password456'
      })
    });
    const tokenUser2 = resSignup2.data.token;

    // User 1 creates an expense
    const resExp1 = await apiRequest('/api/expenses', {
      method: 'POST',
      body: JSON.stringify({
        amount: 500,
        category: 'Food',
        paymentMode: 'cash',
        note: 'User 1 Lunch',
        date: '2026-09-14T12:00:00+05:30'
      })
    }, tokenUser1);
    const user1ExpenseId = resExp1.data.data._id;

    // User 2 creates an expense
    await apiRequest('/api/expenses', {
      method: 'POST',
      body: JSON.stringify({
        amount: 2500,
        category: 'Shopping',
        paymentMode: 'online',
        onlineSubType: 'UPI',
        note: 'User 2 Shoes',
        date: '2026-09-14T15:00:00+05:30'
      })
    }, tokenUser2);

    // User 1 lists expenses (should see only 1 expense with ₹500)
    const resUser1List = await apiRequest('/api/expenses', {}, tokenUser1);
    if (resUser1List.data.count !== 1 || resUser1List.data.data[0].amount !== 500) {
      throw new Error(`User 1 saw incorrect expenses: ${JSON.stringify(resUser1List.data)}`);
    }

    // User 2 lists expenses (should see only 1 expense with ₹2500)
    const resUser2List = await apiRequest('/api/expenses', {}, tokenUser2);
    if (resUser2List.data.count !== 1 || resUser2List.data.data[0].amount !== 2500) {
      throw new Error(`User 2 saw incorrect expenses: ${JSON.stringify(resUser2List.data)}`);
    }

    // User 2 attempts to delete User 1's expense (Must return 404 / Forbidden)
    const resCrossDelete = await apiRequest(`/api/expenses/${user1ExpenseId}`, {
      method: 'DELETE'
    }, tokenUser2);
    if (resCrossDelete.status !== 404) {
      throw new Error(`Cross-user delete should fail with 404, got: ${resCrossDelete.status}`);
    }

    // Check Analytics isolation: User 1 summary should be ₹500, User 2 should be ₹2500
    const summaryUser1 = await apiRequest('/api/analytics/summary', {}, tokenUser1);
    const summaryUser2 = await apiRequest('/api/analytics/summary', {}, tokenUser2);
    if (summaryUser1.data.data.today.total !== 500 || summaryUser2.data.data.today.total !== 2500) {
      throw new Error('Analytics aggregation is leaking data across users');
    }

    console.log('  ✅ Data isolation verified: User 1 and User 2 cannot see or delete each other\'s expenses');
    console.log('  ✅ Analytics aggregations are strictly isolated per user account!\n');

    console.log('====================================================');
    console.log('🎉 ALL AUTH & ISOLATION TESTS PASSED PERFECTLY!');
    console.log('====================================================');

    await stopTestServer();
    process.exit(0);
  } catch (err) {
    console.error('❌ VERIFICATION SUITE FAILED:', err);
    await stopTestServer();
    process.exit(1);
  }
};

runVerification();
