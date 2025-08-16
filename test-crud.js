const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';
let testUserId = '';
let testProjectId = '';
let testTaskId = '';

// Test data
const testUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'password123'
};

const testProject = {
  title: 'Test Project',
  description: 'This is a test project for CRUD operations'
};

const testTask = {
  title: 'Test Task',
  description: 'This is a test task for CRUD operations',
  priority: 'HIGH',
  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
};

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...options.headers
      },
      ...options
    });

    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    console.error(`Request failed: ${error.message}`);
    return { status: 500, ok: false, data: { error: error.message } };
  }
}

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...');
  
  // 1. Test user signup
  console.log('1. Testing user signup...');
  const signupResponse = await makeRequest(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    body: JSON.stringify(testUser)
  });
  
  if (signupResponse.ok) {
    console.log('✅ Signup successful:', signupResponse.data);
  } else {
    console.log('❌ Signup failed:', signupResponse.data);
  }

  // 2. Test user login
  console.log('\n2. Testing user login...');
  const loginResponse = await makeRequest(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password
    })
  });

  if (loginResponse.ok) {
    authToken = loginResponse.data.token;
    testUserId = loginResponse.data.user.id;
    console.log('✅ Login successful, token received');
    console.log('User ID:', testUserId);
  } else {
    console.log('❌ Login failed:', loginResponse.data);
    return false;
  }

  // 3. Test profile access
  console.log('\n3. Testing profile access...');
  const profileResponse = await makeRequest(`${BASE_URL}/auth/profile`);
  
  if (profileResponse.ok) {
    console.log('✅ Profile access successful:', profileResponse.data);
  } else {
    console.log('❌ Profile access failed:', profileResponse.data);
  }

  return true;
}

async function testProjectsCRUD() {
  console.log('\n📁 Testing Projects CRUD...');

  // 1. Test create project
  console.log('1. Testing project creation...');
  const createProjectResponse = await makeRequest(`${BASE_URL}/projects`, {
    method: 'POST',
    body: JSON.stringify(testProject)
  });

  if (createProjectResponse.ok) {
    testProjectId = createProjectResponse.data.id;
    console.log('✅ Project created successfully:', createProjectResponse.data);
  } else {
    console.log('❌ Project creation failed:', createProjectResponse.data);
    return false;
  }

  // 2. Test get all projects
  console.log('\n2. Testing get all projects...');
  const getProjectsResponse = await makeRequest(`${BASE_URL}/projects`);
  
  if (getProjectsResponse.ok) {
    console.log('✅ Get projects successful');
    console.log(`Found ${getProjectsResponse.data.length} projects`);
    getProjectsResponse.data.forEach(project => {
      console.log(`  - ${project.title} (ID: ${project.id})`);
    });
  } else {
    console.log('❌ Get projects failed:', getProjectsResponse.data);
  }

  // 3. Test get specific project
  console.log('\n3. Testing get specific project...');
  const getProjectResponse = await makeRequest(`${BASE_URL}/projects/${testProjectId}`);
  
  if (getProjectResponse.ok) {
    console.log('✅ Get specific project successful:', getProjectResponse.data);
  } else {
    console.log('❌ Get specific project failed:', getProjectResponse.data);
  }

  // 4. Test update project
  console.log('\n4. Testing project update...');
  const updatedProject = {
    title: 'Updated Test Project',
    description: 'This project has been updated'
  };
  
  const updateProjectResponse = await makeRequest(`${BASE_URL}/projects/${testProjectId}`, {
    method: 'PUT',
    body: JSON.stringify(updatedProject)
  });

  if (updateProjectResponse.ok) {
    console.log('✅ Project update successful:', updateProjectResponse.data);
  } else {
    console.log('❌ Project update failed:', updateProjectResponse.data);
  }

  return true;
}

