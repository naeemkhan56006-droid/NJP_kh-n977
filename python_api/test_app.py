import unittest
import json
import os
import sys

# Ensure the python_api directory is in the path
sys.path.append(os.path.join(os.path.dirname(__file__)))

from app import app, db, Job, Application, News

class JobPortalTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app = app.test_client()
        with app.app_context():
            db.create_all()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_job_creation_and_retrieval(self):
        # Create a job with new fields
        job_data = {
            "title": "Senior AI Architect",
            "company": "DeepMind Explorer",
            "location": "Remote",
            "description": "Building the future of AGENTIC coding.",
            "requirements": "Experience with LLMs and tool-use.",
            "benefits": "Unlimited coffee and GPU credits.",
            "salary": "$200k - $300k",
            "job_type": "Full-time",
            "category": "Tech",
            "deadline": "2026-12-31T23:59:59"
        }
        res = self.app.post('/api/jobs', data=json.dumps(job_data), content_type='application/json')
        self.assertEqual(res.status_code, 201)
        
        # Retrieve and verify fields
        res = self.app.get('/api/jobs')
        self.assertEqual(res.status_code, 200)
        jobs = json.loads(res.data)
        self.assertEqual(len(jobs), 1)
        self.assertEqual(jobs[0]['requirements'], job_data['requirements'])
        self.assertEqual(jobs[0]['deadline'], job_data['deadline'])

    def test_search_functionality(self):
        with app.app_context():
            db.session.add(Job(title="Backend Engineer", company="Tech Corp", category="Tech", description="Python and Flask"))
            db.session.add(Job(title="Frontend Designer", company="Creative Agency", category="Design", description="React and CSS"))
            db.session.commit()

        # Search by title
        res = self.app.get('/api/jobs?search=Backend')
        jobs = json.loads(res.data)
        self.assertEqual(len(jobs), 1)
        self.assertEqual(jobs[0]['title'], "Backend Engineer")

        # Search in description
        res = self.app.get('/api/jobs?search=React')
        jobs = json.loads(res.data)
        self.assertEqual(len(jobs), 1)
        self.assertEqual(jobs[0]['title'], "Frontend Designer")

    def test_application_submission(self):
        with app.app_context():
            j = Job(title="Tester", company="QA Inc")
            db.session.add(j)
            db.session.commit()
            job_id = j.id

        app_data = {"name": "Test User", "email": "test@example.com"}
        res = self.app.post(f'/api/jobs/{job_id}/apply', data=json.dumps(app_data), content_type='application/json')
        self.assertEqual(res.status_code, 201)

        res = self.app.get('/api/applications')
        apps = json.loads(res.data)
        self.assertEqual(len(apps), 1)
        self.assertEqual(apps[0]['name'], "Test User")

    def test_get_news(self):
        # We need some news in the DB since it's an in-memory test DB
        with app.app_context():
            db.session.add(News(title="Test News", content="Content", category="Test"))
            db.session.commit()

        res = self.app.get('/api/news')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertGreater(len(data), 0)
        self.assertEqual(data[0]['title'], "Test News")

if __name__ == '__main__':
    unittest.main()
