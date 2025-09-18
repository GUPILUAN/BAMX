from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

cors: CORS = CORS()
jwt: JWTManager = JWTManager()
db: SQLAlchemy = SQLAlchemy()
