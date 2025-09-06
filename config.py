import os
from urllib.parse import quote_plus

DEBUG = True

# Secret Key
SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key'  # Replace with a strong secret in production

# MySQL Database Config
DB_USER = 'root'
DB_PASSWORD = 'password@2123'
DB_PASSWORD_ENCODED = quote_plus(DB_PASSWORD)  # Encode special characters like @
DB_HOST = '127.0.0.1'
DB_PORT = '3306'  # Make sure your MySQL is running on this port
DB_NAME = 'attendancesystems'

# SQLAlchemy DB URI (with pymysql)
SQLALCHEMY_DATABASE_URI = f'mysql+pymysql://{DB_USER}:{DB_PASSWORD_ENCODED}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
SQLALCHEMY_TRACK_MODIFICATIONS = False

# JWT Config
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your-jwt-secret'  # Replace with a strong key in production

