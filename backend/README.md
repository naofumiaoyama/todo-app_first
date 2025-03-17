The API will be available at http://localhost:8000

## API Documentation

Once the application is running, you can access:
- Interactive API documentation: http://localhost:8000/docs
- Alternative documentation: http://localhost:8000/redoc

## Development

A test user is automatically created when the application starts:
- Username: testuser
- Password: password123

You can obtain a development token by visiting:
http://localhost:8000/api/dev-token

This token can be used for frontend development without needing to implement the full authentication flow.

## API Endpoints

### Authentication
- POST `/api/token` - Get access token (login)
- GET `/api/dev-token` - Get development token for testing

### Users
- POST `/api/users/` - Create a new user
- GET `/api/users/me/` - Get current user info

### Todos
- GET `/api/todos` - List all todos for current user
- POST `/api/todos` - Create a new todo
- GET `/api/todos/{todo_id}` - Get a specific todo
- PUT `/api/todos/{todo_id}` - Update a todo
- DELETE `/api/todos/{todo_id}` - Delete a todo