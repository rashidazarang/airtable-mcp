# Contributing to Airtable MCP

Thank you for your interest in contributing to Airtable MCP! This guide will help you get started with contributing to this project.

## Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rashidazarang/airtable-mcp.git
   cd airtable-mcp
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment setup**:
   Create a `.env` file in the root directory with your Airtable API token:
   ```
   AIRTABLE_PERSONAL_ACCESS_TOKEN=your_token_here
   AIRTABLE_BASE_ID=optional_default_base_id
   ```

## Running the Server

You can run the server directly with Python:

```bash
python3.10 inspector_server.py --token "your_token" --base "your_base_id"
```

Or through the Node.js wrapper:

```bash
node index.js --token "your_token" --base "your_base_id"
```

## Testing

Run the test client to verify your Airtable API access:

```bash
python3.10 test_client.py
```

## Pull Request Process

1. **Fork the Repository** on GitHub.

2. **Create a Branch** for your feature or bugfix.

3. **Make Changes** according to the project style guidelines.

4. **Test Thoroughly** to ensure your changes work as expected.

5. **Document Changes** in the README.md if necessary.

6. **Submit a Pull Request** to the main repository.

## Coding Guidelines

- Follow Python PEP 8 style guidelines
- Write docstrings for all functions, classes, and modules
- Include type hints for function parameters and return values
- Write clear commit messages

## Adding New Tools

When adding new Airtable API tools:

1. Add the tool function to `inspector_server.py` using the `@app.tool()` decorator
2. Define clear parameter and return types
3. Provide a descriptive docstring for the tool
4. Update the inspector.py file to include the new tool in the JSON schema
5. Add error handling for API requests
6. Update the README.md to document the new tool

## License

By contributing to this project, you agree that your contributions will be licensed under the project's MIT License. 