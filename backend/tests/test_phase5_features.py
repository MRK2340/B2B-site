"""
Phase 5 Backend tests for iWhistle B2B Partnership Portal
Tests: Partner Dashboard API (partnerships with id field), Signature submission, Admin features
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


# ─── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def admin_token(api_client):
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@i-whistle.com",
        "password": "admin123"
    })
    assert response.status_code == 200
    return response.json()["token"]


@pytest.fixture(scope="module")
def admin_client(api_client, admin_token):
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {admin_token}"
    })
    return session


@pytest.fixture(scope="module")
def partner_token(api_client):
    """Register a test partner and return their token"""
    unique_email = f"TEST_p5_partner_{int(time.time())}@example.com"
    response = api_client.post(f"{BASE_URL}/api/auth/register", json={
        "name": "Test Partner P5",
        "organization": "TEST Basketball Association",
        "email": unique_email,
        "password": "partner123"
    })
    assert response.status_code == 200, f"Partner registration failed: {response.text}"
    return response.json()["token"]


@pytest.fixture(scope="module")
def partner_client(api_client, partner_token):
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {partner_token}"
    })
    return session


# ─── Partnership GET with id field ─────────────────────────────────────────────

class TestPartnershipGetEndpoint:
    """GET /api/partnerships - partner can fetch own applications, each has 'id' field"""

    def test_get_partnerships_requires_auth(self, api_client):
        """Unauthenticated request returns 401 or 403"""
        response = api_client.get(f"{BASE_URL}/api/partnerships")
        assert response.status_code in [401, 403], f"Expected auth error, got {response.status_code}"
        print(f"PASS: GET /api/partnerships without token returns {response.status_code}")

    def test_get_partnerships_returns_list(self, partner_client):
        """Partner can fetch their partnerships"""
        response = partner_client.get(f"{BASE_URL}/api/partnerships")
        assert response.status_code == 200
        data = response.json()
        assert "partnerships" in data
        assert isinstance(data["partnerships"], list)
        print(f"PASS: GET /api/partnerships returns {len(data['partnerships'])} items")

    def test_get_partnerships_each_has_id(self, partner_client, api_client, partner_token):
        """Each partnership doc must include 'id' field (Phase 5 requirement)"""
        # Submit a test application first
        test_data = {
            "partnerOrgName": "TEST_P5_Org",
            "partnerEntityType": "Nonprofit",
            "partnerState": "IL",
            "partnerAddress": "123 Test St",
            "partnerCity": "Chicago",
            "partnerZip": "60601",
            "contactName": "TEST Contact",
            "contactTitle": "Director",
            "contactEmail": "test@testorg.com",
            "contactPhone": "5551234567",
            "termStructure": "annual",
            "startDate": "2026-01-01",
            "endDate": "2026-12-31",
            "numOfficials": "20",
            "orgType": "Youth League",
            "championName": "TEST Champion",
            "championTitle": "Coordinator",
            "championEmail": "champion@testorg.com",
            "championPhone": "5559876543",
            "signerName": "TEST Signer",
            "signerTitle": "President",
            "signatureDate": "2026-01-01",
            "perUserRate": "8.00",
            "pilotDiscount": "",
            "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        }
        submit_resp = partner_client.post(f"{BASE_URL}/api/partnerships", json=test_data)
        assert submit_resp.status_code == 200, f"Partnership submission failed: {submit_resp.text}"

        # Now fetch and check id field
        get_resp = partner_client.get(f"{BASE_URL}/api/partnerships")
        assert get_resp.status_code == 200
        data = get_resp.json()
        assert len(data["partnerships"]) > 0, "No partnerships returned after submission"

        for p in data["partnerships"]:
            assert "id" in p, f"Partnership missing 'id' field: {list(p.keys())}"
            assert isinstance(p["id"], str) and len(p["id"]) > 0, "Partnership 'id' should be non-empty string"
            assert "_id" not in p, "MongoDB '_id' should be excluded from response"
        print(f"PASS: All {len(data['partnerships'])} partnerships have 'id' field")


# ─── Partnership Submission with Signature ─────────────────────────────────────

class TestPartnershipSubmission:
    """POST /api/partnerships - submit with signature"""

    def test_submit_partnership_with_signature(self, partner_client):
        """Signature data is accepted in submission"""
        test_data = {
            "partnerOrgName": "TEST_Signature_Org",
            "partnerEntityType": "LLC",
            "partnerState": "NY",
            "partnerAddress": "456 Partner Ave",
            "partnerCity": "New York",
            "partnerZip": "10001",
            "contactName": "TEST Sig Contact",
            "contactTitle": "CEO",
            "contactEmail": "sig@test.com",
            "contactPhone": "5551112222",
            "termStructure": "seasonal",
            "startDate": "2026-03-01",
            "endDate": "2026-06-30",
            "numOfficials": "15",
            "orgType": "Camp/Clinic",
            "championName": "TEST Champ Sig",
            "championTitle": "Director",
            "championEmail": "champ.sig@test.com",
            "championPhone": "5553334444",
            "signerName": "TEST Signer Sig",
            "signerTitle": "President",
            "signatureDate": "2026-02-01",
            "perUserRate": "10.00",
            "pilotDiscount": "10",
            "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        }
        response = partner_client.post(f"{BASE_URL}/api/partnerships", json=test_data)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "success"
        assert "id" in data
        print(f"PASS: Partnership with signature submitted, id={data['id']}")

    def test_submit_partnership_status_defaults_to_pending(self, partner_client):
        """New submission status should default to 'pending'"""
        test_data = {
            "partnerOrgName": "TEST_Status_Check_Org",
            "partnerEntityType": "Nonprofit",
            "partnerState": "CA",
            "partnerAddress": "789 Status St",
            "partnerCity": "Los Angeles",
            "partnerZip": "90001",
            "contactName": "TEST Status Contact",
            "contactTitle": "Director",
            "contactEmail": "status@test.com",
            "contactPhone": "5555556666",
            "termStructure": "annual",
            "startDate": "2026-01-01",
            "endDate": "2026-12-31",
            "numOfficials": "25",
            "orgType": "High School League",
            "championName": "TEST Status Champion",
            "championTitle": "Coordinator",
            "championEmail": "statuschamp@test.com",
            "championPhone": "5557778888",
            "signerName": "TEST Status Signer",
            "signerTitle": "CEO",
            "signatureDate": "2026-01-01",
            "perUserRate": "8.50",
            "pilotDiscount": "",
            "signature": "data:image/png;base64,abc123"
        }
        submit_resp = partner_client.post(f"{BASE_URL}/api/partnerships", json=test_data)
        assert submit_resp.status_code == 200
        app_id = submit_resp.json()["id"]

        # Now fetch from partner endpoint - should show pending status
        get_resp = partner_client.get(f"{BASE_URL}/api/partnerships")
        assert get_resp.status_code == 200
        apps = get_resp.json()["partnerships"]
        matching = [a for a in apps if a.get("id") == app_id]
        assert len(matching) == 1, f"Submitted app {app_id} not found in user's partnerships"
        assert matching[0]["status"] == "pending", f"New app should be pending, got: {matching[0]['status']}"
        print(f"PASS: New partnership defaults to 'pending' status")

    def test_submit_without_auth_fails(self, api_client):
        """Submission without auth should fail"""
        response = api_client.post(f"{BASE_URL}/api/partnerships", json={
            "partnerOrgName": "TEST_NoAuth_Org",
            "contactName": "No Auth",
            "contactEmail": "noauth@test.com",
        })
        assert response.status_code in [401, 403]
        print(f"PASS: Unauthenticated submission returns {response.status_code}")


# ─── Admin Partnerships with id field ──────────────────────────────────────────

class TestAdminPartnershipsIdField:
    """Admin GET /api/admin/partnerships also includes id field"""

    def test_admin_partnerships_have_id_field(self, admin_client):
        """All partnerships returned to admin have 'id' field"""
        response = admin_client.get(f"{BASE_URL}/api/admin/partnerships")
        assert response.status_code == 200
        data = response.json()
        assert "partnerships" in data
        for p in data["partnerships"]:
            assert "id" in p, f"Admin partnership missing 'id': {list(p.keys())}"
            assert "_id" not in p, "MongoDB '_id' should not be in admin response"
        print(f"PASS: All {len(data['partnerships'])} admin partnerships have 'id' field")

    def test_admin_can_update_status(self, admin_client, partner_client):
        """Admin can change partnership status"""
        # Find a pending application
        get_resp = partner_client.get(f"{BASE_URL}/api/partnerships")
        apps = get_resp.json()["partnerships"]
        pending_apps = [a for a in apps if a.get("status") == "pending"]

        if not pending_apps:
            pytest.skip("No pending applications to test status update")

        app_id = pending_apps[0]["id"]
        update_resp = admin_client.put(
            f"{BASE_URL}/api/admin/partnerships/{app_id}/status",
            json={"status": "approved"}
        )
        assert update_resp.status_code == 200
        assert update_resp.json().get("status") == "success"
        print(f"PASS: Admin can update partnership status")

    def test_admin_stats_reflect_updates(self, admin_client):
        """Admin stats endpoint returns correct counts"""
        response = admin_client.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 0
        assert data["pending"] >= 0
        assert data["approved"] >= 0
        assert data["rejected"] >= 0
        # Total should equal sum of statuses
        assert data["total"] == data["pending"] + data["approved"] + data["rejected"], \
            f"Total ({data['total']}) != pending+approved+rejected ({data['pending']+data['approved']+data['rejected']})"
        print(f"PASS: Admin stats: total={data['total']}, pending={data['pending']}, approved={data['approved']}, rejected={data['rejected']}")
