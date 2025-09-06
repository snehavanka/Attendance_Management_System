from app import create_app
from database.models import db, User
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    users = User.query.all()
    for user in users:
        if not user.password.startswith('scrypt:'):
            print(f"Hashing password for {user.email} (was: {user.password})")
            user.password = generate_password_hash(user.password)
    db.session.commit()
    print("✅ All plain-text passwords have been hashed.")
