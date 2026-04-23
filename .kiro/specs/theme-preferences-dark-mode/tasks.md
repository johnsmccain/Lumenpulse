# Implementation Plan: Theme Preferences and Dark Mode Support

## Overview

This implementation plan breaks down the theme preferences and dark mode feature into discrete, actionable coding tasks. The approach follows a bottom-up strategy: first establishing the core theme infrastructure (CSS variables, types, context), then building the theme provider with state management and persistence, followed by UI components, and finally integration with the existing application.

The implementation ensures no flash of unstyled content (FOUC), smooth transitions, accessibility compliance, and seamless integration with the existing Next.js App Router and Tailwind CSS architecture.

## Tasks

- [x] 1. Set up theme infrastructure and type definitions
  - Create TypeScript type definitions for theme system
  - Define theme-related interfaces (ThemeState, ThemeContextValue, ThemeProviderProps, etc.)
  - Create constants for storage keys and default values
  - _Requirements: 1.1, 1.5, 3.1, 3.3_

- [x] 2. Implement CSS variables and theme styles
  - [x] 2.1 Define CSS variables for light and dark themes in globals.css
    - Add light theme CSS variables (background, foreground, primary, secondary, etc.)
    - Add dark theme CSS variables with appropriate color values
    - Ensure WCAG AA contrast ratios are met for both themes
    - _Requirements: 4.1, 4.2, 4.4, 7.1, 7.2_
  
  - [x] 2.2 Configure CSS transitions for theme changes
    - Add transition rules for background-color, color, and border-color
    - Implement prefers-reduced-motion media query for accessibility
    - Set transition duration to 250ms with ease-in-out timing
    - _Requirements: 5.1, 5.2, 5.4, 7.3, 7.4_
  
  - [ ]* 2.3 Write unit tests for CSS variable definitions
    - Test that all required CSS variables are defined for both themes
    - Verify contrast ratios meet WCAG AA standards
    - _Requirements: 4.4, 7.1, 7.2_

- [x] 3. Create theme detection and storage utilities
  - [x] 3.1 Implement system theme detection utility
    - Create function to detect system theme using prefers-color-scheme media query
    - Handle cases where system theme detection is not supported
    - Return 'light' as fallback when detection fails
    - _Requirements: 2.1, 2.3, 2.4, 10.1_
  
  - [x] 3.2 Implement localStorage persistence utilities
    - Create function to save theme preference to localStorage
    - Create function to read theme preference from localStorage
    - Implement error handling for storage operations
    - Validate stored values and reset invalid preferences
    - _Requirements: 3.1, 3.2, 3.5, 10.2, 10.3, 10.4_
  
  - [ ]* 3.3 Write unit tests for utility functions
    - Test system theme detection with mocked media queries
    - Test localStorage read/write with success and failure scenarios
    - Test validation of stored theme values
    - Test fallback behavior when storage is unavailable
    - _Requirements: 2.4, 3.3, 3.5, 10.1, 10.2, 10.3, 10.4_

- [x] 4. Implement ThemeContext and ThemeProvider
  - [x] 4.1 Create ThemeContext with proper typing
    - Define ThemeContext using React.createContext
    - Implement ThemeContextValue interface
    - Create useTheme hook for consuming context
    - Add error handling for hook usage outside provider
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 4.2 Implement ThemeProvider component with state management
    - Initialize theme state (preference, resolvedTheme, systemTheme)
    - Implement setTheme function to update preferences
    - Handle theme resolution logic (system → light/dark)
    - Integrate localStorage persistence on preference changes
    - _Requirements: 1.2, 1.4, 3.1, 3.2, 6.4_
  
  - [x] 4.3 Add system theme change listener
    - Set up media query listener for prefers-color-scheme changes
    - Update theme when system preference changes
    - Ensure updates occur within 200ms
    - Clean up listener on component unmount
    - _Requirements: 2.2, 2.3_
  
  - [x] 4.4 Implement theme application logic
    - Apply theme by setting data-theme attribute on document element
    - Update CSS variables when theme changes
    - Prevent multiple simultaneous transitions
    - Ensure theme applies within 100ms of selection
    - _Requirements: 1.2, 4.2, 5.3_
  
  - [ ]* 4.5 Write unit tests for ThemeProvider
    - Test initial theme loading from localStorage
    - Test theme preference updates and persistence
    - Test system theme detection and changes
    - Test theme resolution logic (system → light/dark)
    - Test error handling for storage failures
    - _Requirements: 1.2, 2.2, 3.1, 3.2, 10.2, 10.3_

