# Manual Test Plan: Theme Script Injection (Task 6.2)

## Overview
This document provides manual testing procedures to verify that the theme initialization script has been correctly injected into `app/layout.tsx` and that no FOUC (Flash of Unstyled Content) occurs on page load.

## Requirements Being Tested
- **Requirement 9.1**: Theme script reads preference from localStorage before React hydration
- **Requirement 9.2**: Theme script detects system theme if preference is 'system'
- **Requirement 9.3**: Theme script applies data-theme attribute immediately

## Test Setup

### Prerequisites
1. Start the development server: `npm run dev` or `pnpm dev`
2. Open browser DevTools (F12)
3. Clear localStorage: `localStorage.clear()`
4. Clear browser cache

## Test Cases

### Test 1: Script Injection Verification
**Objective**: Verify the script is properly injected in the HTML head

**Steps**:
1. Navigate to the application homepage
2. Open DevTools → Elements/Inspector tab
3. Inspect the `<head>` element
4. Locate the first `<script>` tag

**Expected Results**:
- ✅ A `<script>` tag exists as the first child of `<head>`
- ✅ The script is inline (contains JavaScript code, not a `src` attribute)
- ✅ The script contains the following key elements:
  - `lumenpulse-theme-preference`
  - `data-theme`
  - `prefers-color-scheme: dark`
  - `localStorage.getItem`
  - `document.documentElement.setAttribute`

**Pass/Fail**: _______

---

### Test 2: No FOUC with Default Theme (System)
**Objective**: Verify no flash of unstyled content on initial page load

**Steps**:
1. Clear localStorage: `localStorage.clear()`
2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Observe the page load carefully

**Expected Results**:
- ✅ No visible flash of white/light background before theme applies
- ✅ Theme is applied immediately on page load
- ✅ `data-theme` attribute is present on `<html>` element before React hydration
- ✅ The theme matches your system preference (check OS settings)

**Pass/Fail**: _______

---

### Test 3: No FOUC with Saved Light Theme
**Objective**: Verify saved light theme preference is applied immediately

**Steps**:
1. Set localStorage: `localStorage.setItem('lumenpulse-theme-preference', 'light')`
2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Observe the page load

**Expected Results**:
- ✅ Light theme is applied immediately (no flash)
- ✅ `<html>` element has `data-theme="light"` attribute
- ✅ Background is light colored from the start

**Pass/Fail**: _______

---

### Test 4: No FOUC with Saved Dark Theme
**Objective**: Verify saved dark theme preference is applied immediately

**Steps**:
1. Set localStorage: `localStorage.setItem('lumenpulse-theme-preference', 'dark')`
2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Observe the page load

**Expected Results**:
- ✅ Dark theme is applied immediately (no flash)
- ✅ `<html>` element has `data-theme="dark"` attribute
- ✅ Background is dark colored from the start

**Pass/Fail**: _______

---

### Test 5: System Theme Detection
**Objective**: Verify system theme is correctly detected when preference is 'system'

**Steps**:
1. Set localStorage: `localStorage.setItem('lumenpulse-theme-preference', 'system')`
2. Note your OS theme setting (light or dark)
3. Hard refresh the page
4. Check the `data-theme` attribute on `<html>` element

**Expected Results**:
- ✅ If OS is in dark mode: `data-theme="dark"`
- ✅ If OS is in light mode: `data-theme="light"`
- ✅ Theme matches system preference immediately

**Pass/Fail**: _______

---

### Test 6: Invalid Preference Handling
**Objective**: Verify graceful handling of invalid stored preferences

**Steps**:
1. Set invalid preference: `localStorage.setItem('lumenpulse-theme-preference', 'invalid-value')`
2. Hard refresh the page
3. Check the `data-theme` attribute

**Expected Results**:
- ✅ Script defaults to 'system' theme
- ✅ No JavaScript errors in console
- ✅ Page loads normally with system-detected theme

**Pass/Fail**: _______

---

### Test 7: Script Execution Before React Hydration
**Objective**: Verify script executes before React components render

**Steps**:
1. Open DevTools → Console tab
2. Add a console.log in the theme script to verify execution order
3. Hard refresh the page
4. Observe console output order

**Expected Results**:
- ✅ Theme script console.log appears before any React component logs
- ✅ `data-theme` attribute is set before React hydration
- ✅ No "hydration mismatch" warnings in console

**Pass/Fail**: _______

---

### Test 8: Script Performance
**Objective**: Verify script executes within performance requirements (50ms)

**Steps**:
1. Open DevTools → Performance tab
2. Start recording
3. Hard refresh the page
4. Stop recording after page load
5. Analyze the timeline for script execution

**Expected Results**:
- ✅ Theme script execution completes in < 50ms (Requirement 9.5)
- ✅ No blocking or long-running operations
- ✅ Page load is not significantly delayed

**Pass/Fail**: _______

---

### Test 9: Script Error Handling
**Objective**: Verify script handles errors gracefully

**Steps**:
1. Simulate localStorage unavailable (use private/incognito mode with storage disabled)
2. Hard refresh the page
3. Check console for errors

**Expected Results**:
- ✅ No unhandled exceptions in console
- ✅ Page loads with default light theme (Requirement 10.1)
- ✅ Application remains functional

**Pass/Fail**: _______

---

### Test 10: Script is Blocking (Not Async/Defer)
**Objective**: Verify script is synchronous and blocking

**Steps**:
1. View page source (Ctrl+U or Cmd+U)
2. Locate the theme initialization script
3. Check for async or defer attributes

**Expected Results**:
- ✅ Script tag has NO `async` attribute
- ✅ Script tag has NO `defer` attribute
- ✅ Script executes synchronously before other content

**Pass/Fail**: _______

---

## Visual FOUC Test (Critical)

### Test 11: Rapid Theme Switching
**Objective**: Verify no FOUC when rapidly switching between pages

**Steps**:
1. Set theme to dark: `localStorage.setItem('lumenpulse-theme-preference', 'dark')`
2. Navigate between different pages in the app
3. Use browser back/forward buttons
4. Observe for any flashing

**Expected Results**:
- ✅ No white flash between page navigations
- ✅ Theme remains consistent across all pages
- ✅ Dark theme persists throughout navigation

**Pass/Fail**: _______

---

## Test Summary

| Test Case | Pass | Fail | Notes |
|-----------|------|------|-------|
| 1. Script Injection | ☐ | ☐ | |
| 2. No FOUC (System) | ☐ | ☐ | |
| 3. No FOUC (Light) | ☐ | ☐ | |
| 4. No FOUC (Dark) | ☐ | ☐ | |
| 5. System Detection | ☐ | ☐ | |
| 6. Invalid Handling | ☐ | ☐ | |
| 7. Execution Order | ☐ | ☐ | |
| 8. Performance | ☐ | ☐ | |
| 9. Error Handling | ☐ | ☐ | |
| 10. Blocking Script | ☐ | ☐ | |
| 11. Rapid Switching | ☐ | ☐ | |

**Overall Result**: ☐ Pass ☐ Fail

**Tester Name**: _________________
**Date**: _________________
**Browser**: _________________
**OS**: _________________

## Notes and Issues

_Record any issues, observations, or deviations from expected behavior:_

---

## Automated Test Verification

Once the development environment is set up with Node.js and the test runner, execute:

```bash
npm test -- layout.test.tsx --run
```

This will run the automated unit tests that verify:
- Script injection in head
- Script placement before other content
- Correct script content
- No async/defer attributes
- Handling of all three theme preferences
