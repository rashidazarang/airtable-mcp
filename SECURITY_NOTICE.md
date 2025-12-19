# Security Notice

## Important: API Token Rotation Required

If you have been using or testing this repository before January 2025, please note that hardcoded API tokens were previously included in test files. These have been removed and replaced with environment variable requirements.

### Actions Required:

1. **If you used the exposed tokens**: 
   - These tokens have been revoked and are no longer valid
   - You must use your own Airtable API credentials

2. **For all users**:
   - Never commit API tokens to version control
   - Always use environment variables or secure configuration files
   - Add `.env` to your `.gitignore` file

### Secure Configuration

Set your credentials using environment variables:

```bash
export AIRTABLE_TOKEN="your_personal_token_here"
export AIRTABLE_BASE_ID="your_base_id_here"
```

Or create a `.env` file (never commit this):

```env
AIRTABLE_TOKEN=your_personal_token_here
AIRTABLE_BASE_ID=your_base_id_here
```

### Reporting Security Issues

If you discover any security vulnerabilities, please report them to:
- Open an issue on GitHub (without including sensitive details)
- Contact the maintainer directly for sensitive information

Thank you for helping keep this project secure.