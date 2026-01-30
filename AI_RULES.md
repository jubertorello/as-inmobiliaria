# AI Studio Application Rules

This document outlines the core technologies and guidelines for developing and modifying the Andrea Sartori Inmobiliaria application.

## Tech Stack Overview

*   **React**: The primary JavaScript library for building the user interface.
*   **TypeScript**: Used for type safety across the entire codebase, enhancing maintainability and reducing errors.
*   **React Router**: Manages client-side routing, enabling navigation between different pages without full page reloads.
*   **Tailwind CSS**: A utility-first CSS framework for rapid and consistent styling, ensuring responsive and modern designs.
*   **Google GenAI (`@google/genai`)**: Integrated for AI-powered features, specifically the chatbot functionality.
*   **Material Symbols Outlined**: Utilized for a comprehensive and consistent set of icons throughout the application.
*   **Vite**: The build tool providing a fast development server and optimized production builds.
*   **Local Storage**: Used for client-side data persistence, simulating a backend for properties and landing page content.

## Library Usage Guidelines

To maintain consistency and efficiency, please adhere to the following rules when making changes:

*   **UI Components**: All user interface elements must be built using **React**.
*   **Styling**: **Tailwind CSS** classes are the exclusive method for styling components. Avoid custom CSS files or inline styles unless absolutely necessary for unique, isolated cases.
*   **Routing**: Use **React Router** (`react-router-dom`) for all navigation, route definitions, and URL parameter handling. Keep routes defined in `App.tsx`.
*   **State Management**: Prefer React's built-in `useState` and `useContext` hooks for managing component and global state.
*   **API & Data Persistence**: Interact with data exclusively through `apiService.ts`. This service abstracts away the `localStorage` implementation. Do not introduce new data fetching libraries or direct `localStorage` calls outside of `apiService.ts`.
*   **AI Integration**: All AI-related functionalities should leverage the existing `geminiService.ts` and the `@google/genai` library.
*   **Icons**: Use icons from **Material Symbols Outlined**. Ensure proper `font-variation-settings` are applied as defined in `index.html`.
*   **SEO**: Utilize the `SEO` component (`components/SEO.tsx`) for managing page titles, meta descriptions, keywords, and Open Graph tags.
*   **Component Structure**: Create a new, small, and focused file for every new component or hook. Components should ideally be 100 lines of code or less.
*   **File Organization**: Place pages in `src/pages/` and general components in `src/components/`. Utility files, types, and constants should reside in `src/` or appropriate subdirectories.