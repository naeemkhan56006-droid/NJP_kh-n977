import os
import uuid
from datetime import datetime, timezone, timedelta
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Configuration
db_uri = os.environ.get('DATABASE_URL')
if db_uri and db_uri.startswith("postgres://"):
    db_uri = db_uri.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_uri or 'sqlite:///njp_v2.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret-key-njp-global')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB limit

db = SQLAlchemy(app)
jwt = JWTManager(app)

# Ensure upload directory exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='candidate')  # candidate, employer, admin
    name = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {"id": self.id, "email": self.email, "role": self.role, "name": self.name}

class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100))
    description = db.Column(db.Text)
    salary = db.Column(db.String(50))
    job_type = db.Column(db.String(50))
    category = db.Column(db.String(50))
    employer_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    posted_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    applications = db.relationship('Application', backref='job', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id, "title": self.title, "company": self.company, 
            "location": self.location, "description": self.description,
            "salary": self.salary, "job_type": self.job_type, "category": self.category,
            "posted_at": self.posted_at.isoformat()
        }

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), default='applied')  # applied, screening, interview, rejected, offer
    resume_path = db.Column(db.String(255))
    ai_score = db.Column(db.Integer)
    applied_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        user = User.query.get(self.user_id)
        return {
            "id": self.id, "job_id": self.job_id, "user_id": self.user_id,
            "candidate_name": user.name if user else "Unknown",
            "candidate_email": user.email if user else "Unknown",
            "status": self.status, "resume_url": f"/uploads/{self.resume_path}" if self.resume_path else None,
            "ai_score": self.ai_score, "applied_at": self.applied_at.isoformat()
        }

with app.app_context():
    db.create_all()

# Auth Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "User already exists"}), 400
    
    hashed_pass = generate_password_hash(data['password'])
    new_user = User(
        email=data['email'], 
        password_hash=hashed_pass, 
        role=data.get('role', 'candidate'),
        name=data.get('name')
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and check_password_hash(user.password_hash, data['password']):
        token = create_access_token(identity=str(user.id))
        return jsonify({"token": token, "user": user.to_dict()}), 200
    return jsonify({"message": "Invalid credentials"}), 401

# Job Routes
@app.route('/api/jobs', methods=['GET', 'POST'])
def handle_jobs():
    if request.method == 'POST':
        # In V2.0 we could protect this with @jwt_required(), but for quick test let's keep it open
        data = request.get_json()
        new_job = Job(**data)
        db.session.add(new_job)
        db.session.commit()
        return jsonify(new_job.to_dict()), 201
    
    query = Job.query
    cat = request.args.get('category')
    if cat: query = query.filter(Job.category == cat)
    search = request.args.get('search')
    if search: query = query.filter(Job.title.ilike(f'%{search}%') | Job.company.ilike(f'%{search}%'))
    
    jobs = query.order_by(Job.posted_at.desc()).all()
    return jsonify([j.to_dict() for j in jobs]), 200

# Application Routes
@app.route('/api/jobs/<int:id>/apply', methods=['POST'])
@jwt_required()
def apply(id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Mock AI Matching Heuristic
    job = Job.query.get(id)
    ai_score = 75 # Standard base score
    if user.name and any(word in job.title.lower() for word in user.name.lower().split()):
        ai_score += 15 # Simple name/title match simulation
    
    resume_filename = None
    if 'resume' in request.files:
        file = request.files['resume']
        if file.filename != '':
            filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            resume_filename = filename

    new_app = Application(
        job_id=id, 
        user_id=current_user_id, 
        resume_path=resume_filename,
        ai_score=min(ai_score, 99)
    )
    db.session.add(new_app)
    db.session.commit()
    return jsonify({"message": "Application successful", "score": new_app.ai_score}), 201

@app.route('/api/applications', methods=['GET'])
@jwt_required()
def get_apps():
    # Only employers can see all apps in V2 logic (simplified here)
    apps = Application.query.order_by(Application.applied_at.desc()).all()
    return jsonify([a.to_dict() for a in apps]), 200

@app.route('/api/applications/<int:id>/status', methods=['PATCH'])
@jwt_required()
def update_status(id):
    data = request.get_json()
    app_record = Application.query.get(id)
    if not app_record: return jsonify({"message": "Not found"}), 404
    app_record.status = data['status']
    db.session.commit()
    return jsonify({"message": "Status updated"}), 200

# Serve Uploaded Resumes
@app.route('/uploads/<filename>')
def serve_resume(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
