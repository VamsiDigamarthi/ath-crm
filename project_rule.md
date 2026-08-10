# Project Coding Rules & Guidelines

## 1. Backend Architecture & Structure
- **Feature-Based Organization**: Application features (e.g., Authentication, Admin, Bookings) should have their related code grouped logically in a single folder under `src/features/`.
- **Flat Feature Structure**: Do not create sub-folders (like `controllers/`, `routes/`, `validators/`) inside each feature folder. Use naming conventions like `feature-controller.ts`, `feature-routes.ts`, and `feature-validator.ts` directly inside the feature folder.
- **Centralized Routing**: All routes must be exported from a central `src/routes/index.ts` file. The main `index.ts` should only import this central router.
- **Clean Code Principle**: Maintain high readability. Follow the "Single Responsibility Principle".

## 2. Database (Prisma) Rules
- **Multi-file Schema**: Do not put all models in one `schema.prisma`. Use the `prismaSchemaFolder` feature. Each table/feature should have its own `.prisma` file inside the `prisma/schema/` directory.
- **Prisma Client**: Always use the shared prisma instance from `src/config/db.ts`.

## 3. Authentication & Security
- **OTP-Based Login**: This application uses OTP (One-Time Password) for authentication by default.
- **Email Service**: All emails (OTP, Welcome, Notifications) **MUST** be sent through the centralized `EmailService` in `src/utils/email-service.ts`. Never use nodemailer directly in controllers.
- **Fallback Password Logic**: If a project specifically requires password-based login, use the pre-built logic in `src/utils/password.ts`.
- **Token Handling**: JWT tokens **MUST** be sent via HTTP-only, Secure cookies. Do not send tokens in the response body.

## 4. Reusable Utilities & Helpers
- **Standardized Success Responses**: Always use `SuccessHandler` from `src/utils/success-handler.ts`.
- **Pagination Utility**: Use the `paginate` helper from `src/utils/pagination.ts` for all listing APIs. It ensures a consistent `meta` response across the application.
- **Secure File Upload**: 
    - All file uploads **MUST** use the centralized `upload` middleware from `src/utils/file-upload.ts`.
    - Manual handling of files via `fs` or other libraries in controllers is prohibited unless explicitly justified.
    - Security: Never allow dangerous extensions like `.php`, `.exe`, `.sh`, `.js`. Always validate via Mime-type and extension.
    - Usage: For multiple files, use `upload.array('files', limit)`.

## 5. Error Handling Rules (Mandatory)
- **No Generic Errors**: Never throw a plain `Error`.
- **CustomError Inheritance**: Every error thrown **MUST** inherit from `CustomError`.
- Global Error Handler: All errors must be passed to the `errorHandler` middleware.

## 6. Frontend (Client-side) Architecture & Structure
- **Hooks-First Logic**: **MANDATORY**: All business logic, state management, form handling, and side effects must be in custom hooks or Zustand stores. 
- **Stateless Components**: **MANDATORY**: Components/Screens must be UI-only. They should only receive data/functions from hooks and render the UI. No `useState`, `useEffect`, or form logic directly inside components unless it's strictly for UI toggles (e.g., modal open/close).
- **State Management**: **MANDATORY**: Use **Zustand** for all global state management. Do **NOT** use React Context for global state to avoid unnecessary re-renders.
- **Feature-Based Organization**: All major functionalities (e.g., Auth, Profile) must reside in `src/features/[feature-name]/`.
- **Feature Sub-folders**:
    - `components/`: UI components specific to the feature.
    - `hooks/`: Feature-specific hooks.
    - `store/`: Feature-specific Zustand stores (if any).
    - `services/`: All API calls (Axios/Fetch) must be defined here.
    - `validations/`: All Zod schemas for form validations.
    - `screens/`: (React only) Main page/screen components that compose multiple feature components.
- **Shared Components**: Common UI elements (like shadcn/ui) must stay in `src/shared/components/ui/`.
- **Naming Convention**: Use descriptive names like `useAuth.ts`, `auth-service.ts`, and `auth-schema.ts`.

## 7. Frontend Security & Validation
- **Input Sanitization**: All user inputs must be treated as untrusted. Prevent XSS by avoiding `dangerouslySetInnerHTML` and sanitizing data before rendering.
- **Pre-submission Validation**: Every form must be validated using **Zod** before making an API call.
- **Security Injection Prevention**: Ensure all dynamic values in API requests are properly handled to prevent client-side injection attacks.
- **Error Handling**: Use a global error boundary or a centralized toast notification system for API errors.

## 8. Request Validation (Mandatory)
- **Mandatory Validation**: Use **Zod** to validate every request before it reaches the controller.
- **Middleware Integration**: Use the `validateRequest` middleware for all routes.

