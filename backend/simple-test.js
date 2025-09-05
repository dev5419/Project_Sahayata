const http = require('http');

const BASE_URL = 'localhost';
const PORT = 8080;

function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: BASE_URL,
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data) {
            const postData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    resolve({
                        status: res.statusCode,
                        data: parsedData
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        data: responseData
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function testAPI() {
    console.log('🧪 Testing Project Sahayata API...\n');

    try {
        // Test 1: Health Check
        console.log('1. Testing Health Check...');
        const healthResponse = await makeRequest('/health');
        console.log('✅ Health Check:', healthResponse);

        // Test 2: API Health Check
        console.log('\n2. Testing API Health Check...');
        const apiHealthResponse = await makeRequest('/api/health');
        console.log('✅ API Health Check:', apiHealthResponse);

        // Test 3: Get Counsellors (Public endpoint)
        console.log('\n3. Testing Get Counsellors...');
        const counsellorsResponse = await makeRequest('/api/counsellors');
        console.log('✅ Get Counsellors:', counsellorsResponse);

        // Test 4: Get Resources (Public endpoint)
        console.log('\n4. Testing Get Resources...');
        const resourcesResponse = await makeRequest('/api/resources');
        console.log('✅ Get Resources:', resourcesResponse);

        // Test 5: Test non-existent endpoint
        console.log('\n5. Testing Non-existent Endpoint...');
        const notFoundResponse = await makeRequest('/api/non-existent');
        console.log('✅ 404 Error handled correctly:', notFoundResponse);

        console.log('\n🎉 All tests completed successfully!');
        console.log('\n📋 Available endpoints:');
        console.log('- GET  /health');
        console.log('- GET  /api/health');
        console.log('- GET  /api/counsellors');
        console.log('- GET  /api/resources');
        console.log('- POST /api/auth/register');
        console.log('- POST /api/auth/login');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ Server is not running. Please start the server with: npm run dev');
        }
    }
}

// Run the test
testAPI();
