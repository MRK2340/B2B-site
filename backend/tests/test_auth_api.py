"""
Backend tests for iWhistle B2B Authentication and Admin APIs
Tests: Auth login/register/me, Admin stats, Admin partnerships
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# ─── Fixtures ────────────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope="session")
def admin_token(api_client):
    """Get admin token once per test session"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@i-whistle.com",
        "password": "admin123"
    })
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    return response.json().get("token")

@pytest.fixture(scope="session")
def admin_client(api_client, admin_token):
    """Admin-authenticated client"""
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {admin_token}"
    })
    return session


# ─── Health Check ─────────────────────────────────────────────────────────────

class TestHealth:
    """Health check endpoints"""

    def test_health_endpoint(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("PASS: Health endpoint is up")


# ─── Auth: Login ─────────────────────────────────────────────────────────────

class TestAuthLogin:
    """POST /api/auth/login tests"""

    def test_admin_login_success(self, api_client):
        """Feature 14: Admin login returns token and user data"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@i-whistle.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data, "Token missing from response"
        assert "user" in data, "User data missing from response"
        assert data["user"]["email"] == "admin@i-whistle.com"
        assert data["user"]["role"] == "admin"
        assert isinstance(data["token"], str) and len(data["token"]) > 0
        print(f"PASS: Admin login successful, role={data['user']['role']}")

    def test_login_returns_role(self, api_client):
        """Verify login response contains correct role field"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@i-whistle.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["role"] in ["admin", "partner"]
        print(f"PASS: Login role field present: {data['user']['role']}")

    def test_login_invalid_password(self, api_client):
        """Feature 4: Invalid credentials returns 401"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@i-whistle.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"PASS: Invalid password correctly rejected with 401: {data['detail']}")

    def test_login_invalid_email(self, api_client):
        """Feature 4: Non-existent email returns 401"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "somepassword"
        })
        assert response.status_code == 401
        print("PASS: Non-existent email correctly rejected with 401")

    def test_login_missing_fields(self, api_client):
        """Login with missing fields returns validation error"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@i-whistle.com"
        })
        assert response.status_code == 422
        print("PASS: Missing password field correctly returns 422")


# ─── Auth: Register ───────────────────────────────────────────────────────────

class TestAuthRegister:
    """POST /api/auth/register tests"""

    def test_register_new_partner(self, api_client):
        """Feature 5: New partner registration returns token and redirects to /portal"""
        unique_email = f"TEST_partner_{int(time.time())}@example.com"
        response = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test Partner User",
            "organization": "TEST_Org Basketball",
            "email": unique_email,
            "password": "testpass123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == unique_email
        assert data["user"]["role"] == "partner"
        print(f"PASS: New partner registered successfully with role={data['user']['role']}")

    def test_register_duplicate_email(self, api_client):
        """Duplicate email registration returns 400"""
        # Admin email is already registered
        response = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Another Admin",
            "organization": "Some Org",
            "email": "admin@i-whistle.com",
            "password": "somepassword"
        })
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print(f"PASS: Duplicate email registration rejected: {data['detail']}")

    def test_register_missing_fields(self, api_client):
        """Register with missing fields returns 422"""
        response = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Incomplete User",
            "email": "incomplete@example.com"
            # Missing organization and password
        })
        assert response.status_code == 422
        print("PASS: Incomplete registration data correctly returns 422")


# ─── Auth: Me ─────────────────────────────────────────────────────────────────

class TestAuthMe:
    """GET /api/auth/me tests"""

    def test_get_me_with_valid_token(self, admin_client):
        """Verify /api/auth/me returns user data with valid token"""
        response = admin_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        assert data["user"]["email"] == "admin@i-whistle.com"
        assert data["user"]["role"] == "admin"
        print(f"PASS: /api/auth/me returns correct user: {data['user']['email']}")

    def test_get_me_without_token(self, api_client):
        """Feature 15 equivalent: /api/auth/me without token returns 403"""
        response = api_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code in [401, 403]
        print(f"PASS: /api/auth/me without token returns {response.status_code}")

    def test_get_me_with_invalid_token(self, api_client):
        """Invalid token returns 401"""
        response = api_client.get(f"{BASE_URL}/api/auth/me", 
                                   headers={"Authorization": "Bearer invalidtoken123"})
        assert response.status_code == 401
        print("PASS: Invalid token correctly rejected with 401")


# ─── Admin: Stats ─────────────────────────────────────────────────────────────

class TestAdminStats:
    """GET /api/admin/stats tests"""

    def test_admin_stats_without_token(self, api_client):
        """Feature 15: GET /api/admin/stats without token returns 401/403"""
        response = api_client.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code in [401, 403]
        print(f"PASS: /api/admin/stats without token returns {response.status_code}")

    def test_admin_stats_with_admin_token(self, admin_client):
        """Feature 16: GET /api/admin/stats with admin token returns stats"""
        response = admin_client.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200
        data = response.json()
        # Verify all expected fields
        assert "total" in data
        assert "pending" in data
        assert "approved" in data
        assert "rejected" in data
        assert "total_value" in data
        assert "total_officials" in data
        assert isinstance(data["total"], int)
        assert isinstance(data["pending"], int)
        print(f"PASS: /api/admin/stats returns valid stats: {data}")

    def test_admin_stats_with_partner_token(self, api_client):
        """Partner token should NOT access admin stats (role-based access)"""
        # Register a new partner and get their token
        unique_email = f"TEST_partner_stats_{int(time.time())}@example.com"
        reg_res = api_client.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Partner Stats Test",
            "organization": "TEST_Sports Org",
            "email": unique_email,
            "password": "testpass123"
        })
        assert reg_res.status_code == 200
        partner_token = reg_res.json()["token"]

        response = api_client.get(f"{BASE_URL}/api/admin/stats",
                                  headers={"Authorization": f"Bearer {partner_token}"})
        assert response.status_code == 403
        print(f"PASS: Partner cannot access admin stats, got 403")


# ─── Admin: Partnerships ──────────────────────────────────────────────────────

class TestAdminPartnerships:
    """GET /api/admin/partnerships tests"""

    def test_admin_get_partnerships_without_token(self, api_client):
        """Admin partnerships endpoint requires auth"""
        response = api_client.get(f"{BASE_URL}/api/admin/partnerships")
        assert response.status_code in [401, 403]
        print(f"PASS: /api/admin/partnerships without token returns {response.status_code}")

    def test_admin_get_partnerships_with_admin_token(self, admin_client):
        """Admin can fetch all partnerships"""
        response = admin_client.get(f"{BASE_URL}/api/admin/partnerships")
        assert response.status_code == 200
        data = response.json()
        assert "partnerships" in data
        assert isinstance(data["partnerships"], list)
        print(f"PASS: Admin partnerships returns {len(data['partnerships'])} applications")
