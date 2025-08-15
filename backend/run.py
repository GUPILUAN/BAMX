from app import create_app
import os
from flask import Flask

config_name: str = os.getenv("FLASK_ENV", "development")
app: Flask = create_app(config_name)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
