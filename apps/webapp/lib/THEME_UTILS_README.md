# Theme Utilities - System Theme Detection

## Overview

This module implements system theme detection functionality for the Lumenpulse theme system. It provides a utility function to detect the user's operating system theme preference using the `prefers-color-scheme` media query.

## Implementation

### Files Created

1. **`theme-utils.ts`** - Core utility functions for theme detection
2. **`theme-utils.test.ts`** - Comprehensive unit tests
3. **`vitest.config.ts`** - Vitest test configuration
4. **`vitest.setup.ts`** - Test environment setup

### Function: `detectSystemTheme()`

Detects the current system theme preference using the `prefers-color-scheme` media query.

**Signature:**
```typescript
function detectSystemTheme(): ResolvedTheme
```

**Returns:** `'light' | 'dark'`

**Behavior:**
- Returns `'dark'` when the system prefers dark mode
- Returns `'light'` when the system prefers light mode
- Returns `'light'` as fallback when detection is not supported
- Returns `'light'` as fallback when detection fails

**Requirements Satisfied:**
- **2.1**: Detect system theme using prefers-color-scheme media query
- **2.3**: Use the prefers-color-scheme media query
- **2.4**: Handle cases where system theme detection is not supported
- **10.1**: Return 'light' as fallback when detection fails

## Testing

### Test Coverage

The test suite includes comprehensive coverage for:

1. **Successful Detection**
   - Dark mode detection
   - Light mode detection
   - Correct media query usage

2. **Fallback Behavior**
   - Unsupported `matchMedia` API
   - Invalid `matchMedia` implementation
   - Error handling with graceful fallback

3. **Edge Cases**
   - Null `matchMedia` results
   - Missing `matches` property
   - Multiple consecutive calls (idempotency)

4. **Server-Side Rendering (SSR) Compatibility**
   - Undefined `window` object handling

5. **Requirements Validation**
   - Explicit tests for each requirement

### Running Tests

**Prerequisites:**
```bash
cd apps/webapp
npm install
```

**Run all tests:**
```bash
npm test
```

**Run tests in watch mode:**
```bash
npm run test:watch
```

**Run tests with UI:**
```bash
npm run test:ui
```

**Run tests with coverage:**
```bash
npm run test:coverage
```

### Test Dependencies

The following dev dependencies were added to `package.json`:

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "@vitejs/plugin-react": "^4.2.1",
    "@vitest/ui": "^1.0.4",
    "jsdom": "^23.0.1",
    "vitest": "^1.0.4"
  }
}
```

## Usage Example

```typescript
import { detectSystemTheme } from '@/lib/theme-utils';

// Detect the current system theme
const systemTheme = detectSystemTheme();
console.log(systemTheme); // 'dark' or 'light'

// Use in theme provider
function ThemeProvider() {
  const [systemTheme, setSystemTheme] = useState(detectSystemTheme());
  
  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setSystemTheme(detectSystemTheme());
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  // ... rest of provider logic
}
```

## Error Handling

The function includes robust error handling:

1. **Browser Environment Check**: Returns fallback if `window` is undefined (SSR)
2. **API Support Check**: Returns fallback if `matchMedia` is not a function
3. **Try-Catch Block**: Catches any runtime errors and logs a warning
4. **Graceful Degradation**: Always returns a valid theme value

## Integration with Theme System

This utility is designed to integrate with the broader theme system:

- Uses `SYSTEM_THEME_MEDIA_QUERY` constant from `theme-constants.ts`
- Uses `DEFAULT_RESOLVED_THEME` constant for fallback behavior
- Returns `ResolvedTheme` type from `types/theme.ts`
- Will be used by the `ThemeProvider` component for system theme detection

## Next Steps

This utility will be used in:
1. **Task 4.1**: ThemeProvider implementation for initial system theme detection
2. **Task 4.2**: System theme change listener for real-time updates
3. **Task 6**: FOUC prevention script for pre-render theme detection

## Notes

- The function is pure and has no side effects
- It's safe to call in both browser and SSR environments
- The function is idempotent - multiple calls return consistent results
- Performance is optimal as it only queries the media query API
