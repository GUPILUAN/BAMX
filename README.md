BAMX App
# Prerequisites 
- Node.js >= 18
- Python >= 3.10
- Expo account (for frontend testing)
---
# Project Structure
- backend/   # Flask API
- frontend/  # React Native + Expo app
# Getting Started
First, clone the repository anywhere in your device
```bash
git clone https://github.com/GUPILUAN/BAMX
cd BAMX
```
You will now have all the code from the project
---
# Dependency Installation
### Backend
To install the backend dependencies you can use this commands:
```bash
cd backend

# Using venv to create a virtual environment
python -m venv venv
source venv/bin/activate # Use this for macOS or Linux 
venv\Scripts\activate # Use this for Windows or Git bash

# There is a requirements text file in the backend folder, we shall use it to get all the dependencies 
pip install -r requirements.txt

#Start Flask server
export FLASK_APP=app # macOS or Linux
export FLASK_ENV=development
flask run 

set FLASK_APP=app # Windows
set FLASK_ENV=development
flask run
```
### Frontend
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
# Environment Variables
### Backend
Copy .env.example into .env for environment variables working on the backend.
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
### Frontend
Copy the flask server ip address (you get it when you start flask), make sure not to use the loopback ip address, (http://192.168.100.33:5000 e.g) and paste it in EXPO_PUBLIC_API_URL
```bash
EXPO_PUBLIC_API_URL=http://192.168.100.33:5000
EXPO_PUBLIC_ENV=development
```
---
# Database Initialization
In the backend environment variables you can find the SQLALCHEMY_DATABASE_URI it's using the URI for firebird+fdb (banco de alimentos legacy system), you can also use firebird-driver a newer version but not compatible
---
# Run the Project in Dev Mode
### Backend
```bash
cd backend
flask run
```
### Frontend
```bash
cd frontend 
npx expo start 
```
# Test Running
The tests are located in frontend/__tests__, the test must run perfectly to create pull requests
Use this command to run tests in the frontend.
```bash
npm run test
```
