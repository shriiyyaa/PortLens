import requests
import time
import json

BASE_URL = 'https://portlens-production.up.railway.app/api/v1'

# Register a test user
email = f'test_analysis_{int(time.time())}@test.com'
reg = requests.post(f'{BASE_URL}/auth/register', json={
    'email': email,
    'password': 'testtest123',
    'name': 'Test Analyzer',
    'role': 'designer'
})
print('Registration:', reg.status_code)

# Login
login = requests.post(f'{BASE_URL}/auth/login', json={
    'email': email,
    'password': 'testtest123'
})
print('Login:', login.status_code)
data = login.json()
token = data.get('access_token')
if not token:
    print('Login failed:', data)
    exit(1)

print('Got token:', token[:20] + '...')
headers = {'Authorization': f'Bearer {token}'}

# Submit portfolio
print('\nSubmitting portfolio URL...')
submit = requests.post(f'{BASE_URL}/portfolios/url', 
    headers=headers,
    json={
        'url': 'https://shriyyaa.vercel.app/',
        'title': 'Shriya Portfolio'
    }
)
print('Submit status:', submit.status_code)
print('Submit response:', submit.text[:500])
portfolio = submit.json()

if 'id' not in portfolio:
    print('Submit failed:', portfolio)
    exit(1)

print('Portfolio ID:', portfolio.get('id'))

# Start analysis
print('\nStarting analysis...')
start = requests.post(f'{BASE_URL}/analysis/{portfolio["id"]}/start', headers=headers)
print('Analysis started:', start.status_code, start.text[:200])

# Poll for results
print('\nPolling for results...')
for i in range(30):
    time.sleep(2)
    try:
        result = requests.get(f'{BASE_URL}/analysis/{portfolio["id"]}/results', headers=headers)
        if result.status_code == 200:
            data = result.json()
            if data.get('overall_score'):
                print('\n' + '='*50)
                print('ANALYSIS COMPLETE')
                print('='*50)
                print(f"Visual Score: {data.get('visual_score')}")
                print(f"UX Score: {data.get('ux_score')}")  
                print(f"Communication Score: {data.get('communication_score')}")
                print(f"Overall Score: {data.get('overall_score')}")
                print(f"Hireability Score: {data.get('hireability_score')}")
                print(f"\nRecruiter Verdict:\n{data.get('recruiter_verdict')}")
                print(f"\nStrengths:")
                for s in (data.get('strengths') or []):
                    print(f"  - {s}")
                print(f"\nWeaknesses:")
                for w in (data.get('weaknesses') or []):
                    print(f"  - {w}")
                print(f"\nRecommendations:")
                for r in (data.get('recommendations') or [])[:4]:
                    print(f"  - {r}")
                break
        print(f'Polling... {i+1}/30 - Status: {result.status_code}')
    except Exception as e:
        print(f'Poll error: {e}')
else:
    print('Timed out waiting for analysis')
