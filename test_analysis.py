import requests
import time
import json

BASE_URL = 'https://portlens-production.up.railway.app/api/v1'

# Register a test user
email = f'test_verify_{int(time.time())}@test.com'
reg = requests.post(f'{BASE_URL}/auth/register', json={
    'email': email,
    'password': 'testtest123',
    'name': 'Test Verifier',
    'role': 'designer'
})
print('Registration:', reg.status_code)

# Login
login = requests.post(f'{BASE_URL}/auth/login', json={
    'email': email,
    'password': 'testtest123'
})
data = login.json()
token = data.get('access_token')
if not token:
    print('Login failed:', data)
    exit(1)

print('Logged in successfully')
headers = {'Authorization': f'Bearer {token}'}

# Submit YOUR portfolio
print('\n' + '='*60)
print('SUBMITTING YOUR PORTFOLIO: https://shriyyaa.vercel.app/')
print('='*60)

submit = requests.post(f'{BASE_URL}/portfolios/url', 
    headers=headers,
    json={
        'url': 'https://shriyyaa.vercel.app/',
        'title': 'Shriya Portfolio Test'
    }
)
print('Submit status:', submit.status_code)
portfolio = submit.json()

if 'id' not in portfolio:
    print('Submit failed:', portfolio)
    exit(1)

print('Portfolio ID:', portfolio.get('id'))

# Start analysis
print('\nStarting analysis...')
start = requests.post(f'{BASE_URL}/analysis/{portfolio["id"]}/start', headers=headers)
print('Analysis started:', start.status_code)

# Poll for results
print('\nWaiting for analysis to complete...')
for i in range(40):
    time.sleep(3)
    try:
        result = requests.get(f'{BASE_URL}/analysis/{portfolio["id"]}/results', headers=headers)
        if result.status_code == 200:
            data = result.json()
            if data.get('overall_score'):
                print('\n' + '='*60)
                print('ANALYSIS COMPLETE')
                print('='*60)
                
                # Check if it's AI-generated or mock
                model = data.get('model_used', 'Unknown')
                ai_gen = data.get('ai_generated', 'Unknown')
                print(f"\n*** ENGINE USED: {model} ***")
                print(f"*** AI GENERATED: {ai_gen} ***")
                
                print(f"\n📊 SCORES:")
                print(f"   Visual: {data.get('visual_score')}/100")
                print(f"   UX: {data.get('ux_score')}/100")  
                print(f"   Communication: {data.get('communication_score')}/100")
                print(f"   Overall: {data.get('overall_score')}/100")
                print(f"   Hireability: {data.get('hireability_score')}/100")
                
                print(f"\n🎯 VERDICT:\n{data.get('recruiter_verdict')}")
                
                print(f"\n✅ STRENGTHS:")
                for i, s in enumerate((data.get('strengths') or [])[:3], 1):
                    print(f"\n{i}. {s[:300]}...")
                
                print(f"\n⚠️ WEAKNESSES:")
                for i, w in enumerate((data.get('weaknesses') or [])[:2], 1):
                    print(f"\n{i}. {w[:300]}...")
                    
                print(f"\n📈 SENIORITY: {data.get('seniority_assessment')}")
                print(f"\n🏢 INDUSTRY BENCHMARK: {data.get('industry_benchmark')}")
                
                # Check detailed feedback
                detailed = data.get('detailed_feedback', {})
                if detailed:
                    print(f"\n📝 DETAILED VISUAL FEEDBACK:")
                    print(f"   {detailed.get('visual', 'N/A')[:400]}...")
                
                break
        print(f'Polling... {i+1}/40')
    except Exception as e:
        print(f'Error: {e}')
else:
    print('Timed out waiting for analysis')