- [x] 5. Checkpoint - Ensure core theme system works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement FOUC prevention script
  - [x] 6.1 Create inline blocking script for initial theme load
    - Write script to read theme preference from localStorage before React hydration
    - Detect system theme if preference is 'system'
    - Apply data-theme attribute to document element immediately
    - Ensure script executes within 50ms
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 6.2 Inject script into app/layout.tsx
    - Add script tag in the head section before other content
    - Ensure script is inline (not external) for immediate execution
    - Test that no FOUC occurs on page load
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 7. Create ThemeSelector UI component
  - [x] 7.1 Implement ThemeSelector component structure
    - Create component with three theme options (light, dark, system)
    - Add icons for each theme option (sun, moon, monitor)
    - Implement variant prop for different display styles (dropdown, radio, segmented)
    - Add className prop for custom styling
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 7.2 Add theme selection interaction logic
    - Connect to useTheme hook for current state
    - Implement onClick handlers to call setTheme
    - Show visual feedback on selection (highlight, checkmark)
    - Display currently active theme option
    - _Requirements: 8.4, 8.5, 1.3, 1.4_
  
  - [x] 7.3 Add accessibility features to ThemeSelector
    - Implement keyboard navigation (arrow keys, Enter, Space)
    - Add ARIA labels and roles for screen readers
    - Ensure focus indicators are visible in both themes
    - Add aria-checked or aria-selected attributes
    - _Requirements: 7.5, 8.1_
  
  - [ ]* 7.4 Write unit tests for ThemeSelector component
    - Test rendering of all three theme options
    - Test theme selection triggers setTheme correctly
    - Test visual feedback on selection
    - Test keyboard navigation and accessibility
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

- [x] 8. Integrate ThemeProvider into application
  - [x] 8.1 Add ThemeProvider to app/providers.tsx
    - Import ThemeProvider component
    - Wrap existing providers with ThemeProvider
    - Configure default theme as 'system'
    - Set storage key to 'lumenpulse-theme-preference'
    - Enable transitions by default
    - _Requirements: 3.3, 3.1_
  
  - [x] 8.2 Update Tailwind configuration to use CSS variables
    - Modify tailwind.config.ts to reference theme CSS variables
    - Ensure all color utilities map to CSS variables
    - Test that Tailwind classes respond to theme changes
    - _Requirements: 4.1, 4.3_

- [x] 9. Add ThemeSelector to application UI
  - [x] 9.1 Integrate ThemeSelector into navigation or settings
    - Determine appropriate location (header, settings page, user menu)
    - Add ThemeSelector component to chosen location
    - Style component to match existing UI patterns
    - _Requirements: 8.1_
  
  - [ ]* 9.2 Write integration tests for theme switching
    - Test end-to-end theme switching flow
    - Verify theme persists across page reloads
    - Test system theme detection and changes
    - Verify no FOUC on initial load
    - _Requirements: 1.2, 1.4, 2.2, 3.2, 9.1_

- [x] 10. Verify accessibility compliance
  - [x] 10.1 Audit contrast ratios across all components
    - Check text contrast in both light and dark themes
    - Verify interactive elements meet 3:1 contrast ratio
    - Ensure focus indicators are visible in both themes
    - _Requirements: 7.1, 7.2, 7.5_
  
  - [x] 10.2 Test with prefers-reduced-motion enabled
    - Verify transitions are disabled when prefers-reduced-motion is active
    - Ensure instant theme changes occur without animation
    - _Requirements: 7.3, 7.4_

- [x] 11. Final checkpoint - Comprehensive testing
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation uses TypeScript with React and Next.js App Router
- CSS variables and Tailwind CSS are used for styling
- Accessibility (WCAG AA) is a core requirement throughout
- FOUC prevention is critical for good user experience
- System theme detection provides seamless OS integration
