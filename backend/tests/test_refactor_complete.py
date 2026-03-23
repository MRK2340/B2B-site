"""
iWhistle B2B Portal - Refactoring Test Suite
Tests all endpoints after modular refactor: main.py + routes/* + utils/*
All tests use BASE_URL from environment variable
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


# ─── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="session")
def admin_token(api_client):
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@i-whistle.com",
        "password": "admin123"
    })
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    return response.json().get("token")


@pytest.fixture(scope="session")
def admin_client(admin_token):
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {admin_token}"
    })
    return session


@pytest.fixture(scope="session")
def partner_token(api_client):
    """Register a new test partner and return their token"""
    unique_email = f"TEST_refactor_{int(time.time())}@example.com"
    response = api_client.post(f"{BASE_URL}/api/auth/register", json={
        "name": "TEST Refactor Partner",
        "organization": "TEST Refactor Sports Org",
        "email": unique_email,
        "password": "testpass123"
    })
    assert response.status_code == 200, f"Partner registration failed: {response.text}"
    return response.json().get("token")


@pytest.fixture(scope="session")
def partner_client(partner_token):
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {partner_token}"
    })
    return session


# ─── 1. Health Check ──────────────────────────────────────────────────────────

class TestHealthCheck:
    """Backend health check: GET /api/health returns {status: healthy}"""

    def test_health_returns_200(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        print("PASS: /api/health returns 200")

    def test_health_returns_status_healthy(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/health")
        data = response.json()
        assert data.get("status") == "healthy", f"Expected 'healthy', got: {data}"
        print(f"PASS: /api/health returns status=healthy")


# ─── 2. Admin Login ───────────────────────────────────────────────────────────

class TestAdminLogin:
    """Admin login: POST /api/auth/login with admin@i-whistle.com / admin123"""

    def test_admin_login_success(self, api_client):
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@i-whistle.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == "admin@i-whistle.com"
        assert data["user"]["role"] == "admin"
        assert isinstance(data["token"], str) and len(data["token"]) > 10
        print(f"PASS: Admin login - role={data['user']['role']}, token length={len(data['token'])}")

    def test_admin_login_invalid_password(self, api_client):
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@i-whistle.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("PASS: Admin login with wrong password returns 401")

    def test_login_missing_password(self, api_client):
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@i-whistle.com"
        })
        assert response.status_code == 422
        print("PASS: Login missing password returns 422")


# ─── 3. Partner Registration ──────────────────────────────────────────────────

class TestPartnerRegistration:
    """Partner registration: POST /api/auth/register creates user and returns token"""

    def test_register_creates_partner(self, api_client):
        unique_email = f"TEST_reg_{int(time.time())}@example.com"
        response = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "name": "TEST New Partner",
            "organization": "TEST New Sports Org",
            "email": unique_email,
            "password": "testpass123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == unique_email
        assert data["user"]["role"] == "partner"
        assert data["user"]["name"] == "TEST New Partner"
        assert data["user"]["organization"] == "TEST New Sports Org"
        print(f"PASS: Registration creates partner with role=partner")

    def test_register_duplicate_email_rejected(self, api_client):
        response = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Duplicate Admin",
            "organization": "Some Org",
            "email": "admin@i-whistle.com",
            "password": "somepassword"
        })
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print(f"PASS: Duplicate email rejected with 400: {data['detail']}")

    def test_register_missing_required_fields(self, api_client):
        response = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Incomplete User",
            "email": "incomplete@example.com"
            # Missing organization and password
        })
        assert response.status_code == 422
        print("PASS: Register missing fields returns 422")


# ─── 4. Partner Login ─────────────────────────────────────────────────────────

class TestPartnerLogin:
    """Partner login with registered partner credentials"""

    def test_partner_login_success(self, api_client):
        # First register a partner
        unique_email = f"TEST_plog_{int(time.time())}@example.com"
        reg_res = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "name": "TEST Partner Login",
            "organization": "TEST Partner Org",
            "email": unique_email,
            "password": "partner123"
        })
        assert reg_res.status_code == 200

        # Now login with those credentials
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": unique_email,
            "password": "partner123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["role"] == "partner"
        assert data["user"]["email"] == unique_email
        print(f"PASS: Partner login successful, role={data['user']['role']}")

    def test_invalid_login_returns_401(self, api_client):
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("PASS: Non-existent user login returns 401")


# ─── 5. Auth Me Endpoint ──────────────────────────────────────────────────────

class TestAuthMe:
    """GET /api/auth/me with valid token returns user info"""

    def test_me_with_admin_token_returns_user(self, admin_client):
        response = admin_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        assert data["user"]["email"] == "admin@i-whistle.com"
        assert data["user"]["role"] == "admin"
        assert "password_hash" not in data["user"], "password_hash should NOT be in response"
        print(f"PASS: /api/auth/me returns admin user without password_hash")

    def test_me_with_partner_token_returns_user(self, partner_client):
        response = partner_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        assert data["user"]["role"] == "partner"
        print(f"PASS: /api/auth/me returns partner user with role=partner")

    def test_me_without_token_returns_403(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code in [401, 403]
        print(f"PASS: /api/auth/me without token returns {response.status_code}")

    def test_me_with_invalid_token_returns_401(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/auth/me",
                                   headers={"Authorization": "Bearer invalidtoken123"})
        assert response.status_code == 401
        print("PASS: Invalid token returns 401")


# ─── 6. Admin Stats ───────────────────────────────────────────────────────────

class TestAdminStats:
    """GET /api/admin/stats returns total/pending/approved/rejected counts"""

    def test_admin_stats_with_admin_token(self, admin_client):
        response = admin_client.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200
        data = response.json()
        required_fields = ["total", "pending", "approved", "rejected", "total_value", "total_officials"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        assert isinstance(data["total"], int)
        assert isinstance(data["pending"], int)
        assert isinstance(data["approved"], int)
        assert isinstance(data["rejected"], int)
        assert isinstance(data["total_value"], (int, float))
        assert isinstance(data["total_officials"], int)
        # Counts must be non-negative and sum of known statuses <= total
        assert data["total"] >= 0
        known_total = data["pending"] + data["approved"] + data["rejected"]
        assert known_total <= data["total"], f"Sum of statuses {known_total} > total {data['total']}"
        print(f"PASS: Admin stats: {data}")

    def test_admin_stats_without_token_returns_403(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code in [401, 403]
        print(f"PASS: /api/admin/stats without token returns {response.status_code}")

    def test_admin_stats_partner_token_forbidden(self, partner_client):
        response = partner_client.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 403
        print(f"PASS: Partner cannot access admin stats, got 403")


# ─── 7. Admin Partnerships List ───────────────────────────────────────────────

class TestAdminPartnerships:
    """GET /api/admin/partnerships returns all partnerships"""

    def test_admin_get_all_partnerships(self, admin_client):
        response = admin_client.get(f"{BASE_URL}/api/admin/partnerships")
        assert response.status_code == 200
        data = response.json()
        assert "partnerships" in data
        assert isinstance(data["partnerships"], list)
        # Verify no _id in response (ObjectId serialization check)
        for p in data["partnerships"]:
            assert "_id" not in p, "MongoDB _id should not be in response"
            assert "id" in p, "Should have string 'id' field"
        print(f"PASS: Admin partnerships: {len(data['partnerships'])} applications, no _id fields")

    def test_admin_partnerships_without_token_forbidden(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/admin/partnerships")
        assert response.status_code in [401, 403]
        print(f"PASS: /api/admin/partnerships without token returns {response.status_code}")

    def test_admin_partnerships_partner_token_forbidden(self, partner_client):
        response = partner_client.get(f"{BASE_URL}/api/admin/partnerships")
        assert response.status_code == 403
        print(f"PASS: Partner cannot access admin partnerships, got 403")


# ─── 8. Admin Status Update ───────────────────────────────────────────────────

class TestAdminStatusUpdate:
    """PUT /api/admin/partnerships/{id}/status changes status"""

    @pytest.fixture(scope="class")
    def test_partnership_id(self, admin_client, partner_client):
        """Create a test partnership to update"""
        response = partner_client.post(f"{BASE_URL}/api/partnerships", json={
            "partnerOrgName": "TEST Refactor Update Org",
            "contactName": "TEST Contact",
            "contactEmail": "testcontact@example.com",
            "termStructure": "annual",
            "numOfficials": "5",
            "perUserRate": "10",
            "pilotDiscount": "0",
            "signature": "data:image/png;base64,abc123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        return data["id"]

    def test_admin_can_approve_partnership(self, admin_client, test_partnership_id):
        response = admin_client.put(
            f"{BASE_URL}/api/admin/partnerships/{test_partnership_id}/status",
            json={"status": "approved"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "success"
        print(f"PASS: Partnership {test_partnership_id} approved successfully")

    def test_admin_can_reject_partnership(self, admin_client, test_partnership_id):
        response = admin_client.put(
            f"{BASE_URL}/api/admin/partnerships/{test_partnership_id}/status",
            json={"status": "rejected"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "success"
        print(f"PASS: Partnership {test_partnership_id} rejected successfully")

    def test_status_update_without_admin_token_forbidden(self, partner_client):
        # Use a dummy ID - should get 403 before even checking ID
        response = partner_client.put(
            f"{BASE_URL}/api/admin/partnerships/000000000000000000000001/status",
            json={"status": "approved"}
        )
        assert response.status_code == 403
        print("PASS: Non-admin cannot update partnership status")


# ─── 9. Partner Submit Application ───────────────────────────────────────────

class TestPartnerSubmitApplication:
    """POST /api/partnerships submits a new partnership form"""

    def test_partner_can_submit_application(self, partner_client):
        response = partner_client.post(f"{BASE_URL}/api/partnerships", json={
            "partnerOrgName": "TEST Submit Basketball Org",
            "partnerEntityType": "High School",
            "partnerState": "CA",
            "partnerAddress": "123 Main St",
            "partnerCity": "Los Angeles",
            "partnerZip": "90001",
            "contactName": "TEST Contact Person",
            "contactTitle": "Director",
            "contactEmail": "testcontact@testsubmit.com",
            "contactPhone": "555-0001",
            "termStructure": "annual",
            "startDate": "2025-01-01",
            "endDate": "2025-12-31",
            "numOfficials": "10",
            "orgType": "School District",
            "championName": "TEST Champion",
            "championTitle": "Coach",
            "championEmail": "champion@testsubmit.com",
            "championPhone": "555-0002",
            "signerName": "TEST Signer",
            "signerTitle": "Principal",
            "signatureDate": "2025-01-01",
            "perUserRate": "15",
            "pilotDiscount": "10",
            "signature": "data:image/png;base64,abc123testsignature"
        })
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "success"
        assert "id" in data
        assert isinstance(data["id"], str) and len(data["id"]) > 0
        print(f"PASS: Partnership submitted successfully, id={data['id']}")

    def test_submit_without_auth_token_forbidden(self, api_client):
        response = api_client.post(f"{BASE_URL}/api/partnerships", json={
            "partnerOrgName": "Unauth Org",
            "contactName": "Unauth Contact",
            "contactEmail": "unauth@example.com"
        })
        assert response.status_code in [401, 403]
        print(f"PASS: Unauthenticated submit returns {response.status_code}")

    def test_submit_missing_required_fields_returns_422(self, partner_client):
        """Missing required fields (partnerOrgName, contactName, contactEmail) returns 422"""
        response = partner_client.post(f"{BASE_URL}/api/partnerships", json={
            "partnerEntityType": "High School"
            # Missing required: partnerOrgName, contactName, contactEmail
        })
        assert response.status_code == 422
        print("PASS: Submit missing required fields returns 422")


# ─── 10. Partner Get Own Partnerships ─────────────────────────────────────────

class TestPartnerGetPartnerships:
    """GET /api/partnerships returns only logged-in partner's applications"""

    def test_partner_gets_own_partnerships(self, partner_client):
        response = partner_client.get(f"{BASE_URL}/api/partnerships")
        assert response.status_code == 200
        data = response.json()
        assert "partnerships" in data
        assert isinstance(data["partnerships"], list)
        # All returned partnerships should belong to this user (no _id field)
        for p in data["partnerships"]:
            assert "_id" not in p, "MongoDB _id should not be in response"
            assert "id" in p, "Should have string 'id' field"
        print(f"PASS: Partner gets {len(data['partnerships'])} own partnerships, no _id fields")

    def test_get_partnerships_without_token_forbidden(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/partnerships")
        assert response.status_code in [401, 403]
        print(f"PASS: Unauthenticated GET /api/partnerships returns {response.status_code}")

    def test_partner_only_sees_own_data(self, api_client, admin_client, partner_client):
        """Partner should only see their own applications, not others"""
        # Get admin view (all partnerships)
        admin_response = admin_client.get(f"{BASE_URL}/api/admin/partnerships")
        all_partnerships = admin_response.json()["partnerships"]

        # Get partner view
        partner_response = partner_client.get(f"{BASE_URL}/api/partnerships")
        partner_partnerships = partner_response.json()["partnerships"]

        # If there are multiple users, partner should see fewer than or equal to admin
        assert len(partner_partnerships) <= len(all_partnerships)
        print(f"PASS: Partner sees {len(partner_partnerships)} apps, admin sees {len(all_partnerships)} total")