## 9. TypeScript & ESM Standards
- **ES6 Imports**: Always use `import` and `export`. Include `.js` extensions in local imports.
- **Type Safety**: Avoid `any`. Define clear interfaces/types.

## 10. Frontend Routing & Access Control
- **Router Setup**: Use `react-router-dom` with the modern `createBrowserRouter` API defined centrally in `src/routes/index.tsx`.
- **Protected Routes**: Use the generic `ProtectedRoute` component to handle authentication state and redirect unauthenticated users to `/login`.
- **Role-Based Access Control (RBAC)**: Use the `allowedRoles` prop on `ProtectedRoute` (e.g., `<ProtectedRoute allowedRoles={['ADMIN']} />`) to restrict access to specific roles. Avoid hardcoding access logic inside screen components.
## 11. UI & Styling
- **Primary Color**: The primary brand and action color for the entire application is **Tax Emerald Green (`#16A34A` / `emerald-600`)**. All primary buttons, active tabs, focus rings, status badges, and brand highlights MUST utilize this green accent palette (`#16A34A` primary, `#15803D` hover, `#DCFCE7` light background tint).
- **Typography**: The primary font family for the application is **Poppins**. This is configured globally via CSS variables (`--font-sans`) and Tailwind CSS.
- **Consistency**: If the font family or primary color palette needs to be changed in the future, it **MUST** be updated globally in `index.css` and `index.html` rather than hardcoded in individual components.


## 12. Modal & Dialog Component Constraints
- **Unified AppModal**: All modals across the application **MUST** strictly use the highly reusable `AppModal` component (`src/shared/components/AppModal.tsx`).
- **No Shadcn Dialogs**: Do **NOT** use or import the `Dialog` components from `shadcn/ui` (or radix-ui). The `AppModal` is a fully custom-built overlay container using Tailwind CSS to avoid layout restrictions.
- **Layout Standards**: Modals must adhere to the 90% max-height/width rule, with fixed Headers (including the cross icon), fixed Footers (for action buttons), and an internally scrollable body.

## 13. Table & Pagination Component Constraints
- **Unified AppTable**: Any data table displayed in the application **MUST** utilize the highly reusable `AppTable` component (`src/shared/components/AppTable.tsx`).
- **Unified AppPagination**: Do **NOT** write inline pagination logic or custom pagination components. All pagination layouts (including tables, card grids, list layouts, etc.) **MUST** utilize the standalone `AppPagination` component (`src/shared/components/AppPagination.tsx`).
- **Loading States**: You must pass the `isLoading` prop to `AppTable` to trigger the built-in skeleton loader rather than creating custom loading spinners or external skeleton structures.

## 14. Confirmation Dialog Constraints
- **Unified AppConfirmDialog**: For any simple "Yes/No" or verification action (e.g., Delete, Logout, Archive, Save Settings), you **MUST** utilize `AppConfirmDialog` (`src/shared/components/AppConfirmDialog.tsx`).
- **Do not create custom dialogs**: Do not instantiate a separate stateful `AppModal` or inline modal layout just to double-check an action.
- **Loading states**: Always pass the `isLoading` prop to show the built-in loader in the action button during API queries.

## 15. Empty State Constraints
- **Unified AppEmptyState**: Whenever a search, filter, list, or table has zero items to display, you **MUST** show the `AppEmptyState` component (`src/shared/components/AppEmptyState.tsx`).
- **Consistency**: Do not render simple empty strings or basic "No data" text blocks. Use `AppEmptyState` with a relevant icon, title, description, and primary/secondary call-to-actions.

## 16. ABSOLUTE COMPONENT REUSE MANDATE (CRITICAL WARNING)
- **STRICT NO CUSTOM DUPLICATION**: Creating any new custom data tables, pagination buttons/bars, modal dialog overlays, action confirmation boxes, empty state cards, multi-select combobox dropdowns, drag-and-drop file dropzones, keyboard shortcut search inputs, copy-to-clipboard buttons, or right-hand sliding drawers in any feature or screen is **STRICTLY PROHIBITED**.
- **Zero Tolerance for Custom Layout Primitives**: Do not write raw JSX, Tailwind structures, or import external packages to recreate these UI states. Any pull request containing custom versions of these elements **WILL BE REJECTED** immediately.
- **Unified Catalog Usage**: All developers **MUST** strictly import and utilize the shared components located under `src/shared/components/`:
  1. **Table Layouts**: `AppTable`
  2. **Page Controllers**: `AppPagination`
  3. **Overlay Modals**: `AppModal`
  4. **Confirmation Triggers**: `AppConfirmDialog`
  5. **Zero Data Views**: `AppEmptyState`
  6. **Multi-Select Dropdowns**: `AppMultiSelect`
  7. **Image Upload Dropzones**: `AppImageUpload`
  8. **Debounced Search Inputs**: `AppSearchInput`
  9. **Clipboard Copy Buttons**: `AppCopyButton`
  10. **Sliding Drawers/Sheets**: `AppDrawer`
