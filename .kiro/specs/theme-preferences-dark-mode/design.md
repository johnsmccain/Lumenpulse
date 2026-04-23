# Design Document: Theme Preferences and Dark Mode Support

## Overview

This design document specifies the technical implementation for adding comprehensive theme customization capabilities to the Lumenpulse Next.js application. The feature enables users to select between light mode, dark mode, or system-based theme preferences, with automatic detection and persistence across sessions.

### Goals

- Provide seamless theme switching with three modes: light, dark, and system
- Persist user preferences across sessions using browser localStorage
- Detect and respond to system theme changes in real-time
- Ensure smooth visual transitions without flash of unstyled content (FOUC)
- Maintain accessibility standards (WCAG AA) across all themes
- Integrate with existing Next.js App Router and Tailwind CSS architecture

### Non-Goals

- Custom color palette creation by users
- Per-component theme overrides
- Theme scheduling (automatic switching based on time of day)
- Server-side theme preference storage

## Architecture

### High-Level Architecture

The theme system follows a layered architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    UI Components                         │
│  (Theme Selector, Settings UI, All App Components)      │
└────────────────────┬────────────────────────────────────┘
                     │ consumes
┌────────────────────▼────────────────────────────────────┐
│                 Theme Context                            │
│  (React Context providing theme state & actions)        │
└────────────────────┬────────────────────────────────────┘
                     │ manages
┌────────────────────▼────────────────────────────────────┐
│                Theme Provider                            │
│  (State management, system detection, persistence)      │
└─────┬──────────────────────────────────────┬───────────┘
      │                                       │
      ▼                                       ▼
┌─────────────────┐                 ┌────────────────────┐
│  localStorage   │                 │  Media Query API   │
│  (Persistence)  │                 │  (System Detection)│
└─────────────────┘                 └────────────────────┘
```

### Integration with Existing Architecture

The theme system integrates with the existing Next.js application structure:

1. **Theme Provider** wraps the application in `app/providers.tsx` alongside `StellarProvider`
2. **CSS Variables** defined in `app/globals.css` are dynamically updated based on theme
3. **Tailwind Configuration** in `tailwind.config.ts` references CSS variables for theme colors
4. **Script Injection** in `app/layout.tsx` prevents FOUC by applying theme before first render

## Components and Interfaces

### 1. ThemeProvider Component

**Location:** `app/providers.tsx` (extend existing file)

**Responsibilities:**
- Manage theme state (current resolved theme: 'light' | 'dark')
- Manage user preference state ('light' | 'dark' | 'system')
- Detect system theme using `prefers-color-scheme` media query
- Persist preferences to localStorage
- Apply theme by updating document class and CSS variables
- Listen for system theme changes and update accordingly

**State:**
```typescript
interface ThemeState {
  // The user's explicit preference
  preference: 'light' | 'dark' | 'system';
  
  // The currently resolved theme (what's actually displayed)
  resolvedTheme: 'light' | 'dark';
  
  // System theme detection result
  systemTheme: 'light' | 'dark';
}
```

**Props:**
```typescript
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
  storageKey?: string;
  enableTransitions?: boolean;
}
```

### 2. ThemeContext

**Location:** `app/providers.tsx`

**Interface:**
```typescript
interface ThemeContextValue {
  // Current resolved theme ('light' or 'dark')
  theme: 'light' | 'dark';
  
  // User's preference ('light', 'dark', or 'system')
  preference: 'light' | 'dark' | 'system';
  
  // System's detected theme
  systemTheme: 'light' | 'dark';
  
  // Function to update theme preference
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Whether transitions are enabled
  enableTransitions: boolean;
}
```

### 3. useTheme Hook

**Location:** `app/providers.tsx`

**Purpose:** Provides access to theme context in any component

**Usage:**
```typescript
const { theme, preference, setTheme } = useTheme();
```

**Returns:** `ThemeContextValue`

### 4. ThemeSelector Component

**Location:** `components/theme-selector.tsx` (new file)

**Responsibilities:**
- Display three theme options with icons
- Show current selection
- Trigger theme changes via context
- Provide visual feedback on selection

**Props:**
```typescript
interface ThemeSelectorProps {
  variant?: 'dropdown' | 'radio' | 'segmented';
  showLabels?: boolean;
  className?: string;
}
```

### 5. Theme Script (Blocking Script)

**Location:** Injected in `app/layout.tsx`

**Purpose:** Execute before React hydration to prevent FOUC

**Functionality:**
- Read theme preference from localStorage
- Detect system theme if preference is 'system'
- Apply theme class to document element
- Set CSS variables immediately

## Data Models

### Theme Preference Storage

**Storage Key:** `lumenpulse-theme-preference`

**Storage Format:**
```typescript
type StoredThemePreference = 'light' | 'dark' | 'system';
```

**Storage Location:** Browser localStorage

**Fallback Strategy:**
1. If localStorage is unavailable → use 'system' as default
2. If stored value is invalid → reset to 'system'
3. If system detection fails → default to 'light'

### CSS Variables Schema

**Light Theme Variables:**
```css
:root[data-theme="light"] {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 210 40% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 217.2 91.2% 59.8%;
}
```

**Dark Theme Variables:**
```css
:root[data-theme="dark"] {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 210 40% 98%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 48%;
}
```

### Theme Transition Configuration

```typescript
interface ThemeTransitionConfig {
  duration: number; // milliseconds
  properties: string[]; // CSS properties to transition
  timingFunction: string; // CSS timing function
  respectReducedMotion: boolean;
}

const defaultTransitionConfig: ThemeTransitionConfig = {
  duration: 250,
  properties: ['background-color', 'color', 'border-color'],
  timingFunction: 'ease-in-out',
  respectReducedMotion: true,
};
```

