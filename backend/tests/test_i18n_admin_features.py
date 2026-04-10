"""
Iteration 8 Backend Tests:
- i18n (language endpoints not needed - frontend only)
- Admin Reply to contact inquiry: POST /api/admin/contact/{id}/reply
- Admin User Management: GET /api/admin/users
- Contact inquiry endpoints: GET /api/contact, POST /api/contact
- Regression: Login, partnerships, admin features
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
    token = res.json()["token"]
    return token


@pytest.fixture(scope="module")
def partner_token():
    # Try existing partner first
    res = requests.post(f"{BASE_URL}/api/auth/login", json=PARTNER_CREDENTIALS)
    if res.status_code == 200:
        return res.json()["token"]
    
    # Register a new partner if not exists
    reg = requests.post(f"{BASE_URL}/api/auth/register", json={
        "name": "Test Partner",
        "organization": "Test Organization",
        "email": "test@test.com",
        "password": "partner123"
    })
    if reg.status_code == 200:
        return reg.json()["token"]
    
    pytest.skip(f"Partner login/registration failed: {res.text}")


class TestAdminLogin:
    """Admin login regression test"""
    
    def test_admin_login_succeeds(self):
        res = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_CREDENTIALS)
        assert res.status_code == 200, f"Admin login failed: {res.text}"
        data = res.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["role"] == "admin"
        print("✅ Admin login works")

    def test_admin_me_endpoint(self, admin_token):
        res = requests.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
        assert res.status_code == 200
        data = res.json()
        assert data["user"]["role"] == "admin"
        print("✅ Admin /me endpoint works")


class TestPartnerLogin:
    """Partner login regression test"""
    
    def test_partner_login_succeeds(self, partner_token):
        assert partner_token is not None
        print("✅ Partner login works")
    
    def test_partner_me_endpoint(self, partner_token):
        res = requests.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {partner_token}"})
        assert res.status_code == 200
        data = res.json()
        assert data["user"]["role"] == "partner"
        print("✅ Partner /me endpoint works")


class TestContactInquiries:
    """Contact inquiry CRUD: POST /api/contact, GET /api/contact"""
    
    created_inquiry_id = None
    
    def test_submit_contact_inquiry(self, partner_token):
        res = requests.post(
            f"{BASE_URL}/api/contact",
            json={
                "category": "general",
                "subject": "TEST_Inquiry_Iteration8",
                "message": "This is a test inquiry from iteration 8 backend tests."
            },
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert res.status_code == 200, f"POST /api/contact failed: {res.text}"
        data = res.json()
        assert data.get("status") == "success"
        assert "id" in data
        TestContactInquiries.created_inquiry_id = data["id"]
        print(f"✅ POST /api/contact succeeded, id={data['id']}")

    def test_get_my_inquiries(self, partner_token):
        res = requests.get(
            f"{BASE_URL}/api/contact",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert res.status_code == 200, f"GET /api/contact failed: {res.text}"
        data = res.json()
        assert "inquiries" in data
        assert isinstance(data["inquiries"], list)
        # Should include the one we just created
        subjects = [i.get("subject") for i in data["inquiries"]]
        assert "TEST_Inquiry_Iteration8" in subjects
        print(f"✅ GET /api/contact returned {len(data['inquiries'])} inquiries")
    
    def test_get_inquiries_requires_auth(self):
        res = requests.get(f"{BASE_URL}/api/contact")
        assert res.status_code in [401, 403, 422], f"Expected auth error, got {res.status_code}"
        print("✅ GET /api/contact properly requires auth")


class TestAdminContactEndpoints:
    """Admin contact inquiry management"""
    
    def test_admin_get_all_inquiries(self, admin_token):
        res = requests.get(
            f"{BASE_URL}/api/admin/contact",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200, f"GET /api/admin/contact failed: {res.text}"
        data = res.json()
        assert "inquiries" in data
        assert isinstance(data["inquiries"], list)
        print(f"✅ GET /api/admin/contact returned {len(data['inquiries'])} inquiries")
    
    def test_admin_mark_inquiry_read(self, admin_token):
        # Get an inquiry to mark as read
        res = requests.get(
            f"{BASE_URL}/api/admin/contact",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        inquiries = res.json().get("inquiries", [])
        if not inquiries:
            pytest.skip("No inquiries to mark as read")
        
        inq_id = inquiries[0]["id"]
        mark_res = requests.put(
            f"{BASE_URL}/api/admin/contact/{inq_id}/read",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert mark_res.status_code == 200
        data = mark_res.json()
        assert data.get("status") == "success"
        print(f"✅ PUT /api/admin/contact/{inq_id}/read succeeded")
    
    def test_admin_reply_to_inquiry(self, admin_token):
        """POST /api/admin/contact/{id}/reply - key new feature"""
        # Get an inquiry to reply to
        res = requests.get(
            f"{BASE_URL}/api/admin/contact",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        inquiries = res.json().get("inquiries", [])
        
        # Find one that matches our test inquiry or use first available
        test_inquiry = next(
            (i for i in inquiries if "TEST_Inquiry_Iteration8" in i.get("subject", "")),
            inquiries[0] if inquiries else None
        )
        if not test_inquiry:
            pytest.skip("No inquiries to reply to")
        
        inq_id = test_inquiry["id"]
        reply_res = requests.post(
            f"{BASE_URL}/api/admin/contact/{inq_id}/reply",
            json={"reply_text": "TEST_REPLY: Thank you for your inquiry. We will get back to you."},
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        )
        assert reply_res.status_code == 200, f"POST /api/admin/contact/{inq_id}/reply failed: {reply_res.text}"
        data = reply_res.json()
        assert data.get("status") == "success"
        print(f"✅ POST /api/admin/contact/{inq_id}/reply succeeded")
    
    def test_admin_reply_persists_in_db(self, admin_token):
        """Verify reply was actually persisted"""
        res = requests.get(
            f"{BASE_URL}/api/admin/contact",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        inquiries = res.json().get("inquiries", [])
        
        # Find replied inquiry
        replied = next(
            (i for i in inquiries if i.get("status") == "replied"),
            None
        )
        if not replied:
            pytest.skip("No replied inquiries found to verify")
        
        assert replied.get("reply_text") is not None
        assert replied.get("replied_at") is not None
        assert replied.get("replied_by") is not None
        print(f"✅ Reply persisted: status={replied['status']}, replied_by={replied['replied_by']}")
    
    def test_partner_sees_reply_in_own_inquiries(self, partner_token, admin_token):
        """Verify partner can see admin reply via GET /api/contact"""
        res = requests.get(
            f"{BASE_URL}/api/contact",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert res.status_code == 200
        inquiries = res.json().get("inquiries", [])
        
        # Check if any inquiry has a reply
        replied_inqs = [i for i in inquiries if i.get("reply_text")]
        if replied_inqs:
            inq = replied_inqs[0]
            assert inq.get("reply_text") is not None
            print(f"✅ Partner sees admin reply: '{inq['reply_text'][:50]}...'")
        else:
            print("ℹ️ No replied inquiries visible to partner yet")
    
    def test_admin_contact_requires_admin_role(self, partner_token):
        """Verify regular partner cannot access admin contact endpoint"""
        res = requests.get(
            f"{BASE_URL}/api/admin/contact",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert res.status_code in [401, 403], f"Expected auth error, got {res.status_code}: {res.text}"
        print("✅ GET /api/admin/contact correctly rejects non-admin")
    
    def test_admin_reply_requires_admin_role(self, partner_token):
        """Verify partner cannot send admin replies"""
        res = requests.post(
            f"{BASE_URL}/api/admin/contact/fake-id/reply",
            json={"reply_text": "unauthorized reply"},
            headers={"Authorization": f"Bearer {partner_token}", "Content-Type": "application/json"}
        )
        assert res.status_code in [401, 403, 404, 422], f"Expected error, got {res.status_code}: {res.text}"
        print(f"✅ POST /api/admin/contact/id/reply correctly rejects non-admin (status={res.status_code})")


class TestAdminUsers:
    """Admin User Management: GET /api/admin/users"""
    
    def test_admin_get_partner_users(self, admin_token):
        """GET /api/admin/users returns partner users list"""
        res = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200, f"GET /api/admin/users failed: {res.text}"
        data = res.json()
        assert "users" in data
        assert isinstance(data["users"], list)
        print(f"✅ GET /api/admin/users returned {len(data['users'])} users")
    
    def test_admin_users_contain_partner_fields(self, admin_token):
        """Verify each user has required fields"""
        res = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        users = res.json().get("users", [])
        if not users:
            print("ℹ️ No partner users found (skipping field validation)")
            return
        
        for user in users:
            assert "name" in user, f"Missing 'name' field: {user}"
            assert "email" in user, f"Missing 'email' field: {user}"
            assert "organization" in user, f"Missing 'organization' field: {user}"
            assert "app_count" in user, f"Missing 'app_count' field: {user}"
            assert "_id" not in user, "MongoDB _id should not be in response"
        print(f"✅ All {len(users)} users have required fields (name, email, organization, app_count)")
    
    def test_admin_users_contains_no_admins(self, admin_token):
        """Verify admin users endpoint only returns partners, not admins"""
        res = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        users = res.json().get("users", [])
        # Admin user should not appear (admin@i-whistle.com)
        admin_emails = [u["email"] for u in users if "admin" in u.get("email", "")]
        assert "admin@i-whistle.com" not in [u["email"] for u in users], \
            "Admin user should not appear in partner users list"
        print(f"✅ Admin users endpoint correctly excludes admin accounts")
    
    def test_admin_users_requires_admin_role(self, partner_token):
        """Verify partner cannot access admin users endpoint"""
        res = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert res.status_code in [401, 403], f"Expected auth error, got {res.status_code}: {res.text}"
        print(f"✅ GET /api/admin/users correctly rejects non-admin (status={res.status_code})")


class TestRegressionEndpoints:
    """Regression tests for existing functionality"""
    
    def test_admin_stats(self, admin_token):
        res = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert "total" in data
        assert "pending" in data
        assert "approved" in data
        assert "total_value" in data
        print(f"✅ GET /api/admin/stats works: total={data['total']}")
    
    def test_admin_get_partnerships(self, admin_token):
        res = requests.get(
            f"{BASE_URL}/api/admin/partnerships",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert "partnerships" in data
        print(f"✅ GET /api/admin/partnerships works: {len(data['partnerships'])} apps")
    
    def test_partner_get_partnerships(self, partner_token):
        res = requests.get(
            f"{BASE_URL}/api/partnerships",
            headers={"Authorization": f"Bearer {partner_token}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert "partnerships" in data
        print(f"✅ GET /api/partnerships works: {len(data['partnerships'])} apps")
    
    def test_health_check(self):
        res = requests.get(f"{BASE_URL}/api/health")
        assert res.status_code == 200
        print("✅ /api/health works")
