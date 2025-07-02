# Linting & Formatting Standards

This document defines code quality standards, formatting rules, and automated tooling configuration to ensure consistent code style across the project.

## Code Quality Tools

### ESLint Configuration

**Installation:**

```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

**Configuration (`.eslintrc.json`):**

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "no-unused-vars": "error",
    "no-console": "warn",
    "prefer-const": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  },
  "env": {
    "browser": true,
    "node": true,
    "es6": true
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

### Prettier Configuration

**Installation:**

```bash
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
```

**Configuration (`.prettierrc`):**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

**Prettier Ignore (`.prettierignore`):**

```
node_modules/
dist/
build/
*.min.js
*.min.css
```

## Language-Specific Standards

### TypeScript

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "es2020",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

**Type Definition Standards:**

```typescript
// Use interfaces for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// Use type aliases for unions and computed types
type Status = "pending" | "completed" | "failed";
type UserWithStatus = User & { status: Status };

// Avoid any, use unknown or specific types
const parseJson = (input: string): unknown => {
  return JSON.parse(input);
};
```

### React/JSX

**Component Standards:**

```typescript
// Functional components with TypeScript
interface Props {
  title: string;
  onSave: (data: FormData) => void;
  isLoading?: boolean;
}

const MyComponent: React.FC<Props> = ({
  title,
  onSave,
  isLoading = false
}) => {
  return (
    <div className="my-component">
      <h1>{title}</h1>
      {isLoading && <Spinner />}
    </div>
  );
};
```

## Git Hooks Integration

### Pre-commit Hooks

**Installation:**

```bash
npm install --save-dev husky lint-staged
```

**Package.json Configuration:**

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

### Pre-push Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-push": "npm run type-check && npm run test"
    }
  }
}
```

## IDE Configuration

### VS Code Settings

**`.vscode/settings.json`:**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

**Recommended Extensions (`.vscode/extensions.json`):**

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss"
  ]
}
```

## NPM Scripts

**Package.json Scripts:**

```json
{
  "scripts": {
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write src/**/*.{js,jsx,ts,tsx,json,css,md}",
    "format:check": "prettier --check src/**/*.{js,jsx,ts,tsx,json,css,md}",
    "type-check": "tsc --noEmit",
    "quality": "npm run lint && npm run format:check && npm run type-check"
  }
}
```

## CSS/Styling Standards

### Tailwind CSS (if used)

**Configuration:**

```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### CSS Modules (if used)

**Naming Convention:**

```css
/* Button.module.css */
.button {
  padding: 8px 16px;
  border-radius: 4px;
}

.button--primary {
  background-color: blue;
  color: white;
}

.button--secondary {
  background-color: gray;
  color: black;
}
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Code Quality
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Check formatting
        run: npm run format:check

      - name: Type checking
        run: npm run type-check

      - name: Run tests
        run: npm run test
```

## Common Issues & Solutions

### ESLint Issues

**Disable rules for specific lines:**

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = legacyApiResponse;
```

**Disable rules for entire files:**

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
// Legacy file with lots of any types
```

### Prettier Conflicts

**Resolve ESLint/Prettier conflicts:**

```bash
npm install --save-dev eslint-config-prettier
```

Add to `.eslintrc.json` extends array:

```json
{
  "extends": [
    "eslint:recommended",
    "prettier" // Must be last
  ]
}
```

## Related Documentation

- [GUIDELINES.md](./GUIDELINES.md) - Development best practices
- [DECISIONS.md](./DECISIONS.md) - Tool selection rationale
- [TODOs.md](./TODOs.md) - Planned tooling improvements
