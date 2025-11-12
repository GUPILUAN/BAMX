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
- Java >= 21
- Expo account (for frontend testing)

---

## Project Structure

- backend/ # Spring Boot REST API
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
```

And ensure you have Maven installed, then run:

```bash
mvn clean install
```

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
JWT_SECRET=jwt_secret_key_example_please_change_this_to_a_secure_random_value
ACCESS_TOKEN_EXPIRATION=600000
REFRESH_TOKEN_EXPIRATION=2592000000
APP_HOST_URL=http://api_url:8080
APP_IMAGES_PATH=C:/Program Files (x86)/Common Files/Aspel/Sistemas Aspel/SAE8.00/Empresa01/Imagenes/
DATABASE_PORT_EMPRESA=3050
DATABASE_HOST_EMPRESA=localhost
DATABASE_PATH_EMPRESA=C:/Program Files (x86)/Common Files/Aspel/Sistemas Aspel/SAE8.00/Ejemplos/Ejemplos.fdb
DATABASE_USERNAME_EMPRESA=sysdba
DATABASE_PASSWORD_EMPRESA=masterkey
DATABASE_PORT_AUTH=3050
DATABASE_HOST_AUTH=localhost
DATABASE_PATH_AUTH=C:/Program Files (x86)/Common Files/Aspel/Perfiles/PERFILES.FDB
DATABASE_USERNAME_AUTH=sysdba
DATABASE_PASSWORD_AUTH=masterkey
```

Then you must run this command to load the environment variables, use a bash terminal (you must be in the backend folder and every time you open a new terminal):

```bash
source loadenv.sh
```

### Frontend environment variables

Copy the flask server ip address (you get it when you start flask), make sure not to use the loopback ip address, (<http://192.168.100.33:5000> e.g) and paste it in EXPO_PUBLIC_API_URL

```bash
EXPO_PUBLIC_API_URL=http://your_computer_ip:5000
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_MQTT_BROKER_URL=wss://localhost:1883/mqtt
EXPO_PUBLIC_MQTT_USERNAME=user
EXPO_PUBLIC_MQTT_PASSWORD=password
```

---

## Database Initialization

You must have installed Firebird Server. BAMX uses Firebird 2.5. You can found it here: [Firebird(2.5)](https://firebirdsql.org/en/firebird-2-5/)

> [!WARNING]
> For Mac users: Apple 'M' Family Chips are not supported

In the backend environment variables you can find 2 diferent variables for database connection:

- **DATABASE_PATH_EMPRESA**: Path to the empresa database (where inventory of banco de alimentos is stored)
- **DATABASE_PATH_AUTH**: Path to the auth database (where aspel profiles are stored)

The default values are set to the example databases that comes with Aspel SAE installation. You can change them to your own database paths. It is using the sysdba user with masterkey password by default, you can change it too if needed.

The default port is 3050 because is the default port for Firebird and the host is localhost, you can change them too if needed.

## Run the Project in Dev Mode

### Backend dev mode

```bash
cd backend
source loadenv.sh # if you open a new terminal or haven't loaded the env variables yet
mvn spring-boot:run
```

### Frontend dev mode

```bash
cd frontend
npx expo start
```

> [!IMPORTANT]
> For both the backend and frontend you must ensure that the environment variables are loaded correctly.
> Find more info about environment variables in the [Environment Variables](#environment-variables) section.

---

## Test Running

- Use this command to run tests in the frontend.

```bash
cd frontend
npm run test
```

- Use this command to run tests in the backend

```bash
cd backend
mvn test
```