- **Why**: This guarantee ensures 100% brand/design consistency, responsive layout perfection, micro-interaction alignment, and a completely bug-free unified UX across the entire application ecosystem.

## 17. Multi-Select Input Constraints
- **Unified AppMultiSelect**: For any form field requiring selection of multiple values/options, you **MUST** utilize `AppMultiSelect` (`src/shared/components/AppMultiSelect.tsx`).
- **No Native Selects**: Do **NOT** use standard HTML `<select multiple>` or build basic custom dropdown loops.
- **Features**: Ensure to support the search/filtering option for list-heavy selects, custom badges with close actions, and explicit error message prop handling when inputs are invalid.

## 18. Image Upload Constraints
- **Unified AppImageUpload**: Any avatar, logo, thumbnail, product gallery, attachments, or media file upload form field **MUST** strictly utilize `AppImageUpload` (`src/shared/components/AppImageUpload.tsx`).
- **Single vs Multiple Support**:
  - **Single File Fields**: Use `multiple={false}` (default). Behaviors include instant thumbnail replacements.
  - **Multi-File Fields**: Pass `multiple={true}` to activate the grid catalog layout, allowing developers to append new assets to the array via the "+" square trigger button.
- **Functionality Mandate**: Drag-and-drop event handlers, local `URL.createObjectURL` object preview mapping (with automatic revocation to prevent memory leaks), and size/type validation rules are mandatory. Always configure `maxSizeMB` and connect validation callbacks directly to your active form hook states.

## 19. Search & Clipboard Constraints
- **Unified AppSearchInput**: For any database search, table filtering, or header lookup bar, you **MUST** use `AppSearchInput` (`src/shared/components/AppSearchInput.tsx`).
- **Debounced Protection**: Do **NOT** call search endpoints on every single keystroke. `AppSearchInput` provides automated debouncing out-of-the-box.
- **Unified AppCopyButton**: Any screen displaying copy-friendly credentials, secrets, links, or IDs **MUST** utilize the `AppCopyButton` (`src/shared/components/AppCopyButton.tsx`) to unify clipboard copy micro-interactions (Copy -> Check checkmarks).

## 20. Drawer & Side Sheet Constraints
- **Unified AppDrawer**: For any right-sliding configuration sheets, extensive forms, filter drawers, or details view panels, you **MUST** strictly use `AppDrawer` (`src/shared/components/AppDrawer.tsx`).
- **Features**: It natively incorporates transition fade backdrop layers, ESC key handlers, scroll block locking, and close clicks. Do not build bespoke sliding components with manual viewport state transitions.

## 21. Next.js App Router (next-app) Architecture & Strict Directory Rules
- **Strict Architecture Mandate**: All Next.js projects (including `next-app`) **MUST** strictly follow the exact same architectural directory structures as the React app:
    - **`src/shared/`**: Contains shared infrastructure (`components/`, `hooks/`, `lib/`).
    - **`src/features/`**: Contains modular features. Each feature folder (e.g., `src/features/auth/`) must follow a strict sub-folder layout:
        - `components/` (Stateless UI components only)
        - `services/` (Axios API calls, server-data fetch)
        - `hooks/` (Reusable React hooks and states)
        - `validations/` (Zod validation schemas)
        - `store/` (Zustand state management)
- **Zero Custom Folders**: Creating ad-hoc custom roots, styling primitives, or utility folder trees outside of `src/shared/` or `src/features/` is strictly prohibited.
- **Server-Side Route Security (middleware.ts)**: **MANDATORY**: Next.js App Router applications must employ a centralized `src/middleware.ts` running in the Edge Runtime. It checks secure cookies, decodes base64 JWT payloads, and redirects traffic *before* a page compiles or renders to prevent UI flashing and client-side breaches completely.
- **Client-Side Auth Guards**: All user portals (`/dashboard`) and secure admin consoles (`/admin`) must support active client-side routing guards as a fallback layer.
- **Role-Based Routing (RBAC)**: Upon successful verification, user credentials must automatically map roles to push matching layout paths:
    - Role `USER` -> Routes to `/dashboard`
    - Role `ADMIN` -> Routes to `/admin`
- **SSR/Hydration Safety**: Zustand stores must employ `typeof window !== 'undefined'` check blocks and cache-hydration lifecycle checks (e.g. `initialize()`) on mount to completely prevent hydration mismatches during Server-Side Rendering (SSR).

