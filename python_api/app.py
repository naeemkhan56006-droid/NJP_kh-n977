import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Database Configuration using Environment Variables
# Note: Render provides postgresql URL starting with postgres:// which must be updated to postgresql:// for SQLAlchemy
database_url = os.environ.get('DATABASE_URL', 'sqlite:///jobs.db')
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- Models ---
class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(100), nullable=True)
    salary = db.Column(db.String(50), nullable=True)
    posted_at = db.Column(db.DateTime, default=datetime.utcnow)
    applications = db.relationship('Application', backref='job', lazy=True)

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
    status = db.Column(db.String(20), default='Pending') # Pending, Accepted, Rejected
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "job_id": self.job_id,
            "applicant_name": self.applicant_name,
            "applicant_email": self.applicant_email,
            "status": self.status,
            "applied_at": self.applied_at.isoformat()
        }

# Create database tables
with app.app_context():
    db.create_all()

# --- Routes ---
@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "active", "message": "Job Portal API is running"}), 200

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    jobs = Job.query.order_by(Job.posted_at.desc()).all()
    return jsonify([job.to_dict() for job in jobs]), 200

@app.route('/api/jobs', methods=['POST'])
def create_job():
    data = request.get_json()
    if not data or not data.get('title') or not data.get('company'):
        return jsonify({"error": "Missing required fields (title, company)"}), 400
    
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

@app.route('/api/jobs/<int:id>/apply', methods=['POST'])
def apply_to_job(id):
    job = Job.query.get_or_404(id)
    data = request.get_json()
    if not data or not data.get('applicant_name') or not data.get('applicant_email'):
        return jsonify({"error": "Missing applicant info"}), 400
    
    app_entry = Application(
        job_id=id,
        applicant_name=data['applicant_name'],
        applicant_email=data['applicant_email'],
        resume_link=data.get('resume_link')
    )
    db.session.add(app_entry)
    db.session.commit()
    return jsonify(app_entry.to_dict()), 201

@app.route('/api/jobs/<int:id>', methods=['GET'])
def get_job(id):
    job = Job.query.get_or_404(id)
    return jsonify(job.to_dict()), 200

@app.route('/api/jobs/<int:id>', methods=['DELETE'])
def delete_job(id):
    job = Job.query.get_or_404(id)
    db.session.delete(job)
    db.session.commit()
    return jsonify({"message": "Job deleted"}), 200

if __name__ == '__main__':
    # Read port from environment variable for Render compatibility
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
