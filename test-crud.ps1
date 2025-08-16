# PowerShell CRUD Test Script
$BASE_URL = "http://localhost:3000/api"
$authToken = ""
$testUserId = ""
$testProjectId = ""
$testTaskId = ""

# Test data
$testUser = @{
    name = "Test User"
    email = "testuser@example.com"
    password = "password123"
}

$testProject = @{
    title = "Test Project"
    description = "This is a test project for CRUD operations"
}

$testTask = @{
    title = "Test Task"
    description = "This is a test task for CRUD operations"
    priority = "HIGH"
    deadline = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

function Make-Request {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    try {
        $requestHeaders = @{
            "Content-Type" = "application/json"
        }
        
        if ($authToken) {
            $requestHeaders["Authorization"] = "Bearer $authToken"
        }
        
        foreach ($key in $Headers.Keys) {
            $requestHeaders[$key] = $Headers[$key]
        }
        
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $requestHeaders
        }
        
        if ($Body) {
            $params.Body = $Body | ConvertTo-Json -Depth 10
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        
        return @{
            Status = 200
            Ok = $true
            Data = $response
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = $_.Exception.Message
        
        try {
            $errorResponse = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorResponse)
            $errorBody = $reader.ReadToEnd()
            $errorData = $errorBody | ConvertFrom-Json
        }
        catch {
            $errorData = @{ error = $errorMessage }
        }
        
        return @{
            Status = $statusCode
            Ok = $false
            Data = $errorData
        }
    }
}

function Test-Authentication {
    Write-Host "`n🔐 Testing Authentication..." -ForegroundColor Cyan
    
    # 1. Test user signup
    Write-Host "1. Testing user signup..." -ForegroundColor Yellow
    $signupResponse = Make-Request -Url "$BASE_URL/auth/signup" -Method "POST" -Body $testUser
    
    if ($signupResponse.Ok) {
        Write-Host "✅ Signup successful" -ForegroundColor Green
        Write-Host "User: $($signupResponse.Data.user.name)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Signup failed: $($signupResponse.Data.error)" -ForegroundColor Red
    }
    
    # 2. Test user login
    Write-Host "`n2. Testing user login..." -ForegroundColor Yellow
    $loginData = @{
        email = $testUser.email
        password = $testUser.password
    }
    
    $loginResponse = Make-Request -Url "$BASE_URL/auth/login" -Method "POST" -Body $loginData
    
    if ($loginResponse.Ok) {
        $authToken = $loginResponse.Data.token
        $testUserId = $loginResponse.Data.user.id
        Write-Host "✅ Login successful, token received" -ForegroundColor Green
        Write-Host "User ID: $testUserId" -ForegroundColor Gray
    } else {
        Write-Host "❌ Login failed: $($loginResponse.Data.error)" -ForegroundColor Red
        return $false
    }
    
    # 3. Test profile access
    Write-Host "`n3. Testing profile access..." -ForegroundColor Yellow
    $profileResponse = Make-Request -Url "$BASE_URL/auth/profile"
    
    if ($profileResponse.Ok) {
        Write-Host "✅ Profile access successful" -ForegroundColor Green
        Write-Host "User: $($profileResponse.Data.name), Role: $($profileResponse.Data.role)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Profile access failed: $($profileResponse.Data.error)" -ForegroundColor Red
    }
    
    return $true
}

function Test-ProjectsCRUD {
    Write-Host "`n📁 Testing Projects CRUD..." -ForegroundColor Cyan
    
    # 1. Test create project
    Write-Host "1. Testing project creation..." -ForegroundColor Yellow
    $createProjectResponse = Make-Request -Url "$BASE_URL/projects" -Method "POST" -Body $testProject
    
    if ($createProjectResponse.Ok) {
        $testProjectId = $createProjectResponse.Data.id
        Write-Host "✅ Project created successfully" -ForegroundColor Green
        Write-Host "Project ID: $testProjectId" -ForegroundColor Gray
    } else {
        Write-Host "❌ Project creation failed: $($createProjectResponse.Data.error)" -ForegroundColor Red
        return $false
    }
    
    # 2. Test get all projects
    Write-Host "`n2. Testing get all projects..." -ForegroundColor Yellow
    $getProjectsResponse = Make-Request -Url "$BASE_URL/projects"
    
    if ($getProjectsResponse.Ok) {
        Write-Host "✅ Get projects successful" -ForegroundColor Green
        Write-Host "Found $($getProjectsResponse.Data.Count) projects" -ForegroundColor Gray
        foreach ($project in $getProjectsResponse.Data) {
            Write-Host "  - $($project.title) (ID: $($project.id))" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Get projects failed: $($getProjectsResponse.Data.error)" -ForegroundColor Red
    }
    
    # 3. Test get specific project
    Write-Host "`n3. Testing get specific project..." -ForegroundColor Yellow
    $getProjectResponse = Make-Request -Url "$BASE_URL/projects/$testProjectId"
    
    if ($getProjectResponse.Ok) {
        Write-Host "✅ Get specific project successful" -ForegroundColor Green
        Write-Host "Project: $($getProjectResponse.Data.title)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Get specific project failed: $($getProjectResponse.Data.error)" -ForegroundColor Red
    }
    
    # 4. Test update project
    Write-Host "`n4. Testing project update..." -ForegroundColor Yellow
    $updatedProject = @{
        title = "Updated Test Project"
        description = "This project has been updated"
    }
    
    $updateProjectResponse = Make-Request -Url "$BASE_URL/projects/$testProjectId" -Method "PUT" -Body $updatedProject
    
    if ($updateProjectResponse.Ok) {
        Write-Host "✅ Project update successful" -ForegroundColor Green
        Write-Host "Updated title: $($updateProjectResponse.Data.title)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Project update failed: $($updateProjectResponse.Data.error)" -ForegroundColor Red
    }
    
    return $true
}

function Test-TasksCRUD {
    Write-Host "`n📋 Testing Tasks CRUD..." -ForegroundColor Cyan
    
    # 1. Test create task
    Write-Host "1. Testing task creation..." -ForegroundColor Yellow
    $createTaskData = $testTask.Clone()
    $createTaskData.projectId = $testProjectId
    
    $createTaskResponse = Make-Request -Url "$BASE_URL/tasks" -Method "POST" -Body $createTaskData
    
    if ($createTaskResponse.Ok) {
        $testTaskId = $createTaskResponse.Data.id
        Write-Host "✅ Task created successfully" -ForegroundColor Green
        Write-Host "Task ID: $testTaskId" -ForegroundColor Gray
    } else {
        Write-Host "❌ Task creation failed: $($createTaskResponse.Data.error)" -ForegroundColor Red
        return $false
    }
    
    # 2. Test get all tasks
    Write-Host "`n2. Testing get all tasks..." -ForegroundColor Yellow
    $getTasksResponse = Make-Request -Url "$BASE_URL/tasks"
    
    if ($getTasksResponse.Ok) {
        Write-Host "✅ Get tasks successful" -ForegroundColor Green
        Write-Host "Found $($getTasksResponse.Data.Count) tasks" -ForegroundColor Gray
        foreach ($task in $getTasksResponse.Data) {
            Write-Host "  - $($task.title) (ID: $($task.id), Status: $($task.status))" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Get tasks failed: $($getTasksResponse.Data.error)" -ForegroundColor Red
    }
    
    # 3. Test get tasks with filters
    Write-Host "`n3. Testing get tasks with filters..." -ForegroundColor Yellow
    $getFilteredTasksResponse = Make-Request -Url "$BASE_URL/tasks?projectId=$testProjectId&priority=HIGH"
    
    if ($getFilteredTasksResponse.Ok) {
        Write-Host "✅ Get filtered tasks successful" -ForegroundColor Green
        Write-Host "Found $($getFilteredTasksResponse.Data.Count) filtered tasks" -ForegroundColor Gray
    } else {
        Write-Host "❌ Get filtered tasks failed: $($getFilteredTasksResponse.Data.error)" -ForegroundColor Red
    }
    
    # 4. Test get specific task
    Write-Host "`n4. Testing get specific task..." -ForegroundColor Yellow
    $getTaskResponse = Make-Request -Url "$BASE_URL/tasks/$testTaskId"
    
    if ($getTaskResponse.Ok) {
        Write-Host "✅ Get specific task successful" -ForegroundColor Green
        Write-Host "Task: $($getTaskResponse.Data.title)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Get specific task failed: $($getTaskResponse.Data.error)" -ForegroundColor Red
    }
    
    # 5. Test update task
    Write-Host "`n5. Testing task update..." -ForegroundColor Yellow
    $updatedTask = @{
        title = "Updated Test Task"
        description = "This task has been updated"
        status = "IN_PROGRESS"
        priority = "MEDIUM"
    }
    
    $updateTaskResponse = Make-Request -Url "$BASE_URL/tasks/$testTaskId" -Method "PUT" -Body $updatedTask
    
    if ($updateTaskResponse.Ok) {
        Write-Host "✅ Task update successful" -ForegroundColor Green
        Write-Host "Updated title: $($updateTaskResponse.Data.title)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Task update failed: $($updateTaskResponse.Data.error)" -ForegroundColor Red
    }
    
    return $true
}

function Test-Cleanup {
    Write-Host "`n🧹 Testing Cleanup..." -ForegroundColor Cyan
    
    # 1. Test delete task
    Write-Host "1. Testing task deletion..." -ForegroundColor Yellow
    $deleteTaskResponse = Make-Request -Url "$BASE_URL/tasks/$testTaskId" -Method "DELETE"
    
    if ($deleteTaskResponse.Ok) {
        Write-Host "✅ Task deletion successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Task deletion failed: $($deleteTaskResponse.Data.error)" -ForegroundColor Red
    }
    
    # 2. Test delete project
    Write-Host "`n2. Testing project deletion..." -ForegroundColor Yellow
    $deleteProjectResponse = Make-Request -Url "$BASE_URL/projects/$testProjectId" -Method "DELETE"
    
    if ($deleteProjectResponse.Ok) {
        Write-Host "✅ Project deletion successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Project deletion failed: $($deleteProjectResponse.Data.error)" -ForegroundColor Red
    }
    
    # 3. Verify cleanup
    Write-Host "`n3. Verifying cleanup..." -ForegroundColor Yellow
    $finalProjectsResponse = Make-Request -Url "$BASE_URL/projects"
    $finalTasksResponse = Make-Request -Url "$BASE_URL/tasks"
    
    Write-Host "Final projects count: $($finalProjectsResponse.Data.Count)" -ForegroundColor Gray
    Write-Host "Final tasks count: $($finalTasksResponse.Data.Count)" -ForegroundColor Gray
}

function Test-ErrorCases {
    Write-Host "`n⚠️ Testing Error Cases..." -ForegroundColor Cyan
    
    # 1. Test accessing protected route without token
    Write-Host "1. Testing access without token..." -ForegroundColor Yellow
    $noTokenResponse = Make-Request -Url "$BASE_URL/projects" -Headers @{"Authorization" = ""}
    
    if (-not $noTokenResponse.Ok -and $noTokenResponse.Status -eq 401) {
        Write-Host "✅ Correctly rejected request without token" -ForegroundColor Green
    } else {
        Write-Host "❌ Should have rejected request without token" -ForegroundColor Red
    }
    
    # 2. Test accessing non-existent resource
    Write-Host "`n2. Testing access to non-existent resource..." -ForegroundColor Yellow
    $nonExistentResponse = Make-Request -Url "$BASE_URL/projects/non-existent-id"
    
    if (-not $nonExistentResponse.Ok -and $nonExistentResponse.Status -eq 404) {
        Write-Host "✅ Correctly handled non-existent resource" -ForegroundColor Green
    } else {
        Write-Host "❌ Should have returned 404 for non-existent resource" -ForegroundColor Red
    }
    
    # 3. Test invalid data
    Write-Host "`n3. Testing invalid data..." -ForegroundColor Yellow
    $invalidProject = @{ title = "" }
    $invalidProjectResponse = Make-Request -Url "$BASE_URL/projects" -Method "POST" -Body $invalidProject
    
    if (-not $invalidProjectResponse.Ok -and $invalidProjectResponse.Status -eq 400) {
        Write-Host "✅ Correctly rejected invalid data" -ForegroundColor Green
    } else {
        Write-Host "❌ Should have rejected invalid data" -ForegroundColor Red
    }
}

function Start-AllTests {
    Write-Host "🚀 Starting CRUD Tests..." -ForegroundColor Magenta
    Write-Host "=====================================" -ForegroundColor Magenta
    
    try {
        # Test authentication first
        $authSuccess = Test-Authentication
        if (-not $authSuccess) {
            Write-Host "❌ Authentication failed, stopping tests" -ForegroundColor Red
            return
        }
        
        # Test Projects CRUD
        $projectsSuccess = Test-ProjectsCRUD
        if (-not $projectsSuccess) {
            Write-Host "❌ Projects CRUD failed" -ForegroundColor Red
            return
        }
        
        # Test Tasks CRUD
        $tasksSuccess = Test-TasksCRUD
        if (-not $tasksSuccess) {
            Write-Host "❌ Tasks CRUD failed" -ForegroundColor Red
            return
        }
        
        # Test error cases
        Test-ErrorCases
        
        # Cleanup
        Test-Cleanup
        
        Write-Host "`n🎉 All CRUD tests completed successfully!" -ForegroundColor Green
        Write-Host "=====================================" -ForegroundColor Magenta
        
    } catch {
        Write-Host "❌ Test suite failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Run the tests
Start-AllTests
