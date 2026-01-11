import os
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone

app = Flask(__name__)
CORS(app)

# Database Setup
import os
basedir = os.path.abspath(os.path.dirname(__file__))
# Ensure instance folder exists
try:
    os.makedirs(os.path.join(basedir, 'instance'), exist_ok=True)
except OSError:
    pass

db_path = os.path.join(basedir, 'instance', 'jobs.db')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or 'sqlite:///' + db_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100))
    description = db.Column(db.Text)
    requirements = db.Column(db.Text)
    benefits = db.Column(db.Text)
    salary = db.Column(db.String(50))
    job_type = db.Column(db.String(50))  # Full-time, Part-time, Contract, etc.
    category = db.Column(db.String(50))  # Tech, Health, Finance, etc.
    company_logo = db.Column(db.String(255))
    deadline = db.Column(db.DateTime)
    posted_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    applications = db.relationship('Application', backref='job', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id, 
            "title": self.title, 
            "company": self.company, 
            "location": self.location,
            "description": self.description,
            "requirements": self.requirements,
            "benefits": self.benefits,
            "salary": self.salary,
            "job_type": self.job_type,
            "category": self.category,
            "company_logo": self.company_logo,
            "deadline": self.deadline.isoformat() if self.deadline else None,
            "posted_at": self.posted_at.isoformat() if self.posted_at else None
        }

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default='Applied') # Applied, Review, Interview, Offer, Rejected
    applied_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name, 
            "email": self.email, 
            "job_id": self.job_id, 
            "status": self.status,
            "applied_at": self.applied_at.isoformat(),
            "job_title": self.job.title if self.job else "Unknown" # Include job details
        }

class News(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50))
    image_url = db.Column(db.String(255))
    published_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "category": self.category,
            "image_url": self.image_url,
            "published_at": self.published_at.isoformat()
        }

with app.app_context():
    # Force recreation for schema change in dev
    db.drop_all()
    db.create_all()
    
    print(f"Database created at: {db_path}")
    
    # Pre-populate some news
    if News.query.count() == 0:
        sample_news = [
            News(title="AI Job Market Surges in 2026", content="New data shows a 45% increase in AI-related roles. This growth is driven by the rapid adoption of agentic systems across all sectors of the economy, including healthcare and finance.", category="Career", image_url="https://images.unsplash.com/photo-1677442136019-21780ecad995"),
            News(title="Remote Work 2.0: The Future of AGENTIC Coding", content="How AI agents are changing the landscape of development. Teams are now using AI-driven orchestration to manage complex microservices with minimal human overhead.", category="Tech", image_url="https://images.unsplash.com/photo-1498050108023-c5249f4df085"),
            News(title="Top 5 Skills for FinTech in 2026", content="Blockchain and Python remain crucial for financial technology. Modern fintech firms are prioritizing candidates who can build robust, AI-integrated trading platforms.", category="Finance", image_url="https://images.unsplash.com/photo-1551288049-bebda4e38f71")
        ]
        db.session.add_all(sample_news)
        print("Added sample news")
    
    # Create tables
    db.create_all()

    # Seed data if empty
    if not Job.query.first():
        print("Seeding database from jobs.json...")
        
        try:
            import json
            import os
            
            # Load jobs from JSON file
            json_path = os.path.join(os.path.dirname(__file__), 'jobs.json')
            if os.path.exists(json_path):
                with open(json_path, 'r', encoding='utf-8') as f:
                    jobs_data = json.load(f)
                    
                for job_data in jobs_data:
                    job = Job(
                        title=job_data['title'],
                        company=job_data['company'],
                        location=job_data['location'],
                        salary=job_data['salary'],
                        job_type=job_data['job_type'],
                        category=job_data['category'],
                        description=job_data['description']
                    )
                    db.session.add(job)
                
                db.session.commit()
                print(f"Added {len(jobs_data)} premium jobs from jobs.json")
            else:
                print("jobs.json not found, skipping job seeding.")
                
        except Exception as e:
            print(f"Error seeding jobs: {e}")

    # Seed News (Keep existing simple logic or update if needed)
    if not News.query.first():
        news_items = [
            News(title="Global Hiring Surge", content="Top firms are expanding remotely."),
            News(title="AI in Executive Search", content="How AI is matching elite talent.")
        ]
        db.session.add_all(news_items)
        db.session.commit()
        print("Added sample news")

    print("Database seeding completed")

    db.session.commit()
    print("Database seeding completed")

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/news', methods=['GET'])
def get_news():
    try:
        news = News.query.order_by(News.published_at.desc()).all()
        return jsonify([n.to_dict() for n in news]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if User.query.filter_by(username=data.get('username')).first():
            return jsonify({"error": "Username taken"}), 400
        
        user = User(username=data['username'], email=data['email'])
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = User.query.filter((User.username == data['username']) | (User.email == data['username'])).first()
        if user and user.check_password(data['password']):
            return jsonify({"message": "Login successful", "username": user.username, "isAdmin": "admin" in user.username.lower()}), 200
        return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/jobs', methods=['GET', 'POST'])
def handle_jobs():
    try:
        if request.method == 'POST':
            data = request.get_json()
            new_job = Job(
                title=data['title'], 
                company=data['company'], 
                location=data.get('location'),
                description=data.get('description'),
                requirements=data.get('requirements'),
                benefits=data.get('benefits'),
                salary=data.get('salary'),
                job_type=data.get('job_type'),
                category=data.get('category'),
                company_logo=data.get('company_logo'),
                deadline=datetime.fromisoformat(data['deadline']) if data.get('deadline') else None
            )
            db.session.add(new_job)
            db.session.commit()
            return jsonify(new_job.to_dict()), 201
        
        # Enhanced Filter Logic
        query = Job.query
        cat = request.args.get('category')
        if cat:
            query = query.filter(Job.category == cat)
        
        jt = request.args.get('job_type')
        if jt:
            query = query.filter(Job.job_type == jt)
            
        location = request.args.get('location')
        if location:
            query = query.filter(Job.location.ilike(f'%{location}%'))

        search = request.args.get('search')
        if search:
            search_pattern = f'%{search}%'
            query = query.filter(
                Job.title.ilike(search_pattern) | 
                Job.company.ilike(search_pattern) |
                Job.description.ilike(search_pattern) |
                Job.requirements.ilike(search_pattern)
            )

        jobs = query.order_by(Job.posted_at.desc()).all()
        return jsonify([j.to_dict() for j in jobs]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/jobs/<int:id>/apply', methods=['POST'])
def apply(id):
    try:
        data = request.get_json()
        if not data.get('name') or not data.get('email'):
            return jsonify({"error": "Name and email are required"}), 400
        
        new_app = Application(job_id=id, name=data['name'], email=data['email'])
        db.session.add(new_app)
        db.session.commit()
        return jsonify({"message": "Success"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/applications', methods=['GET'])
def get_apps():
    try:
        apps = Application.query.order_by(Application.applied_at.desc()).all()
        return jsonify([a.to_dict() for a in apps]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/candidates', methods=['GET'])
def get_candidates():
    try:
        # Get all applications for the employer view
        apps = Application.query.order_by(Application.applied_at.desc()).all()
        return jsonify([a.to_dict() for a in apps]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/applications/<int:id>/status', methods=['PUT'])
def update_status(id):
    try:
        data = request.get_json()
        new_status = data.get('status')
        if not new_status:
            return jsonify({"error": "Status is required"}), 400
            
        app_record = Application.query.get_or_404(id)
        app_record.status = new_status
        db.session.commit()
        return jsonify(app_record.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
