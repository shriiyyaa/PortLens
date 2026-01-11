
import requests
import time
import json
import random

BASE_URL = "https://portlens-production.up.railway.app/api/v1"
HEALTH_URL = "https://portlens-production.up.railway.app/health"

print(f"Testing Backend at: {BASE_URL}")

def test_health():
    try:
        start = time.time()
        resp = requests.get(HEALTH_URL, timeout=5)
        data = resp.json()
        print(f"✅ Health Check: {resp.status_code} in {time.time() - start:.2f}s")
        print(f"ℹ️  Version: {data.get('version', 'unknown')}")
        
        expected = "v_final_stable"
        if data.get('version') != expected:
             print(f"⚠️  WARNING: Version mismatch. Expected {expected}, got {data.get('version')}")
             # We return True anyway to see if it works, but warn
             return True
        return resp.status_code == 200
    except Exception as e:
        print(f"❌ Health Check Failed: {e}")
        return False

def test_analysis():
    print("\nAttempting Auth...")
    email = f"debug_user_{int(time.time())}_{random.randint(1000,9999)}@test.com"
    password = "TestPass123!"
    
    try:
        # Register new user to avoid login issues
        reg_resp = requests.post(f"{BASE_URL}/auth/register", json={
            "email": email,
            "password": password,
            "name": "Debug User"
        })
        
        token = ""
        if reg_resp.status_code in [200, 201]:
            token = reg_resp.json()["access_token"]
            print(f"✅ Registered new user: {email}")
        else:
            print(f"⚠️ Register failed ({reg_resp.status_code}), trying login...")
            auth_resp = requests.post(f"{BASE_URL}/auth/login", json={"email": "authtest@test.com", "password": "TestPass123!"})
            if auth_resp.status_code == 200:
                token = auth_resp.json()["access_token"]
                print("✅ Login Success")
            else:
                print(f"❌ Auth Failed completely: {auth_resp.text}")
                return

        # Submit Portfolio
        headers = {"Authorization": f"Bearer {token}"}
        submit_resp = requests.post(f"{BASE_URL}/portfolios/url", 
                                  json={"url": "https://dribbble.com/example", "title": "Speed Test Portfolio"},
                                  headers=headers)
        
        if submit_resp.status_code not in [200, 201]:
            print(f"❌ Submit Failed: {submit_resp.text}")
            return
            
        portfolio_id = submit_resp.json()["id"]
        print(f"✅ Portfolio Submitted: {portfolio_id}")
        
        # Trigger Analysis
        print("🚀 Triggering Analysis...")
        start_time = time.time()
        analyze_resp = requests.post(f"{BASE_URL}/analysis/{portfolio_id}/start", headers=headers)
        
        # Poll for status
        print("⏳ Polling (Max 10s)...")
        final_status = "unknown"
        for i in range(10):
            time.sleep(1)
            status_resp = requests.get(f"{BASE_URL}/analysis/{portfolio_id}/status", headers=headers)
            status = status_resp.json()["status"]
            print(f"   T+{i+1}s: {status}")
            
            if status in ['completed', 'failed']:
                final_status = status
                break
        
        duration = time.time() - start_time
        if final_status == 'completed':
            print(f"\n✅ SUCCESS: Analysis finished in {duration:.2f}s")
            # Get results
            res_resp = requests.get(f"{BASE_URL}/analysis/{portfolio_id}/results", headers=headers)
            print(f"   Score: {res_resp.json().get('overall_score', 'N/A')}/100")
        else:
            print(f"\n❌ FAILURE: Final status is {final_status} after {duration:.2f}s")

    except Exception as e:
        print(f"\n❌ Test Exception: {e}")

if __name__ == "__main__":
    if test_health():
        test_analysis()
