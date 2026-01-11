
import requests
import time
import json

BASE_URL = "https://portlens-production.up.railway.app/api/v1"
# Login first to get token
AUTH_URL = f"{BASE_URL}/auth/login"
HEALTH_URL = f"https://portlens-production.up.railway.app/health"

print(f"Testing Backend at: {BASE_URL}")

def test_health():
    try:
        start = time.time()
        resp = requests.get(HEALTH_URL, timeout=5)
        print(f"Health Check: {resp.status_code} in {time.time() - start:.2f}s")
        return resp.status_code == 200
    except Exception as e:
        print(f"Health Check Failed: {e}")
        return False

def test_analysis():
    # Login
    print("\nAttempting Login...")
    try:
        # Use a test account - hoping this works, otherwise need to register
        auth_resp = requests.post(AUTH_URL, json={"email": "authtest@test.com", "password": "TestPass123!"})
        if auth_resp.status_code != 200:
            print(f"Login Failed: {auth_resp.status_code} - {auth_resp.text}")
            # Try register
            print("Trying Register...")
            reg_resp = requests.post(f"{BASE_URL}/auth/register", json={
                "email": f"debug_{int(time.time())}@test.com",
                "password": "TestPass123!",
                "name": "Debug User"
            })
            if reg_resp.status_code != 200:
                print(f"Register Failed: {reg_resp.text}")
                return
            token = reg_resp.json()["access_token"]
        else:
            token = auth_resp.json()["access_token"]
            
        print("Login Success. Token acquired.")
        
        # Submit Portfolio
        headers = {"Authorization": f"Bearer {token}"}
        submit_resp = requests.post(f"{BASE_URL}/portfolios/url", 
                                  json={"url": "https://dribbble.com/test", "title": "Speed Test"},
                                  headers=headers)
        
        if submit_resp.status_code != 200:
            print(f"Submit Failed: {submit_resp.text}")
            return
            
        portfolio_id = submit_resp.json()["id"]
        print(f"Portfolio Submitted: {portfolio_id}")
        
        # Trigger Analysis
        print("Triggering Analysis...")
        start_time = time.time()
        analyze_resp = requests.post(f"{BASE_URL}/analysis/{portfolio_id}/start", headers=headers)
        
        # Check if it returns quickly (it's a background task trigger usually, or we wait?)
        # My implementation is a background task. So the trigger should be instant.
        print(f"Trigger Response: {analyze_resp.status_code} in {time.time() - start_time:.2f}s")
        
        # Poll for status
        print("Polling for completion (Max 10s)...")
        for i in range(10):
            time.sleep(1)
            status_resp = requests.get(f"{BASE_URL}/analysis/{portfolio_id}/status", headers=headers)
            status = status_resp.json()["status"]
            print(f"T+{i+1}s Status: {status}")
            
            if status in ['completed', 'failed']:
                print(f"Analysis Finished in {time.time() - start_time:.2f}s with status: {status}")
                return
                
        print("Analysis Timed Out (took > 10s)")
        
    except Exception as e:
        print(f"Test Failed with Exception: {e}")

if __name__ == "__main__":
    if test_health():
        test_analysis()