async function testTasksCRUD() {
  console.log('\n📋 Testing Tasks CRUD...');

  // 1. Test create task
  console.log('1. Testing task creation...');
  const createTaskData = {
    ...testTask,
    projectId: testProjectId
  };
  
  const createTaskResponse = await makeRequest(`${BASE_URL}/tasks`, {
    method: 'POST',
    body: JSON.stringify(createTaskData)
  });

  if (createTaskResponse.ok) {
    testTaskId = createTaskResponse.data.id;
    console.log('✅ Task created successfully:', createTaskResponse.data);
  } else {
    console.log('❌ Task creation failed:', createTaskResponse.data);
    return false;
  }

  // 2. Test get all tasks
  console.log('\n2. Testing get all tasks...');
  const getTasksResponse = await makeRequest(`${BASE_URL}/tasks`);
  
  if (getTasksResponse.ok) {
    console.log('✅ Get tasks successful');
    console.log(`Found ${getTasksResponse.data.length} tasks`);
    getTasksResponse.data.forEach(task => {
      console.log(`  - ${task.title} (ID: ${task.id}, Status: ${task.status})`);
    });
  } else {
    console.log('❌ Get tasks failed:', getTasksResponse.data);
  }

  // 3. Test get tasks with filters
  console.log('\n3. Testing get tasks with filters...');
  const getFilteredTasksResponse = await makeRequest(`${BASE_URL}/tasks?projectId=${testProjectId}&priority=HIGH`);
  
  if (getFilteredTasksResponse.ok) {
    console.log('✅ Get filtered tasks successful');
    console.log(`Found ${getFilteredTasksResponse.data.length} filtered tasks`);
  } else {
    console.log('❌ Get filtered tasks failed:', getFilteredTasksResponse.data);
  }

  // 4. Test get specific task
  console.log('\n4. Testing get specific task...');
  const getTaskResponse = await makeRequest(`${BASE_URL}/tasks/${testTaskId}`);
  
  if (getTaskResponse.ok) {
    console.log('✅ Get specific task successful:', getTaskResponse.data);
  } else {
    console.log('❌ Get specific task failed:', getTaskResponse.data);
  }

  // 5. Test update task
  console.log('\n5. Testing task update...');
  const updatedTask = {
    title: 'Updated Test Task',
    description: 'This task has been updated',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM'
  };
  
  const updateTaskResponse = await makeRequest(`${BASE_URL}/tasks/${testTaskId}`, {
    method: 'PUT',
    body: JSON.stringify(updatedTask)
  });

  if (updateTaskResponse.ok) {
    console.log('✅ Task update successful:', updateTaskResponse.data);
  } else {
    console.log('❌ Task update failed:', updateTaskResponse.data);
  }

  return true;
}

async function testCleanup() {
  console.log('\n🧹 Testing Cleanup...');

  // 1. Test delete task
  console.log('1. Testing task deletion...');
  const deleteTaskResponse = await makeRequest(`${BASE_URL}/tasks/${testTaskId}`, {
    method: 'DELETE'
  });

  if (deleteTaskResponse.ok) {
    console.log('✅ Task deletion successful');
  } else {
    console.log('❌ Task deletion failed:', deleteTaskResponse.data);
  }

  // 2. Test delete project
  console.log('\n2. Testing project deletion...');
  const deleteProjectResponse = await makeRequest(`${BASE_URL}/projects/${testProjectId}`, {
    method: 'DELETE'
  });

  if (deleteProjectResponse.ok) {
    console.log('✅ Project deletion successful');
  } else {
    console.log('❌ Project deletion failed:', deleteProjectResponse.data);
  }

  // 3. Verify cleanup
  console.log('\n3. Verifying cleanup...');
  const finalProjectsResponse = await makeRequest(`${BASE_URL}/projects`);
  const finalTasksResponse = await makeRequest(`${BASE_URL}/tasks`);

  console.log(`Final projects count: ${finalProjectsResponse.data.length}`);
  console.log(`Final tasks count: ${finalTasksResponse.data.length}`);
}

async function testErrorCases() {
  console.log('\n⚠️ Testing Error Cases...');

  // 1. Test accessing protected route without token
  console.log('1. Testing access without token...');
  const noTokenResponse = await makeRequest(`${BASE_URL}/projects`, {
    headers: {} // No Authorization header
  });
  
  if (!noTokenResponse.ok && noTokenResponse.status === 401) {
    console.log('✅ Correctly rejected request without token');
  } else {
    console.log('❌ Should have rejected request without token');
  }

  // 2. Test accessing non-existent resource
  console.log('\n2. Testing access to non-existent resource...');
  const nonExistentResponse = await makeRequest(`${BASE_URL}/projects/non-existent-id`);
  
  if (!nonExistentResponse.ok && nonExistentResponse.status === 404) {
    console.log('✅ Correctly handled non-existent resource');
  } else {
    console.log('❌ Should have returned 404 for non-existent resource');
  }

  // 3. Test invalid data
  console.log('\n3. Testing invalid data...');
  const invalidProjectResponse = await makeRequest(`${BASE_URL}/projects`, {
    method: 'POST',
    body: JSON.stringify({ title: '' }) // Invalid: empty title
  });
  
  if (!invalidProjectResponse.ok && invalidProjectResponse.status === 400) {
    console.log('✅ Correctly rejected invalid data');
  } else {
    console.log('❌ Should have rejected invalid data');
  }
}

async function runAllTests() {
  console.log('🚀 Starting CRUD Tests...');
  console.log('=====================================');

  try {
    // Test authentication first
    const authSuccess = await testAuthentication();
    if (!authSuccess) {
      console.log('❌ Authentication failed, stopping tests');
      return;
    }

    // Test Projects CRUD
    const projectsSuccess = await testProjectsCRUD();
    if (!projectsSuccess) {
      console.log('❌ Projects CRUD failed');
      return;
    }

    // Test Tasks CRUD
    const tasksSuccess = await testTasksCRUD();
    if (!tasksSuccess) {
      console.log('❌ Tasks CRUD failed');
      return;
    }

    // Test error cases
    await testErrorCases();

    // Cleanup
    await testCleanup();

    console.log('\n🎉 All CRUD tests completed successfully!');
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Run the tests
runAllTests();
