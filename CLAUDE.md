# CLAUDE.md - Agent Guidelines for Koodo Reader

## Build Commands
- Start dev server: `yarn dev` or `npm run dev`
- Build production: `yarn build` or `npm run build`
- Run tests: `yarn test` or `npm test <test-name-pattern>` for single test
- Electron development: `yarn ele` or `npm run ele`
- Bundle analysis: `yarn analyze` or `npm run analyze`
- Build release: `yarn release` or `npm run release`

## Code Style
- **TypeScript**: Strict mode, targeting ES5, JSX for React, noImplicitAny disabled
- **ESLint**: Extends React App default, no-unused-vars rule level 2
- **Components**: Each in its own folder with component.tsx, interface.tsx, CSS files
- **Naming**: PascalCase for components/classes/interfaces, camelCase for variables
- **File Structure**: Components in /src/components/, Pages in /src/pages/, Models in /src/models/
- **Imports**: Group external libraries first, then internal imports
- **Redux**: Actions and reducers in separate files under /src/store/
- **Error Handling**: Try/catch for async, promise-based error handling

Remember to maintain the existing patterns for component structure, naming conventions, and file organization when making changes.