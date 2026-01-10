import os
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, timezone

app = Flask(__name__)
CORS(app)

# Database Setup
db_uri = os.environ.get('DATABASE_URL')
if db_uri and db_uri.startswith("postgres://"):
    db_uri = db_uri.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_uri or 'sqlite:///jobs.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Models
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
    applied_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {"name": self.name, "email": self.email, "job_id": self.job_id, "applied_at": self.applied_at.isoformat()}

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
    
    # Pre-populate some news
    sample_news = [
        News(title="AI Job Market Surges in 2026", content="New data shows a 45% increase in AI-related roles. This growth is driven by the rapid adoption of agentic systems across all sectors of the economy, including healthcare and finance.", category="Career", image_url="https://images.unsplash.com/photo-1677442136019-21780ecad995"),
        News(title="Remote Work 2.0: The Future of AGENTIC Coding", content="How AI agents are changing the landscape of development. Teams are now using AI-driven orchestration to manage complex microservices with minimal human overhead.", category="Tech", image_url="https://images.unsplash.com/photo-1498050108023-c5249f4df085"),
        News(title="Top 5 Skills for FinTech in 2026", content="Blockchain and Python remain crucial for financial technology. Modern fintech firms are prioritizing candidates who can build robust, AI-integrated trading platforms.", category="Finance", image_url="https://images.unsplash.com/photo-1551288049-bebda4e38f71")
    ]
    db.session.add_all(sample_news)
    
    # Richer Sample Jobs
    sample_jobs = [
        Job(title="Senior Cloud Architect", company="Nebula Systems", location="Remote", salary="$180k - $240k", job_type="Full-time", category="Tech", description="Lead our global cloud migration strategy. You will be responsible for designing resilient architectures and managing multi-cloud deployments.", requirements="10+ years AWS/GCP experience. Strong leadership skills.", benefits="Remote first, stock options, premium health coverage."),
        Job(title="UX/UI Designer", company="Pixel Perfect", location="New York, NY", salary="$120k", job_type="Full-time", category="Design", description="Create delightful experiences for our next-gen mobile app. Focus on user-centric design principles and accessibility.", requirements="Strong portfolio with Figma skills. Experience with mobile apps.", benefits="Creative studio access, annual performance bonus."),
        Job(title="Finance Analyst", company="Goldman Sage", location="London, UK", salary="£90k", job_type="Contract", category="Finance", description="High-stakes financial modeling and trend analysis. Assist in quarterly planning and strategic investment evaluations.", requirements="CFA Level 2 preferred. Mastery of Excel and SQL.", benefits="High day rate, networking with industry leaders."),
        Job(title="Growth Marketer", company="Viral Edge", location="Austin, TX", salary="$110k", job_type="Full-time", category="Marketing", description="Scale our user base through data-driven campaigns. Manage a multi-channel acquisition strategy and optimize ROAS.", requirements="Experience with SQL and Meta Ads. A/B testing expertise.", benefits="Flexible hours, modern office in downtown Austin."),
        Job(title="Junior Developer", company="CodeStart", location="Remote", salary="$70k", job_type="Remote", category="Tech", description="Support our engineering team in building internal tools. Learn from senior mentors while contributing to production code.", requirements="Python or JavaScript knowledge. Degree in CS or equivalent experience.", benefits="Professional mentorship, annual learning budget.")
    ]
    db.session.add_all(sample_jobs)
    db.session.commit()

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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
