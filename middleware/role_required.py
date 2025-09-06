from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt

def role_required(allowed_roles):
    """
    Decorator to restrict access to routes based on user roles.

    :param allowed_roles: list or set of roles that can access the route
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # Ensure a valid JWT is present
            verify_jwt_in_request()

            # Get JWT claims
            claims = get_jwt()
            user_role = claims.get('role')

            if user_role not in allowed_roles:
                return jsonify({"msg": "Access forbidden: insufficient permissions"}), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator
