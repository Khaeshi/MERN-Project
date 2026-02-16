
---

## Testing Philosophy

### The Testing Pyramid

1. **Unit Tests (70%)**: Test individual functions and components in isolation
2. **Integration Tests (20%)**: Test how different parts work together
3. **End-to-End Tests (10%)**: Test complete user workflows

### Key Principles

- **Arrange-Act-Assert (AAA)**: Structure all tests with clear setup, execution, and verification phases
- **One Assertion Per Test**: Each test should verify one specific behavior
- **Descriptive Test Names**: Use clear, behavior-focused descriptions
- **Test Independence**: Tests should not depend on each other
- **Fast Execution**: Keep tests quick to encourage frequent running

---


#Backend Dependencies
```bash
npm install --save-dev jest supertest @types/jest
npm install --save-dev @babel/preset-env @babel/preset-typescript
npm install --save-dev mongodb-memory-server
```
To confirm installation:
```bash
npm list jest supertest mongodb-memory-server @babel/preset-env @babel/preset-typescript
```

Scripts:
```bash
"test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:backend": "jest --testPathPattern=backend"
```





### 1. Unit Testing Controllers

**Example: User Controller**

```javascript
// src/controllers/userController.js
const UserService = require('../services/userService');

class UserController {
  async getUser(req, res) {
    try {
      const { id } = req.params;
      const user = await UserService.findById(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  async createUser(req, res) {
    try {
      const userData = req.body;
      const user = await UserService.create(userData);
      return res.status(201).json({ user });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new UserController();
```

**Test: User Controller**

```javascript
// tests/unit/controllers/userController.test.js
const UserController = require('../../../src/controllers/userController');
const UserService = require('../../../src/services/userService');

// Mock the UserService
jest.mock('../../../src/services/userService');

describe('UserController', () => {
  let req, res;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create mock request and response objects
    req = {
      params: {},
      body: {},
      query: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });
  
  describe('getUser', () => {
    it('should return user when user exists', async () => {
      // Arrange
      const mockUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com'
      };
      req.params.id = '123';
      UserService.findById.mockResolvedValue(mockUser);
      
      // Act
      await UserController.getUser(req, res);
      
      // Assert
      expect(UserService.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: mockUser });
    });
    
    it('should return 404 when user does not exist', async () => {
      // Arrange
      req.params.id = 'nonexistent';
      UserService.findById.mockResolvedValue(null);
      
      // Act
      await UserController.getUser(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
    
    it('should return 500 when service throws error', async () => {
      // Arrange
      req.params.id = '123';
      const errorMessage = 'Database connection failed';
      UserService.findById.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await UserController.getUser(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });
  
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'secure123'
      };
      const createdUser = { id: '456', ...userData };
      req.body = userData;
      UserService.create.mockResolvedValue(createdUser);
      
      // Act
      await UserController.createUser(req, res);
      
      // Assert
      expect(UserService.create).toHaveBeenCalledWith(userData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ user: createdUser });
    });
    
    it('should return 400 when validation fails', async () => {
      // Arrange
      req.body = { name: 'Invalid' }; // Missing required fields
      UserService.create.mockRejectedValue(new Error('Validation failed'));
      
      // Act
      await UserController.createUser(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Validation failed' });
    });
  });
});
```

### 2. Integration Testing Routes

**Example: User Routes**

```javascript
// tests/integration/routes/users.test.js
const request = require('supertest');
const app = require('../../../src/app');
const mongoose = require('mongoose');
const User = require('../../../src/models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('User Routes Integration Tests', () => {
  let mongoServer;
  
  // Setup: Connect to in-memory database
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });
  
  // Cleanup: Clear database between tests
  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });
  
  // Teardown: Close connection and stop server
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  
  describe('POST /api/users', () => {
    it('should create a new user with valid data', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!'
      };
      
      // Act
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(201);
      
      // Assert
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user).not.toHaveProperty('password');
      
      // Verify user was saved to database
      const savedUser = await User.findOne({ email: userData.email });
      expect(savedUser).toBeTruthy();
      expect(savedUser.name).toBe(userData.name);
    });
    
    it('should return 400 with invalid email', async () => {
      // Arrange
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'SecurePass123!'
      };
      
      // Act
      const response = await request(app)
        .post('/api/users')
        .send(invalidData)
        .expect(400);
      
      // Assert
      expect(response.body).toHaveProperty('error');
    });
    
    it('should return 400 when email already exists', async () => {
      // Arrange
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Pass123!'
      };
      
      // Create first user
      await request(app).post('/api/users').send(userData);
      
      // Act: Try to create duplicate
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);
      
      // Assert
      expect(response.body.error).toContain('already exists');
    });
  });
  
  describe('GET /api/users/:id', () => {
    it('should retrieve existing user', async () => {
      // Arrange: Create a user first
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword'
      });
      
      // Act
      const response = await request(app)
        .get(`/api/users/${user._id}`)
        .expect(200);
      
      // Assert
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(user.email);
      expect(response.body.user).not.toHaveProperty('password');
    });
    
    it('should return 404 for non-existent user', async () => {
      // Arrange
      const fakeId = new mongoose.Types.ObjectId();
      
      // Act
      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .expect(404);
      
      // Assert
      expect(response.body.error).toContain('not found');
    });
    
    it('should return 400 for invalid id format', async () => {
      // Act
      await request(app)
        .get('/api/users/invalid-id')
        .expect(400);
    });
  });
  
  describe('PUT /api/users/:id', () => {
    it('should update user successfully', async () => {
      // Arrange
      const user = await User.create({
        name: 'Original Name',
        email: 'original@example.com',
        password: 'hashed'
      });
      
      const updates = { name: 'Updated Name' };
      
      // Act
      const response = await request(app)
        .put(`/api/users/${user._id}`)
        .send(updates)
        .expect(200);
      
      // Assert
      expect(response.body.user.name).toBe(updates.name);
      
      // Verify in database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.name).toBe(updates.name);
    });
  });
  
  describe('DELETE /api/users/:id', () => {
    it('should delete user successfully', async () => {
      // Arrange
      const user = await User.create({
        name: 'To Delete',
        email: 'delete@example.com',
        password: 'hashed'
      });
      
      // Act
      await request(app)
        .delete(`/api/users/${user._id}`)
        .expect(204);
      
      // Assert
      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });
  });
});
```

