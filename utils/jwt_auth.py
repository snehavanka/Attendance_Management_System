import jwt
import os
from datetime import datetime, timedelta
from flask import request

SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key'

def generate_token(user_id, role, expires_in=3600):
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(seconds=expires_in)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def decode_token(token):
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return decoded
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def get_user_from_request():
    token = request.headers.get('Authorization')
    if not token:
        return None
    if token.startswith('Bearer '):
        token = token.split(' ')[1]
    return decode_token(token)
