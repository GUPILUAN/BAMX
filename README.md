# BAMX App

## Status

### Backend

![Backend Tests](https://github.com/GUPILUAN/BAMX/actions/workflows/backend-tests.yml/badge.svg?event=pull_request)
[![Backend Coverage](https://codecov.io/gh/GUPILUAN/BAMX/branch/main/graph/badge.svg?flag=backend)](https://codecov.io/gh/GUPILUAN/BAMX)

### Frontend

![Frontend Tests](https://github.com/GUPILUAN/BAMX/actions/workflows/frontend-tests.yml/badge.svg?event=pull_request)
[![Frontend Coverage](https://codecov.io/gh/GUPILUAN/BAMX/branch/main/graph/badge.svg?flag=frontend)](https://codecov.io/gh/GUPILUAN/BAMX)

## Prerequisites

- Node.js >= 18
- Python >= 3.10
- Expo account (for frontend testing)

---

## Project Structure

- backend/ # Flask API
- frontend/ # React Native + Expo app

---

## Getting Started

First, clone the repository anywhere in your device

```bash
git clone https://github.com/GUPILUAN/BAMX
cd BAMX
```

You will now have all the code from the project

---

## Dependency Installation

### Backend installation

To install the backend dependencies you can use this commands:

```bash
cd backend

# Using venv to create a virtual environment
python -m venv venv
source venv/bin/activate # Use this for macOS or Linux
venv\Scripts\activate # Use this for Windows or Git bash

# There is a requirements text file in the backend folder, we shall use it to get all the dependencies
pip install -r requirements.txt

```

> [!NOTE]
> If you are using Visual Studio Code as your IDE, you can easily create and select a virtual environment and install depedencies without using the terminal.
>
> 1. Open VS Code in BAMX folder.
> 2. Press Command + Shift + P (for Mac) or Ctrl + Shift + P (for Windows/ Linux) to open the Command Palette.
> 3. Type “Python: Select Interpreter” and press Enter.
> 4. In the list, select Create Virtual Environment.
> 5. Choose .venv as the environment name and select the Python version.
> 6. When prompted, select the `requirements.txt` file located in the backend directory. → VS Code will automatically install all dependencies.

### Frontend installation

You can open another console to have the frontend running...
To install the frontend dependencies you can use this commands:

```bash
cd frontend

# Install node dependencies
npm install

# Start Expo development server
npx expo start # It will ask you your email and your password, type them

# If authentication fails you can also use
npx expo login -u [youremail] -p [yourpassword]
```

---

## Environment Variables

### Backend environment variables

Copy .env.example into .env (you need to create this file) for environment variables working on the backend.

```bash
# --- Flask ---
FLASK_ENV=development

# --- JWT ---
JWT_SECRET_KEY=super-jwt-secret
JWT_ACCESS_TOKEN_EXPIRES=3600

# --- Database (Firebird) ---
# Format: firebird+fdb://usuario:password@host:port/route/base.fdb
# using fdb driver  firebird+fdb://sysdba:masterkey@localhost///home/testuser/projects/databases/my_project.fdb
# using firebird-driver firebird+firebird://sysdba:masterkey@localhost///home/testuser/projects/databases/my_project.fdb
SQLALCHEMY_DATABASE_URI=firebird+fdb://sysdba:masterkey@localhost///home/testuser/projects/databases/my_project.fdb

SQLALCHEMY_ECHO=false
SQLALCHEMY_TRACK_MODIFICATIONS=false
```

### Frontend environment variables

Copy the flask server ip address (you get it when you start flask), make sure not to use the loopback ip address, (<http://192.168.100.33:5000> e.g) and paste it in EXPO_PUBLIC_API_URL

```bash
EXPO_PUBLIC_API_URL=http://your_computer_ip:5000
EXPO_PUBLIC_ENV=development
```

---

## Database Initialization

In the backend environment variables you can find the SQLALCHEMY_DATABASE_URI it's using the URI for firebird+fdb (banco de alimentos legacy system)

You must have installed Firebird Server. BAMX uses Firebird 2.5. You can found it here: [Firebird(2.5)](https://firebirdsql.org/en/firebird-2-5/)

> [!WARNING]
> For Mac users: Apple 'M' Family Chips are not supported

```bash
# --- Database (Firebird) ---
# Format: firebird+fdb://usuario:password@host:port/route/base.fdb
# using fdb driver  firebird+fdb://sysdba:masterkey@localhost///home/testuser/projects/databases/my_project.fdb
# using firebird-driver firebird+firebird://sysdba:masterkey@localhost///home/testuser/projects/databases/my_project.fdb
SQLALCHEMY_DATABASE_URI=firebird+fdb://sysdba:masterkey@localhost///home/testuser/projects/databases/my_project.fdb
```

---

## Run the Project in Dev Mode

### Backend dev mode

```bash
cd backend
#Start Flask server
export FLASK_APP=app # macOS or Linux
export FLASK_ENV=development
flask run

set FLASK_APP=app # Windows
set FLASK_ENV=development
flask run
```

or

```bash
cd backend
python run.py # Try python3 if that line does not work
```

### Frontend dev mode

```bash
cd frontend
npx expo start
```

---

## Test Running

The tests are located in frontend/**tests**, the test must run perfectly to create pull requests

- Use this command to run tests in the frontend.

```bash
cd frontend
npm run test
```

- Use this command to run tests in the backend

```bash
cd backend
pytest
```
