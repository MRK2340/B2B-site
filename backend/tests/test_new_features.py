"""
Tests for new features: Dark Mode (backend-agnostic), Contact Us, Admin Notification Badge
Testing: POST /api/contact, GET /api/admin/contact, PUT /api/admin/contact/{id}/read
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

ADMIN_CREDENTIALS = {"email": "admin@i-whistle.com", "password": "admin123"}
PARTNER_CREDENTIALS = {"email": "test@test.com", "password": "partner123"}


@pytest.fixture(scope="module")
def admin_token():
    res = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDENTIALS)
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    return res.json()["token"]


@pytest.fixture(scope="module")
def partner_token():
    res = requests.post(f"{BASE_URL}/api/auth/login", json=PARTNER_CREDENTIALS)
    if res.status_code != 200:
        pytest.skip(f"Partner login failed: {res.text}")
    return res.json()["token"]


class TestContactEndpoint:
    """POST /api/contact - partner submits contact inquiry"""

    def test_submit_contact_general_inquiry(self, partner_token):
        """Partner can submit a general inquiry"""
        payload = {
            "category": "general",
            "subject": "TEST General Inquiry Subject",
            "message": "This is a test general inquiry message for automated testing."
        }
        res = requests.post(
            f"{BASE_URL}/api/contact",
            json=payload,
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()
        assert data.get("status") == "success", f"Expected success status, got: {data}"
        assert "id" in data, "Response should contain id"
        assert isinstance(data["id"], str), "id should be a string"

    def test_submit_contact_billing_inquiry(self, partner_token):
        """Partner can submit a billing inquiry"""
        payload = {
            "category": "billing",
            "subject": "TEST Billing Question",
            "message": "I have a question about the pricing structure."
        }
        res = requests.post(
            f"{BASE_URL}/api/contact",
            json=payload,
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()
        assert data.get("status") == "success"

    def test_submit_contact_requires_auth(self):
        """Contact submission should require authentication"""
        payload = {
            "category": "general",
            "subject": "No auth test",
            "message": "This should fail"
        }
        res = requests.post(f"{BASE_URL}/api/contact", json=payload)
        assert res.status_code in [401, 403], f"Expected 401/403, got {res.status_code}"

    def test_submit_contact_technical_inquiry(self, partner_token):
        """Partner can submit a technical support inquiry"""
        payload = {
            "category": "technical",
            "subject": "TEST Technical Support Request",
            "message": "I am having trouble accessing the dashboard features."
        }
        res = requests.post(
            f"{BASE_URL}/api/contact",
            json=payload,
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data.get("status") == "success"
        return data["id"]


class TestAdminContactEndpoints:
    """GET /api/admin/contact, PUT /api/admin/contact/{id}/read"""

    def test_admin_get_inquiries(self, admin_token):
        """Admin can retrieve contact inquiries"""
        res = requests.get(
            f"{BASE_URL}/api/admin/contact",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()
        assert "inquiries" in data, "Response should contain 'inquiries' key"
        assert isinstance(data["inquiries"], list), "inquiries should be a list"

    def test_admin_get_inquiries_has_required_fields(self, admin_token, partner_token):
        """Submitted inquiries have expected fields"""
        # First submit one to ensure there's data
        payload = {
            "category": "partnership",
            "subject": "TEST Fields Check",
            "message": "Checking fields in admin response"
        }
        requests.post(
            f"{BASE_URL}/api/contact",
            json=payload,
            headers={"Authorization": f"Bearer {partner_token}"}
        )

        res = requests.get(
            f"{BASE_URL}/api/admin/contact",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        data = res.json()
        assert len(data["inquiries"]) > 0, "Should have at least one inquiry"

        inquiry = data["inquiries"][0]
        required_fields = ["id", "subject", "category", "message", "status", "user_name", "organization", "created_at"]
        for field in required_fields:
            assert field in inquiry, f"Missing field: {field}"

    def test_admin_get_inquiries_requires_admin(self, partner_token):
        """Non-admin cannot access contact inquiries"""
        res = requests.get(
            f"{BASE_URL}/api/admin/contact",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert res.status_code in [401, 403], f"Expected 401/403, got {res.status_code}"

    def test_admin_mark_inquiry_read(self, admin_token, partner_token):
        """Admin can mark an inquiry as read"""
        # First submit an inquiry
        payload = {
            "category": "other",
            "subject": "TEST Mark Read Subject",
            "message": "This inquiry will be marked as read"
        }
        submit_res = requests.post(
            f"{BASE_URL}/api/contact",
            json=payload,
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert submit_res.status_code == 200
        inquiry_id = submit_res.json()["id"]

        # Mark as read
        read_res = requests.put(
            f"{BASE_URL}/api/admin/contact/{inquiry_id}/read",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert read_res.status_code == 200, f"Expected 200, got {read_res.status_code}: {read_res.text}"
        data = read_res.json()
        assert data.get("status") == "success", f"Expected success, got: {data}"

        # Verify the inquiry status is now 'read'
        get_res = requests.get(
            f"{BASE_URL}/api/admin/contact",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        inquiries = get_res.json()["inquiries"]
        found = next((i for i in inquiries if i["id"] == inquiry_id), None)
        assert found is not None, "Inquiry should still be present after marking read"
        assert found["status"] == "read", f"Expected status 'read', got: {found['status']}"

    def test_admin_mark_inquiry_requires_admin(self, partner_token):
        """Non-admin cannot mark inquiry as read"""
        res = requests.put(
            f"{BASE_URL}/api/admin/contact/nonexistent_id/read",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert res.status_code in [401, 403], f"Expected 401/403, got {res.status_code}"


class TestExistingFeaturesRegression:
    """Regression tests for existing features"""

    def test_health_check(self):
        """Health endpoint still works"""
        res = requests.get(f"{BASE_URL}/api/health")
        assert res.status_code == 200

    def test_admin_get_partnerships(self, admin_token):
        """Admin can still get partnerships"""
        res = requests.get(
            f"{BASE_URL}/api/admin/partnerships",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert "partnerships" in data

    def test_admin_stats(self, admin_token):
        """Admin stats endpoint still works"""
        res = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert "total" in data
        assert "pending" in data

    def test_partner_get_partnerships(self, partner_token):
        """Partner can get their partnerships"""
        res = requests.get(
            f"{BASE_URL}/api/partnerships",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert "partnerships" in data
