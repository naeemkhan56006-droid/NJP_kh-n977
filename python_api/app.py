import os
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, timezone
import threading
from sqlalchemy import text

# --- App Setup ---
app = Flask(__name__)
CORS(app)

# --- Database Configuration ---
# Render/Postgres setup ke liye database_url ko adjust karna zaroori hai
database_url = os.environ.get('DATABASE_URL', 'sqlite:///jobs.db')
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {"pool_pre_ping": True}

db = SQLAlchemy(app)

# --- Database Models ---
class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(100), nullable=True)
    salary = db.Column(db.String(50), nullable=True)
    posted_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    # Cascade delete ka matlab hai job delete hui to applications bhi delete ho jayengi
    applications = db.relationship('Application', backref='job', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "company": self.company,
            "description": self.description,
            "location": self.location,
            "salary": self.salary,
            "posted_at": self.posted_at.isoformat(),
            "application_count": len(self.applications)
        }

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'), nullable=False)
    applicant_name = db.Column(db.String(100), nullable=False)
    applicant_email = db.Column(db.String(100), nullable=False)
    resume_link = db.Column(db.String(200), nullable=True)
    status = db.Column(db.String(20), default='Pending')
    applied_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "job_id": self.job_id,
            "applicant_name": self.applicant_name,
            "applicant_email": self.applicant_email,
            "status": self.status,
            "applied_at": self.applied_at.isoformat()
        }

# --- Database Initialization (Background Thread) ---
def init_db():
    try:
        with app.app_context():
            db.create_all()
            print("Database checked/initialized.")
    except Exception as e:
        print(f"Database error during init: {e}")

threading.Thread(target=init_db, daemon=True).start()

# --- Routes (Endpoints) ---

# 1. Frontend Route (Jo index.html dikhayega)
@app.route('/', methods=['GET'])
def index():
    # Yeh aapke python_api folder ke andar index.html dhoondega
    return send_from_directory('.', 'index.html')

# 2. API Health & DB Check
@app.route('/db-check', methods=['GET'])
def db_check():
    try:
        db.session.execute(text('SELECT 1'))
        return jsonify({"status": "connected", "database": "PostgreSQL/SQLite"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# 3. Get All Jobs
@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    try:
        jobs = Job.query.order_by(Job.posted_at.desc()).all()
        return jsonify([job.to_dict() for job in jobs]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 4. Create a Job (POST Request)
@app.route('/api/jobs', methods=['POST'])
def create_job():
    data = request.get_json()
    if not data or not data.get('title') or not data.get('company'):
        return jsonify({"error": "Title and Company are required"}), 400
    
    try:
        new_job = Job(
            title=data['title'],
            company=data['company'],
            description=data.get('description'),
            location=data.get('location'),
            salary=data.get('salary')
        )
        db.session.add(new_job)
        db.session.commit()
        return jsonify(new_job.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# 5. Get Single Job
@app.route('/api/jobs/<int:id>', methods=['GET'])
def get_job(id):
    job = Job.query.get_or_404(id)
    return jsonify(job.to_dict()), 200

# 6. Apply to Job
@app.route('/api/jobs/<int:id>/apply', methods=['POST'])
def apply_to_job(id):
    job = Job.query.get_or_404(id)
    data = request.get_json()
    if not data or not data.get('applicant_name') or not data.get('applicant_email'):
        return jsonify({"error": "Name and Email are required"}), 400
    
    try:
        new_app = Application(
            job_id=id,
            applicant_name=data['applicant_name'],
            applicant_email=data['applicant_email'],
            resume_link=data.get('resume_link')
        )
        db.session.add(new_app)
        db.session.commit()
        return jsonify(new_app.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# 7. Delete Job
@app.route('/api/jobs/<int:id>', methods=['DELETE'])
def delete_job(id):
    job = Job.query.get_or_404(id)
    try:
        db.session.delete(job)
        db.session.commit()
        return jsonify({"message": "Job and applications deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# --- Entry Point ---
if __name__ == '__main__':
    # Render ke environment variable 'PORT' ko use karna lazmi hai
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
