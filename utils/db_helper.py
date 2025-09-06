from database.models import db

def add_record(record):
    try:
        db.session.add(record)
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        print(f"Error adding record: {e}")
        return False

def update_record():
    try:
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        print(f"Error updating record: {e}")
        return False

def delete_record(record):
    try:
        db.session.delete(record)
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting record: {e}")
        return False
