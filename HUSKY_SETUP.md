# 🐕 Husky Git Hooks Setup

This document describes the comprehensive Git hooks setup using Husky to ensure code quality and prevent broken code from being committed or pushed.

---

## **🔧 Current Setup**

### **Pre-commit Hook** (`.husky/pre-commit`)

Runs before every commit to ensure code quality:

1. **📝 Lint-staged**: Runs ESLint and Prettier on staged files
2. **🎨 Frontend Linting**: Runs `npm run lint` for Next.js linting
3. **🔧 Backend Linting**: Runs `npm run lint` in backend directory

### **Pre-push Hook** (`.husky/pre-push`)

Runs before every push to ensure code functionality:

1. **🧪 Backend Tests**: Runs `npm test` in backend directory
2. **🧪 Frontend Tests**: Runs `npm test` for frontend tests
3. **🏗️ Frontend Build**: Runs `npm run build` to ensure no build errors
4. **🔧 Final Backend Lint**: Final lint check for backend code

---

## **📋 What Each Hook Does**

### **Pre-commit Hook**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Run lint-staged for staged files
echo "📝 Running lint-staged..."
npx lint-staged || {
  echo "❌ lint-staged failed"
  exit 1
}

# Run frontend linting
echo "🎨 Running frontend linting..."
npm run lint || {
  echo "❌ Frontend linting failed"
  exit 1
}

# Run backend linting
echo "🔧 Running backend linting..."
cd backend && npm run lint && cd .. || {
  echo "❌ Backend linting failed"
  exit 1
}

echo "✅ Pre-commit checks completed successfully!"
```

**Purpose:**

- Ensures code style consistency
- Catches syntax errors early
- Prevents poorly formatted code from being committed
- Runs quickly to not slow down development workflow

### **Pre-push Hook**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🚀 Running pre-push checks..."

# Run backend tests
echo "🧪 Running backend tests..."
cd backend && npm test && cd .. || {
  echo "❌ Backend tests failed"
  exit 1
}

# Run frontend tests
echo "🧪 Running frontend tests..."
npm test || {
  echo "❌ Frontend tests failed"
  exit 1
}

# Build frontend to ensure no build errors
echo "🏗️ Building frontend..."
npm run build || {
  echo "❌ Frontend build failed"
  exit 1
}

# Run backend linting one more time
echo "🔧 Final backend lint check..."
cd backend && npm run lint && cd .. || {
  echo "❌ Final backend lint check failed"
  exit 1
}

echo "✅ Pre-push checks completed successfully!"
```

**Purpose:**

- Ensures all tests pass before pushing
- Verifies the application builds successfully
- Prevents broken code from reaching the repository
- Provides comprehensive quality assurance

---

## **⚙️ Configuration Files**

### **Root package.json lint-staged**

```json
{
  "lint-staged": {
    "src/**/*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,jsx,ts,tsx,json,css,md}": ["prettier --write"]
  }
}
```

### **Backend package.json lint-staged**

```json
{
  "lint-staged": {
    "src/**/*.{js,jsx,ts,tsx}": [
      "eslint --fix --ignore-path .eslintignore",
      "prettier --write --ignore-path .prettierignore"
    ],
    "!mongodb-optimize.js": "echo 'Skipping mongodb-optimize.js'",
    "!**/mongodb-optimize.js": "echo 'Skipping mongodb-optimize.js'"
  }
}
```

---

## **🚀 Benefits**

### **Code Quality Assurance**

- **Consistent Code Style**: Prettier ensures uniform formatting
- **Error Prevention**: ESLint catches common mistakes
- **Best Practices**: Enforces coding standards

### **Development Workflow**

- **Early Error Detection**: Issues caught before commit/push
- **Automated Quality Checks**: No manual intervention needed
- **Team Consistency**: Everyone follows the same standards

### **Production Readiness**

- **Test Coverage**: Ensures all tests pass
- **Build Verification**: Confirms application builds correctly
- **Deployment Safety**: Prevents broken code from reaching production

---

## **🔧 Troubleshooting**

### **Hooks Not Running**

1. Ensure Husky is installed: `npm install husky --save-dev`
2. Run `npm run prepare` to install hooks
3. Check if hooks are executable: `ls -la .husky/`

### **Bypassing Hooks (Emergency)**

```bash
# Skip pre-commit hook
git commit --no-verify -m "Emergency fix"

# Skip pre-push hook
git push --no-verify
```

### **Common Issues**

- **Permission Denied**: Make hooks executable with `chmod +x .husky/*`
- **Path Issues**: Ensure working directory is correct
- **Dependency Issues**: Run `npm install` in both root and backend directories

---

## **📊 Expected Performance**

### **Pre-commit Hook**

- **Duration**: 5-15 seconds
- **Frequency**: Every commit
- **Impact**: Minimal development workflow impact

### **Pre-push Hook**

- **Duration**: 30-60 seconds (depending on test suite size)
- **Frequency**: Every push
- **Impact**: Ensures code quality before sharing

---

## **🎯 Best Practices**

1. **Keep Hooks Fast**: Pre-commit should be quick, save heavy checks for pre-push
2. **Clear Error Messages**: Provide helpful feedback when checks fail
3. **Consistent Configuration**: Use same linting rules across frontend and backend
4. **Regular Updates**: Keep dependencies and rules up to date
5. **Team Communication**: Ensure all team members understand the hooks

---

## **🔮 Future Enhancements**

### **Potential Additions**

- **Type Checking**: Add TypeScript type checking
- **Security Scanning**: Integrate security vulnerability scanning
- **Performance Testing**: Add performance regression tests
- **Documentation Checks**: Ensure documentation is up to date

### **Advanced Features**

- **Conditional Hooks**: Only run certain checks based on file changes
- **Parallel Execution**: Run independent checks in parallel
- **Caching**: Cache results to speed up subsequent runs
- **Custom Rules**: Add project-specific quality checks

---

## **✅ Verification**

To verify the setup is working:

1. **Make a change** to any JavaScript file
2. **Stage the change**: `git add .`
3. **Try to commit**: `git commit -m "Test commit"`
4. **Check output**: You should see the pre-commit hook running
5. **Try to push**: `git push`
6. **Check output**: You should see the pre-push hook running

If both hooks run successfully, your setup is working correctly! 🎉
