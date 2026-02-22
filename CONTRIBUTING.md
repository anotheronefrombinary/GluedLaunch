# Contributing to GluedLaunch

Thank you for your interest in contributing to GluedLaunch! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to be respectful and constructive in all interactions. We are committed to providing a welcoming and inclusive experience for everyone.

## How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Use the bug report template** when creating a new issue
3. Include:
   - Steps to reproduce the bug
   - Expected vs actual behavior
   - Browser and wallet information
   - Network (Sepolia, etc.)
   - Screenshots if applicable

### Suggesting Features

1. **Check existing issues** for similar suggestions
2. **Use the feature request template** when creating a new issue
3. Describe:
   - The problem your feature solves
   - Your proposed solution
   - Any alternatives you've considered

### Pull Request Process

1. **Fork** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following the code style guidelines below
4. **Test your changes** locally:
   ```bash
   cd frontend
   npm run build
   npm run dev
   ```
5. **Commit** with a descriptive message:
   ```bash
   git commit -m "feat: add bonding curve visualization"
   ```
6. **Push** to your fork and open a Pull Request
7. Fill out the **PR template** completely

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or modifying tests
- `chore:` - Maintenance tasks

## Development Setup

### Prerequisites

- Node.js 18+
- npm
- A wallet with Sepolia testnet ETH
- WalletConnect Project ID

### Getting Started

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/GluedLaunch.git
cd GluedLaunch

# Install dependencies
cd frontend
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your WalletConnect Project ID

# Start dev server
npm run dev
```

### Project Structure

```
GluedLaunch/
├── contracts/          # Solidity smart contracts
│   ├── GluedLaunch.sol    # Factory & bonding curve
│   ├── GluedToken.sol     # Token with tax & vesting
│   └── interfaces/        # External interfaces
├── frontend/           # Next.js application
│   ├── src/
│   │   ├── app/           # Pages and API routes
│   │   ├── components/    # React components
│   │   ├── contracts/     # ABIs and addresses
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
│   └── public/            # Static assets
└── docs/               # Documentation
```

## Code Style Guidelines

### TypeScript/React

- Use TypeScript for all new files
- Use functional components with hooks
- Follow existing naming conventions:
  - Components: `PascalCase.tsx`
  - Hooks: `useCamelCase.ts`
  - Utilities: `camelCase.ts`
- Use Tailwind CSS for styling (inline classes)
- Keep components focused and single-responsibility

### Solidity

- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use NatSpec comments for all public functions
- Include `@notice`, `@param`, and `@return` tags
- Follow Checks-Effects-Interactions (CEI) pattern

### General

- No unnecessary dependencies
- Keep PRs focused on a single change
- Write descriptive variable and function names
- Comment complex logic, not obvious code

## Smart Contract Changes

If your contribution modifies smart contracts:

1. Clearly document what changed and why
2. Consider gas optimization impacts
3. Ensure the rug-proof mechanism is preserved
4. Update the ABI files in `frontend/src/contracts/` if needed
5. Note that redeployment will be needed

## Questions?

If you have questions about contributing, open a [Discussion](../../discussions) or create an issue with the `question` label.

Thank you for helping make token launches safer!
