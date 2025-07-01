# Development Guidelines

This document establishes coding standards, best practices, and operational readiness patterns for the project. Follow these guidelines to maintain code quality, consistency, and production readiness.

## Core Principles

### 1. Clarity Over Cleverness

Write code that is easy to understand and maintain. Prefer explicit, readable solutions over clever but obscure ones.

**Do:**

```typescript
const isValidEmail = (email: string): boolean => {
  return email.includes("@") && email.length > 3;
};
```

**Don't:**

```typescript
const isValidEmail = (e: string): boolean => !!e.match(/^.+@.+$/);
```

### 2. Fail Fast and Loud

Detect and report errors as early as possible. Use type checking and validation to catch issues before they reach production.

**Do:**

```typescript
function processUser(user: User): void {
  if (!user.id) {
    throw new Error("User ID is required");
  }
  // Process user...
}
```

**Don't:**

```typescript
function processUser(user: any): void {
  // Silently handle missing ID
  if (user.id) {
    // Process user...
  }
}
```

### 3. Production-First Mindset

Design with observability, monitoring, and debugging in mind from day one.

## Code Organization

### File Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Route-specific components
├── services/      # Business logic and API calls
├── utils/         # Helper functions and utilities
├── types/         # TypeScript type definitions
├── hooks/         # Custom React hooks
└── __tests__/     # Test files
```

### Naming Conventions

**Files and Directories:**

- Use kebab-case for file names: `user-profile.tsx`
- Use PascalCase for component files: `UserProfile.tsx`
- Use camelCase for utility files: `formatDate.ts`

**Variables and Functions:**

- Use camelCase: `getUserData`, `isLoading`
- Use descriptive names: `fetchUserProfile` not `fetchData`
- Boolean variables should be prefixed: `isLoading`, `hasError`, `canEdit`

**Constants:**

- Use SCREAMING_SNAKE_CASE: `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`

## Error Handling

### Error Patterns

**Service Layer Errors:**

```typescript
class UserService {
  async getUser(id: string): Promise<User> {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      logger.error("Failed to fetch user", {
        userId: id,
        error: error.message,
      });
      throw new UserFetchError(`Failed to fetch user ${id}`, error);
    }
  }
}
```

**Component Error Boundaries:**

```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("Component error", { error, errorInfo });
    // Report to monitoring service
  }
}
```

## Logging & Observability

### Logging Standards

**Structured Logging:**

```typescript
// Good: Structured with context
logger.info("User action completed", {
  userId: user.id,
  action: "profile_update",
  duration: Date.now() - startTime,
  success: true,
});

// Bad: Unstructured message
logger.info(`User ${user.id} updated profile in ${duration}ms`);
```

**Log Levels:**

- `error`: System errors, exceptions, failures
- `warn`: Potential issues, deprecated usage
- `info`: Important business events, user actions
- `debug`: Detailed diagnostic information

### Monitoring Patterns

**Performance Monitoring:**

```typescript
const timer = performance.now();
try {
  const result = await expensiveOperation();
  metrics.timing("operation.success", performance.now() - timer);
  return result;
} catch (error) {
  metrics.timing("operation.failure", performance.now() - timer);
  metrics.increment("operation.errors");
  throw error;
}
```

**Health Checks:**

```typescript
app.get("/health", async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    cache: await checkCache(),
    externalApi: await checkExternalApi(),
  };

  const healthy = Object.values(checks).every((check) => check.healthy);
  res.status(healthy ? 200 : 503).json({
    status: healthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    checks,
  });
});
```

## Testing Strategy

### Testing Pyramid

**Unit Tests (70%)**

- Test individual functions and components
- Fast execution, no external dependencies
- Use Jest and React Testing Library

**Integration Tests (20%)**

- Test component interactions and API integrations
- Use test databases and mock external services

**End-to-End Tests (10%)**

- Test complete user workflows
- Use Playwright or Cypress
- Run in CI/CD pipeline

### Testing Patterns

**Component Testing:**

```typescript
describe('UserProfile', () => {
  it('displays user information correctly', () => {
    const user = { id: '1', name: 'John Doe', email: 'john@example.com' };
    render(<UserProfile user={user} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    render(<UserProfile user={null} loading={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

**Service Testing:**

```typescript
describe("UserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches user data successfully", async () => {
    const mockUser = { id: "1", name: "John" };
    mockApi.get.mockResolvedValue({ data: mockUser });

    const result = await userService.getUser("1");

    expect(result).toEqual(mockUser);
    expect(mockApi.get).toHaveBeenCalledWith("/users/1");
  });
});
```

## Security Guidelines

### Input Validation

```typescript
// Validate and sanitize all inputs
const createUser = (input: CreateUserInput): User => {
  const validated = userSchema.parse(input); // Throws if invalid
  return userRepository.create(validated);
};
```

### Secrets Management

- Never commit secrets to version control
- Use environment variables for configuration
- Rotate secrets regularly
- Use proper secret management services

### Authentication & Authorization

```typescript
// Middleware for protected routes
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
```

## Performance Guidelines

### Code Splitting

```typescript
// Lazy load components
const UserDashboard = lazy(() => import("./UserDashboard"));

// Route-based code splitting
const routes = [
  {
    path: "/dashboard",
    component: lazy(() => import("./pages/Dashboard")),
  },
];
```

### Caching Strategies

```typescript
// React Query for data caching
const { data, isLoading, error } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => userService.getUser(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

## Documentation Requirements

### Code Documentation

- Document complex business logic
- Use JSDoc for public APIs
- Include usage examples for utilities

### API Documentation

- Document all endpoints with OpenAPI/Swagger
- Include request/response examples
- Document error responses

## Related Documentation

- [DECISIONS.md](./DECISIONS.md) - Architectural decisions behind these guidelines
- [DESIGN_NOTES.md](./DESIGN_NOTES.md) - System design patterns
- [LINTING_FORMATTING.md](./LINTING_FORMATTING.md) - Code formatting standards
- [TODOs.md](./TODOs.md) - Planned guideline improvements
