# Project Structure

## 📁 Directory Layout

```
airtable-mcp/
├── src/                    # Source code
│   ├── index.js           # Main entry point
│   ├── typescript/        # TypeScript implementation
│   ├── javascript/        # JavaScript implementation
│   └── python/            # Python implementation
├── dist/                  # Compiled TypeScript output
├── docs/                  # Documentation
│   ├── api/              # API documentation
│   ├── guides/           # User guides
│   └── releases/         # Release notes
├── tests/                 # Test files
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── e2e/             # End-to-end tests
├── examples/             # Usage examples
├── bin/                  # CLI executables
├── scripts/              # Build and utility scripts
├── config/               # Configuration files
├── docker/               # Docker configurations
└── types/                # TypeScript type definitions
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run the server
npm start

# Development mode
npm run dev

# Run tests
npm test
```

## 📦 Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start the production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run all tests
- `npm run lint` - Check code quality
- `npm run format` - Format code with Prettier

## 🔧 Implementations

### TypeScript (Primary)
- Location: `src/typescript/`
- Output: `dist/`
- Entry: `airtable-mcp-server.ts`

### JavaScript
- Location: `src/javascript/`
- Entry: `airtable_simple_production.js`

### Python
- Location: `src/python/`
- Entry: `inspector_server.py`

## 📝 Configuration Files

- `package.json` - Node.js dependencies and scripts
- `tsconfig.json` - TypeScript compiler configuration
- `.eslintrc.js` - ESLint rules
- `.prettierrc` - Prettier formatting rules
- `jest.config.js` - Jest testing configuration
- `.nvmrc` - Node.js version specification

## 🧪 Testing

Tests are organized by type:
- Unit tests: `tests/unit/`
- Integration tests: `tests/integration/`
- End-to-end tests: `tests/e2e/`

Run specific test suites:
```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 📚 Documentation

- API Documentation: `docs/api/`
- User Guides: `docs/guides/`
- Release Notes: `docs/releases/`
- Changelog: `CHANGELOG.md`

## 🐳 Docker Support

Docker configurations are in the `docker/` directory:
- `Dockerfile` - Python implementation
- `Dockerfile.node` - Node.js implementation

## 🤝 Contributing

See `CONTRIBUTING.md` for guidelines on contributing to this project.