### 3. Middleware Testing

**Example: Authentication Middleware**

```javascript
// tests/unit/middleware/auth.test.js
const authMiddleware = require('../../../src/middleware/auth');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });
  
  it('should call next() with valid token', () => {
    // Arrange
    const mockUser = { id: '123', email: 'test@example.com' };
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue(mockUser);
    
    // Act
    authMiddleware(req, res, next);
    
    // Assert
    expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
  
  it('should return 401 when no token provided', () => {
    // Act
    authMiddleware(req, res, next);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });
  
  it('should return 401 with invalid token', () => {
    // Arrange
    req.headers.authorization = 'Bearer invalid-token';
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });
    
    // Act
    authMiddleware(req, res, next);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });
});
```


## Database Testing Strategies

### Using MongoDB Memory Server

**Setup File**

```javascript
// tests/setup.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Setup: Start in-memory MongoDB before tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

// Cleanup: Clear collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Teardown: Close connection and stop server
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
```


## Best Practices

### 1. Test Organization

**Group Related Tests**

```javascript
describe('UserController', () => {
  describe('getUser', () => {
    it('should return user when user exists', () => {});
    it('should return 404 when user does not exist', () => {});
  });
  
  describe('createUser', () => {
    it('should create user with valid data', () => {});
    it('should return 400 with invalid data', () => {});
  });
});
```

### 2. Descriptive Test Names

**Good Examples:**

```javascript
it('should return 404 when user does not exist')
it('should hash password before saving to database')
it('should prevent duplicate email registration')
it('should allow admin to delete any user')
```

**Bad Examples:**

```javascript
it('works') // Too vague
it('test user creation') // Unclear what's being tested
it('should work correctly') // Not specific
```

### 3. Test Independence

**Don't Do This:**

```javascript
let userId;

it('should create user', async () => {
  const user = await createUser();
  userId = user.id; // Storing state
});

it('should get user', async () => {
  const user = await getUser(userId); // Depends on previous test
});
```

**Do This:**

```javascript
it('should create user', async () => {
  const user = await createUser();
  expect(user).toHaveProperty('id');
});

it('should get user', async () => {
  const createdUser = await createUser(); // Independent setup
  const user = await getUser(createdUser.id);
  expect(user.id).toBe(createdUser.id);
});
```

### 4. Mock External Dependencies

```javascript
// Mock API calls
jest.mock('axios');

// Mock database
jest.mock('../models/User');

// Mock authentication
jest.mock('../middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user' };
    next();
  }
}));
```

### 5. Test Edge Cases

```javascript
describe('calculateDiscount', () => {
  it('should calculate 10% discount for valid amount', () => {});
  it('should return 0 for negative amounts', () => {});
  it('should return 0 for zero amount', () => {});
  it('should handle very large numbers', () => {});
  it('should handle decimal amounts', () => {});
  it('should throw error for non-numeric input', () => {});
});
```

### 6. Use beforeEach and afterEach Properly

```javascript
describe('Database Tests', () => {
  beforeEach(async () => {
    // Runs before each test
    await clearDatabase();
    await seedTestData();
  });
  
  afterEach(async () => {
    // Runs after each test
    await clearDatabase();
  });
  
  it('test 1', () => {});
  it('test 2', () => {});
});
```

### 7. Avoid Testing Implementation Details

**Don't Test:**

```javascript
it('should call setState with correct value', () => {
  // Testing internal React implementation
});
```

**Do Test:**

