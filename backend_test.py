#!/usr/bin/env python3

import requests
import sys
from datetime import datetime
import json

class iWhistleAPITester:
    def __init__(self, base_url="https://42bc4886-92ba-4877-8019-2bf625fab7db.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"Response: {json.dumps(response_data, indent=2)}")
                except:
                    print(f"Response (text): {response.text}")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text}")

            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, str(e)

    def test_health_check(self):
        """Test health check endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )
        return success

    def test_root_endpoint(self):
        """Test root endpoint"""
        success, response = self.run_test(
            "Root Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_create_partnership(self):
        """Test partnership form submission"""
        test_data = {
            "partnerOrgName": "Test Basketball League",
            "partnerEntityType": "Nonprofit Corporation",
            "partnerState": "IL",
            "partnerAddress": "123 Test Street",
            "partnerCity": "Chicago",
            "partnerZip": "60601",
            "contactName": "John Test",
            "contactTitle": "Executive Director",
            "contactEmail": "john.test@example.com",
            "contactPhone": "(555) 123-4567",
            "termStructure": "annual",
            "startDate": "2026-01-01",
            "endDate": "2026-12-31",
            "numOfficials": "25",
            "orgType": "Youth League",
            "championName": "Jane Test",
            "championTitle": "Referee Coordinator",
            "championEmail": "jane.test@example.com",
            "championPhone": "(555) 987-6543",
            "signerName": "Test Signer",
            "signerTitle": "President",
            "signatureDate": "2026-08-15",
            "perUserRate": "8.00",
            "pilotDiscount": "15"
        }
        
        success, response = self.run_test(
            "Partnership Form Submission",
            "POST",
            "api/partnerships",
            200,
            data=test_data
        )
        return success, response

    def test_get_partnerships(self):
        """Test getting partnerships"""
        success, response = self.run_test(
            "Get Partnerships",
            "GET",
            "api/partnerships",
            200
        )
        return success, response

def main():
    print("🚀 Starting iWhistle B2B Partnership Portal API Tests")
    print("=" * 60)
    
    # Setup
    tester = iWhistleAPITester()
    
    # Run tests
    print("\n📡 Testing Backend APIs...")
    
    # Test health check
    if not tester.test_health_check():
        print("❌ Health check failed, but continuing with other tests")
    
    # Test root endpoint 
    if not tester.test_root_endpoint():
        print("❌ Root endpoint failed, but continuing with other tests")
    
    # Test partnership submission
    success, partnership_response = tester.test_create_partnership()
    if not success:
        print("❌ Partnership creation failed")
    
    # Test getting partnerships
    success, get_response = tester.test_get_partnerships()
    if not success:
        print("❌ Getting partnerships failed")

    # Print final results
    print(f"\n📊 Backend API Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("✅ All backend tests passed!")
        return 0
    else:
        print(f"❌ {tester.tests_run - tester.tests_passed} backend tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())