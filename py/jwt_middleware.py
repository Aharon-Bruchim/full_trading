import os
import jwt
from fastapi import Request, HTTPException
from functools import wraps

JWT_SECRET = os.getenv('JWT_SECRET', 'your-super-secret-jwt-key-change-this')

def verify_jwt(token: str) -> dict:
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return decoded
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token expired')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Invalid token')

async def jwt_middleware(request: Request):
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        raise HTTPException(status_code=401, detail='No token provided')
    
    if not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Invalid authorization header')
    
    token = auth_header.replace('Bearer ', '')
    
    user = verify_jwt(token)
    
    request.state.user = user
    
    return user