```javascript
it('should display updated value when button is clicked', () => {
  // Testing user-visible behavior
});
```

### 8. Keep Tests DRY (Don't Repeat Yourself)

**Use Helper Functions:**

```javascript
// tests/helpers/authHelpers.js
const generateToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET);
};

const authenticatedRequest = (app, token) => {
  return request(app).set('Authorization', `Bearer ${token}`);
};

module.exports = { generateToken, authenticatedRequest };
```

### 9. Test Coverage Goals

Set minimum coverage thresholds in jest.config.js:

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  },
  './src/controllers/': {
    branches: 80,
    functions: 80,
    lines: 80
  }
}
```

### 10. Async Testing Best Practices

**Use async/await:**

```javascript
it('should fetch data', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});
```

**Use waitFor for async state updates:**

```javascript
import { waitFor } from '@testing-library/react';

it('should show loading then data', async () => {
  render();
  
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

---

## Common Patterns

### Pattern 1: Testing Error Handling

```javascript
it('should handle network errors gracefully', async () => {
  // Arrange
  const errorMessage = 'Network error';
  mockApiCall.mockRejectedValue(new Error(errorMessage));
  
  // Act
  const result = await service.fetchData();
  
  // Assert
  expect(result.error).toBe(errorMessage);
  expect(result.data).toBeNull();
});
```

### Pattern 2: Testing Authentication

```javascript
describe('Protected Routes', () => {
  it('should return 401 when not authenticated', async () => {
    await request(app)
      .get('/api/protected')
      .expect(401);
  });
  
  it('should allow access when authenticated', async () => {
    const token = generateToken(user);
    
    await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
```

### Pattern 3: Testing Pagination

```javascript
describe('GET /api/users with pagination', () => {
  beforeEach(async () => {
    // Create 25 test users
    await UserFactory.createMany(25);
  });
  
  it('should return first page with default limit', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);
    
    expect(response.body.users).toHaveLength(10); // default limit
    expect(response.body.page).toBe(1);
    expect(response.body.totalPages).toBe(3);
  });
  
  it('should return specific page', async () => {
    const response = await request(app)
      .get('/api/users?page=2&limit=10')
      .expect(200);
    
    expect(response.body.page).toBe(2);
    expect(response.body.users).toHaveLength(10);
  });
});
```

### Pattern 4: Testing Validation

```javascript
describe('Input Validation', () => {
  const validData = {
    name: 'John Doe',
    email: 'john@example.com',
    age: 25
  };
  
  it('should accept valid data', async () => {
    const result = await validate(validData);
    expect(result.isValid).toBe(true);
  });
  
  it.each([
    ['missing name', { ...validData, name: '' }, 'Name is required'],
    ['invalid email', { ...validData, email: 'invalid' }, 'Invalid email'],
    ['age too young', { ...validData, age: 17 }, 'Must be 18 or older'],
  ])('should reject when %s', async (description, data, expectedError) => {
    const result = await validate(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(expectedError);
  });
});
```

### Pattern 5: Testing File Uploads

```javascript
describe('File Upload', () => {
  it('should upload file successfully', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('file', Buffer.from('test content'), 'test.txt')
      .expect(200);
    
    expect(response.body).toHaveProperty('fileId');
    expect(response.body.filename).toBe('test.txt');
  });
  
  it('should reject files over size limit', async () => {
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
    
    await request(app)
      .post('/api/upload')
      .attach('file', largeBuffer, 'large.txt')
      .expect(413);
  });
});
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Tests Timing Out

**Problem:**
```
Timeout - Async callback was not invoked within the 5000 ms timeout
```

**Solutions:**

```javascript
// Increase timeout for specific test
it('slow operation', async () => {
  // test code
}, 10000); // 10 second timeout

// Or set globally in jest.config.js
module.exports = {
  testTimeout: 10000
};
```

#### Issue 2: MongoDB Connection Issues

**Problem:**
```
MongooseServerSelectionError: connect ECONNREFUSED
```

**Solution:**

```javascript
// Ensure proper setup and teardown
beforeAll(async () => {
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
```

#### Issue 3: Memory Leaks

**Problem:**
```
Jest has detected the following 1 open handle potentially keeping Jest from exiting
```

**Solution:**

```javascript
// Close all connections
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  // Close any other connections (Redis, etc.)
});
```

#### Issue 4: Mock Not Working

**Problem:**
Mock is not being used in tests

**Solution:**

```javascript
// Make sure mock is before imports
jest.mock('../services/userService');
const userService = require('../services/userService');

// Or use jest.doMock for dynamic mocks
jest.doMock('../config', () => ({
  apiUrl: 'http://test-api.com'
}));
```

#### Issue 5: Tests Interfering With Each Other

**Problem:**
Tests pass individually but fail when run together

**Solution:**

```javascript
// Clear mocks and state between tests
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(async () => {
  // Clear database
  await clearDatabase();
  // Reset any global state
});
```

---