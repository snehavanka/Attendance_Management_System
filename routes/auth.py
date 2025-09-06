
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity, get_jwt, JWTManager
)
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText

from database.models import User
from database import db  # Your SQLAlchemy db instance

auth_bp = Blueprint('auth', __name__)
CORS(auth_bp)

serializer = URLSafeTimedSerializer('sdfgh345gh09876edfgj')  # Change to strong secret

# For JWT token revocation (logout)
jwt = JWTManager()

# Simple in-memory token blacklist (for demonstration; use persistent storage in prod)
token_blacklist = set()

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    return jti in token_blacklist

# --------------------- LOGIN ---------------------------
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"msg": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
    return jsonify(token=access_token, role=user.role), 200

# --------------------- LOGOUT --------------------------
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    token_blacklist.add(jti)
    return jsonify({"msg": "Logged out successfully"}), 200

# --------------------- FORGOT PASSWORD -----------------
@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    email = request.json.get('email')
    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"msg": "User not found"}), 404

    token = serializer.dumps(email, salt='reset-password')
    reset_link = f"http://localhost:5173/reset-password/{token}"

    subject = "Reset Your Password"
    body = f"""
Hi {user.name},

We received a request to reset your password.
Click the link below to reset your password:

{reset_link}

If you didn't request this, please ignore this email.

Thanks,
Your Attendance System Team
"""

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = 'snehavanka2006@gmail.com'  # Replace with your sender email
    msg['To'] = email

    try:
        smtp = smtplib.SMTP('smtp.gmail.com', 587)
        smtp.starttls()
        smtp.login('snehavanka2006@gmail.com', 'xwtf zgxr gkls ysim')  # Use your Gmail app password here
        smtp.send_message(msg)
        smtp.quit()
        return jsonify({"msg": "Reset email sent"}), 200
    except Exception as e:
        return jsonify({"msg": "Email sending failed", "error": str(e)}), 500

@auth_bp.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    try:
        email = serializer.loads(token, salt='reset-password', max_age=3600)
    except SignatureExpired:
        return jsonify({"msg": "The reset link has expired."}), 400
    except BadSignature:
        return jsonify({"msg": "Invalid reset token."}), 400

    data = request.get_json()
    new_password = data.get('password')

    if not new_password:
        return jsonify({"msg": "Password is required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "User not found"}), 404

    print(f"[DEBUG] Old password (hash): {user.password}")
    user.password = generate_password_hash(new_password)
    print(f"[DEBUG] New password (hash): {user.password}")
    db.session.commit()
    try:
        db.session.commit()
        print("✅ Commit successful!")
    except Exception as e:
        db.session.rollback()
        print("❌ Commit failed:", e)
        return jsonify({"msg": "Commit failed", "error": str(e)}), 500

    return jsonify({"msg": "Password has been reset successfully"}), 200
