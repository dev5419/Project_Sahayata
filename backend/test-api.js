const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

async function testAPI() {
    console.log('🧪 Testing Project Sahayata API...\n');

    try {
        // Test 1: Health Check
        console.log('1. Testing Health Check...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health Check:', healthResponse.data);

        // Test 2: API Health Check
        console.log('\n2. Testing API Health Check...');
        const apiHealthResponse = await axios.get(`${BASE_URL}/api/health`);
        console.log('✅ API Health Check:', apiHealthResponse.data);

        // Test 3: Get Counsellors (Public endpoint)
        console.log('\n3. Testing Get Counsellors...');
        const counsellorsResponse = await axios.get(`${BASE_URL}/api/counsellors`);
        console.log('✅ Get Counsellors:', counsellorsResponse.data);

        // Test 4: Get Resources (Public endpoint)
        console.log('\n4. Testing Get Resources...');
        const resourcesResponse = await axios.get(`${BASE_URL}/api/resources`);
        console.log('✅ Get Resources:', resourcesResponse.data);

        // Test 5: Test non-existent endpoint
        console.log('\n5. Testing Non-existent Endpoint...');
        try {
            await axios.get(`${BASE_URL}/api/non-existent`);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('✅ 404 Error handled correctly:', error.response.data);
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }

        console.log('\n🎉 All tests completed successfully!');
        console.log('\n📋 Available endpoints:');
        console.log('- GET  /health');
        console.log('- GET  /api/health');
        console.log('- GET  /api/counsellors');
        console.log('- GET  /api/resources');
        console.log('- POST /api/auth/register');
        console.log('- POST /api/auth/login');
        console.log('- GET  /api/appointments (requires token)');
        console.log('- POST /api/chat/start (requires token)');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the test
testAPI();
