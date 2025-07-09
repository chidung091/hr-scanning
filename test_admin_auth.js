const fetch = require('node-fetch');

const baseUrl = 'http://localhost:50775';

async function testAdminAuth() {
  try {
    console.log('Testing admin authentication...');
    
    // Test 1: Try to access admin dashboard without login (should redirect to login)
    console.log('\n1. Testing admin dashboard access without login...');
    const dashboardResponse = await fetch(`${baseUrl}/admin`, { redirect: 'manual' });
    console.log('Response status:', dashboardResponse.status);
    console.log('Response headers:', dashboardResponse.headers.raw());
    
    // Test 2: Try to access admin login page
    console.log('\n2. Testing admin login page...');
    const loginPageResponse = await fetch(`${baseUrl}/admin/login`);
    console.log('Login page status:', loginPageResponse.status);
    console.log('Login page content type:', loginPageResponse.headers.get('content-type'));
    
    // Test 3: Try to perform login with default credentials
    console.log('\n3. Testing admin login with default credentials...');
    const loginResponse = await fetch(`${baseUrl}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'username=admin&password=admin',
      redirect: 'manual'
    });
    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', loginResponse.headers.raw());
    
    // Test 4: Try API login
    console.log('\n4. Testing API login...');
    const apiLoginResponse = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin'
      })
    });
    console.log('API login status:', apiLoginResponse.status);
    const apiLoginData = await apiLoginResponse.json();
    console.log('API login response:', apiLoginData);
    
  } catch (error) {
    console.error('Error testing admin auth:', error);
  }
}

testAdminAuth();