# Contributing to BAMX App

Thank you for your interest in contributing to the BAMX Food Bank App!
Your contributions help improve food management, storage monitoring, and overall efficiency across BAMX branches. Please follow this guide to ensure smooth collaboration.

---

## Table of Contents

1. [How to Contribute](#how-to-contribute)
2. [Reporting Issues](#reporting-issues)
3. [Feature Requests](#feature-requests)
4. [Code Style](#code-style)
5. [Development Setup](#development-setup)
6. [Branching and Workflow](#branching-and-workflow)
7. [Testing](#testing)
8. [Pull Requests](#pull-requests)
9. [Code of Conduct](#code-of-conduct)

---

## How to Contribute

Ways you can contribute:

- Reporting bugs or suggesting new features.
- Improving documentation.
- Writing or improving tests.
- Contributing code fixes or new features.

Please make sure your changes follow the guidelines below.

---

## Reporting Issues

When reporting an issue:

1. Check if the issue already exists.
2. Provide a clear and descriptive title.
3. Include steps to reproduce the issue.
4. Attach screenshots, logs, or relevant data if applicable.
5. Specify your environment (OS, Node.js version, Python version, Expo version, etc.).

---

## Feature Requests

- Describe the feature clearly.
- Explain the problem it solves or the improvement it brings.
- Include mockups or diagrams if relevant.
- Tag it with `[Feature Request]` in the issue title.

---

## Code Style

### Frontend (React Native + Expo)

- Use **TypeScript** if possible.
- Use **ESLint** and **Prettier** for formatting.
- Functional components with hooks are preferred.
- Keep components modular and reusable.

### Backend (Python + Flask)

- Follow **PEP8** style guide.
- Keep functions and classes small and single-responsibility.
- Use **Flask blueprints** for modular structure.
- Use virtual environments (`venv`) for dependencies.
- Write docstrings for all functions and classes.
- Database: Firebird (connection setup under investigation, see `.env.example` for placeholders).

---

## Development Setup

### Frontend

```bash
# Clone repository
git clone https://github.com/your-org/bamx-app.git
cd bamx-app

# Install dependencies
npm install

# Start Expo development server
npm start
```

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Start Flask server
export FLASK_APP=app
export FLASK_ENV=development  # optional for debug
flask run
```

> Database connection: Firebird. See `.env.example` for placeholders.
> Ensure your local Firebird server is running and credentials match `.env`.

---

## Branching and Workflow

- `main` - stable production-ready code.
- `develop` - latest development changes.
- Feature branches: `feature/<description>`.
- Bugfix branches: `bugfix/<description>`.

> Always create a new branch from `develop`.

---

## Testing

- Write tests for all new features and bug fixes.
- Frontend: use **Jest** and **React Native Testing Library**.
- Backend: use **pytest** or **unittest**.
- Run tests before submitting a PR:

```bash
# Frontend
npm test

# Backend
pytest
```

- Ensure all tests pass.

---

## Pull Requests

- Ensure your branch is up-to-date with `develop`.
- Provide a clear title and description.
- Link related issues using `#issue_number`.
- Keep PRs focused on a single feature or fix.
- Request reviews from at least one team member.

---

## Code of Conduct

We follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/3/0/code_of_conduct/).
Respectful communication and collaboration are required at all times.

---

Thank you for helping make the BAMX App better!
