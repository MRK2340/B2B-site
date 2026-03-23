#!/usr/bin/env python3

import requests
import sys
from datetime import datetime
import json

class iWhistleAPITester:
    def __init__(self, base_url="https://b2b-portal-refactor.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.partnership_id = None

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
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

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
        
        # Store the partnership ID for later tests
        if success and isinstance(response, dict) and 'id' in response:
            self.partnership_id = response['id']
            print(f"📝 Stored partnership ID: {self.partnership_id}")
        
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

    def test_admin_get_partnerships(self):
        """Test admin getting partnerships"""
        success, response = self.run_test(
            "Admin Get Partnerships",
            "GET",
            "api/admin/partnerships",
            200
        )
        return success, response

    def test_admin_get_stats(self):
        """Test admin statistics endpoint"""
        success, response = self.run_test(
            "Admin Get Stats",
            "GET",
            "api/admin/stats",
            200
        )
        return success, response

    def test_admin_update_partnership_status(self, partnership_id, new_status):
        """Test updating partnership status"""
        if not partnership_id:
            print("❌ No partnership ID available for status update test")
            return False
        
        success, response = self.run_test(
            f"Admin Update Partnership Status to {new_status}",
            "PUT",
            f"api/admin/partnerships/{partnership_id}/status",
            200,
            data={"status": new_status}
        )
        return success, response

    def test_admin_delete_partnership(self, partnership_id):
        """Test deleting partnership"""
        if not partnership_id:
            print("❌ No partnership ID available for delete test")
            return False
        
        success, response = self.run_test(
            "Admin Delete Partnership",
            "DELETE",
            f"api/admin/partnerships/{partnership_id}",
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

    print("\n📊 Testing Admin APIs...")
    
    # Test admin get partnerships
    if not tester.test_admin_get_partnerships():
        print("❌ Admin get partnerships failed")
    
    # Test admin get stats
    if not tester.test_admin_get_stats():
        print("❌ Admin get stats failed")
    
    # Test admin update partnership status (if we have an ID)
    if tester.partnership_id:
        if not tester.test_admin_update_partnership_status(tester.partnership_id, "approved"):
            print("❌ Admin update partnership status failed")
        
        # Test admin delete partnership (this will remove the test partnership)
        if not tester.test_admin_delete_partnership(tester.partnership_id):
            print("❌ Admin delete partnership failed")

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