from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from database.models import db
from routes.auth import auth_bp
from routes.student import student_bp
from routes.teacher import teacher_bp
from routes.parents import parent_bp
from routes.admin import admin_bp
from sqlalchemy import text

def create_app():
    app = Flask(__name__)

    # ✅ Fix: Corrected typo 'config.pyg' to 'config'
    app.config.from_object('config')

    # Enable CORS
   
    CORS(app, origins="http://localhost:5173")
    
    # ✅ Fix: JWT setup spelling corrected
    app.config['JWT_SECRET_KEY'] = 'a74567jhgf345678uygfertyhasha37fbwiq'

    jwt = JWTManager(app)

    # Initialize database
    db.init_app(app)

    # Register route blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(teacher_bp)
    app.register_blueprint(parent_bp)
    app.register_blueprint(admin_bp)

    # Root route
    from sqlalchemy import text

    @app.route('/check-db')
    def check_db():
        result = db.session.execute(text("SELECT DATABASE()")).scalar()
        return jsonify({"database_in_use": result})

    @app.route('/')
    def index():
        return jsonify({"message": "Attendance System Backend Running"})

    return app
    

if __name__ == '__main__':
    app = create_app()

    # Create tables within app context
    with app.app_context():
        db.create_all()

    # Run the app
    print("✅ Connected to:", app.config['SQLALCHEMY_DATABASE_URI'])

    app.run(debug=True)

