import os
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, timezone

app = Flask(__name__)
CORS(app)

# Database Configuration (PostgreSQL Support)
db_uri = os.environ.get('DATABASE_URL')
if db_uri and db_uri.startswith("postgres://"):
    db_uri = db_uri.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_uri or 'sqlite:///jobs.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Database Models
class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100))
    posted_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    applications = db.relationship('Application', backref='job', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {"id": self.id, "title": self.title, "company": self.company, "location": self.location}

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    applied_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {"name": self.name, "email": self.email, "job_id": self.job_id}

# Create tables
with app.app_context():
    db.create_all()

# --- Routes ---
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/jobs', methods=['GET', 'POST'])
def handle_jobs():
    if request.method == 'POST':
        data = request.get_json()
        new_job = Job(title=data['title'], company=data['company'], location=data.get('location'))
        db.session.add(new_job)
        db.session.commit()
        return jsonify(new_job.to_dict()), 201
    jobs = Job.query.order_by(Job.posted_at.desc()).all()
    return jsonify([j.to_dict() for j in jobs])

@app.route('/api/jobs/<int:id>/apply', methods=['POST'])
def apply(id):
    data = request.get_json()
    new_app = Application(job_id=id, name=data['name'], email=data['email'])
    db.session.add(new_app)
    db.session.commit()
    return jsonify({"message": "Success"}), 201

@app.route('/api/applications', methods=['GET'])
def get_apps():
    apps = Application.query.order_by(Application.applied_at.desc()).all()
    return jsonify([a.to_dict() for a in apps])

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
