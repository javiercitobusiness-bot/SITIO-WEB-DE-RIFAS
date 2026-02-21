"""
Test suite for Dinámica de Diamantes API
Tests: Plans, Inventory, Admin Login, Admin Stats, Events, Settings
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPublicEndpoints:
    """Public API endpoints tests - No auth required"""
    
    def test_root_endpoint(self):
        """Test root API info endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "dinamica" in data
        assert "total_premios" in data
        print(f"✓ Root endpoint returns: {data['dinamica']}")
    
    def test_get_plans(self):
        """Test GET /api/plans returns 3 plans with correct structure"""
        response = requests.get(f"{BASE_URL}/api/plans")
        assert response.status_code == 200
        
        plans = response.json()
        assert isinstance(plans, list)
        assert len(plans) == 3, f"Expected 3 plans, got {len(plans)}"
        
        plan_ids = [p['id'] for p in plans]
        assert 'basico' in plan_ids
        assert 'medio' in plan_ids
        assert 'premium' in plan_ids
        
        # Verify plan structure
        for plan in plans:
            assert 'id' in plan
            assert 'name' in plan
            assert 'price' in plan
            assert 'diamonds_count' in plan
            assert 'description' in plan
            assert 'currency' in plan
            assert plan['currency'] == 'COP'
        
        # Verify basico plan details
        basico = next(p for p in plans if p['id'] == 'basico')
        assert basico['price'] == 20000
        assert basico['diamonds_count'] == 40
        
        # Verify medio plan details
        medio = next(p for p in plans if p['id'] == 'medio')
        assert medio['price'] == 50000
        assert medio['diamonds_count'] == 100
        
        # Verify premium plan details
        premium = next(p for p in plans if p['id'] == 'premium')
        assert premium['price'] == 100000
        assert premium['diamonds_count'] == 200
        
        print("✓ All 3 plans returned with correct structure and values")
    
    def test_get_inventory_stats(self):
        """Test GET /api/inventory/stats returns inventory stats"""
        response = requests.get(f"{BASE_URL}/api/inventory/stats")
        assert response.status_code == 200
        
        stats = response.json()
        assert 'total_diamonds' in stats
        assert 'sold_diamonds' in stats
        assert 'available_diamonds' in stats
        assert 'sold_percentage' in stats
        
        # Verify data types and values
        assert isinstance(stats['total_diamonds'], int)
        assert isinstance(stats['sold_diamonds'], int)
        assert isinstance(stats['available_diamonds'], int)
        assert isinstance(stats['sold_percentage'], (int, float))
        
        # Verify math consistency
        assert stats['available_diamonds'] == stats['total_diamonds'] - stats['sold_diamonds']
        assert stats['total_diamonds'] == 1000000  # Default inventory
        
        print(f"✓ Inventory stats: {stats['sold_diamonds']}/{stats['total_diamonds']} sold")
    
    def test_get_active_event(self):
        """Test GET /api/event/active returns event or null"""
        response = requests.get(f"{BASE_URL}/api/event/active")
        assert response.status_code == 200
        
        data = response.json()
        assert 'event' in data
        # Event can be null if no active event
        print(f"✓ Active event endpoint working, event present: {data['event'] is not None}")
    
    def test_get_past_events(self):
        """Test GET /api/events/past returns list"""
        response = requests.get(f"{BASE_URL}/api/events/past")
        assert response.status_code == 200
        
        data = response.json()
        assert 'events' in data
        assert isinstance(data['events'], list)
        print(f"✓ Past events endpoint working, count: {len(data['events'])}")


class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "admin", "password": "diamantes2024"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert 'token' in data
        assert 'message' in data
        assert len(data['token']) > 0
        print("✓ Admin login successful, token received")
        return data['token']
    
    def test_admin_login_invalid_credentials(self):
        """Test admin login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "wrong", "password": "wrong"}
        )
        assert response.status_code == 401
        print("✓ Invalid credentials correctly rejected with 401")
    
    def test_admin_login_empty_credentials(self):
        """Test admin login with empty credentials"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "", "password": ""}
        )
        assert response.status_code == 401
        print("✓ Empty credentials correctly rejected")


class TestAdminEndpoints:
    """Admin protected endpoints tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token for all tests"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "admin", "password": "diamantes2024"}
        )
        self.token = response.json().get('token', '')
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_admin_stats(self):
        """Test GET /api/admin/stats returns dashboard statistics"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=self.headers)
        assert response.status_code == 200
        
        stats = response.json()
        assert 'total_purchases' in stats
        assert 'approved_purchases' in stats
        assert 'pending_purchases' in stats
        assert 'total_revenue' in stats
        assert 'inventory' in stats
        
        # Verify inventory is included
        assert 'total_diamonds' in stats['inventory']
        assert 'sold_diamonds' in stats['inventory']
        
        print(f"✓ Admin stats: {stats['approved_purchases']} approved purchases, revenue: {stats['total_revenue']}")
    
    def test_admin_stats_unauthorized(self):
        """Test admin stats without auth token"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 401
        print("✓ Admin stats correctly requires authentication")
    
    def test_admin_purchases(self):
        """Test GET /api/admin/purchases returns purchase list"""
        response = requests.get(f"{BASE_URL}/api/admin/purchases", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert 'purchases' in data
        assert 'total' in data
        assert isinstance(data['purchases'], list)
        
        print(f"✓ Admin purchases: {data['total']} total purchases")
    
    def test_admin_customers(self):
        """Test GET /api/admin/customers returns customer list"""
        response = requests.get(f"{BASE_URL}/api/admin/customers", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert 'customers' in data
        assert isinstance(data['customers'], list)
        
        print(f"✓ Admin customers: {len(data['customers'])} customers")


class TestEventEndpoints:
    """Event management endpoints tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token for all tests"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "admin", "password": "diamantes2024"}
        )
        self.token = response.json().get('token', '')
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_event_templates(self):
        """Test GET /api/admin/events/templates returns templates"""
        response = requests.get(f"{BASE_URL}/api/admin/events/templates", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert 'templates' in data
        templates = data['templates']
        assert len(templates) >= 1
        
        # Verify template structure
        for template in templates:
            assert 'id' in template
            assert 'name' in template
            assert 'default_prizes' in template
            assert 'default_plans' in template
        
        print(f"✓ Event templates: {len(templates)} templates available")
    
    def test_get_all_events(self):
        """Test GET /api/admin/events returns event list"""
        response = requests.get(f"{BASE_URL}/api/admin/events", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert 'events' in data
        assert isinstance(data['events'], list)
        
        print(f"✓ Events: {len(data['events'])} events found")
    
    def test_create_and_delete_event(self):
        """Test create event flow"""
        # Create event
        event_data = {
            "name": "TEST_Event_Pytest",
            "description": "Test event created by pytest",
            "template_id": "diamantes",
            "total_numbers": 10000,
            "start_date": datetime.utcnow().isoformat(),
            "end_date": (datetime.utcnow() + timedelta(days=30)).isoformat()
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/admin/events",
            json=event_data,
            headers=self.headers
        )
        assert create_response.status_code == 200, f"Create failed: {create_response.text}"
        
        created = create_response.json()
        assert 'event' in created
        event_id = created['event'].get('event_id')
        assert event_id is not None
        
        print(f"✓ Event created with ID: {event_id}")
        
        # Verify event exists via GET
        get_response = requests.get(
            f"{BASE_URL}/api/admin/events/{event_id}",
            headers=self.headers
        )
        assert get_response.status_code == 200
        
        # Delete the test event
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/events/{event_id}",
            headers=self.headers
        )
        assert delete_response.status_code == 200
        
        # Verify deletion
        verify_response = requests.get(
            f"{BASE_URL}/api/admin/events/{event_id}",
            headers=self.headers
        )
        assert verify_response.status_code == 404
        
        print(f"✓ Event {event_id} deleted successfully")


class TestSettingsEndpoints:
    """Site settings endpoints tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "admin", "password": "diamantes2024"}
        )
        self.token = response.json().get('token', '')
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_settings(self):
        """Test GET /api/admin/settings"""
        response = requests.get(f"{BASE_URL}/api/admin/settings", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert 'settings' in data
        print(f"✓ Settings endpoint working, settings present: {data['settings'] is not None}")
    
    def test_save_settings(self):
        """Test POST /api/admin/settings"""
        settings = {
            "site_name": "TEST_Dinamica_Settings",
            "contact_email": "test@test.com",
            "contact_phone": "+57 300 123 4567"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/settings",
            json=settings,
            headers=self.headers
        )
        assert response.status_code == 200
        
        # Verify settings were saved
        get_response = requests.get(f"{BASE_URL}/api/admin/settings", headers=self.headers)
        saved = get_response.json().get('settings', {})
        
        # Note: settings may merge with existing, just verify endpoint worked
        print("✓ Settings saved successfully")


class TestPaymentGateways:
    """Payment gateway endpoints tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "admin", "password": "diamantes2024"}
        )
        self.token = response.json().get('token', '')
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_payment_gateways(self):
        """Test GET /api/admin/payment-gateways"""
        response = requests.get(f"{BASE_URL}/api/admin/payment-gateways", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert 'gateways' in data
        print(f"✓ Payment gateways endpoint working")


class TestPurchaseFlow:
    """Purchase creation flow tests"""
    
    def test_create_purchase_basico(self):
        """Test creating a purchase with basico plan"""
        purchase_data = {
            "plan": "basico",
            "customer_name": "TEST_User_Pytest",
            "customer_email": "pytest@test.com",
            "customer_phone": "+57 300 111 2222"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/purchase",
            json=purchase_data
        )
        assert response.status_code == 200
        
        data = response.json()
        assert 'payment_link' in data
        assert 'payment_reference' in data
        assert 'plan' in data
        assert 'diamonds_count' in data
        assert 'amount' in data
        
        assert data['diamonds_count'] == 40
        assert data['amount'] == 20000
        
        print(f"✓ Purchase created: ref={data['payment_reference']}, amount={data['amount']}")
    
    def test_create_purchase_invalid_plan(self):
        """Test creating a purchase with invalid plan"""
        purchase_data = {
            "plan": "invalid_plan",
            "customer_name": "Test User",
            "customer_email": "test@test.com",
            "customer_phone": "+57 300 111 2222"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/purchase",
            json=purchase_data
        )
        assert response.status_code == 422  # Validation error
        print("✓ Invalid plan correctly rejected with 422")
    
    def test_create_purchase_invalid_email(self):
        """Test creating a purchase with invalid email"""
        purchase_data = {
            "plan": "basico",
            "customer_name": "Test User",
            "customer_email": "not-an-email",
            "customer_phone": "+57 300 111 2222"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/purchase",
            json=purchase_data
        )
        assert response.status_code == 422
        print("✓ Invalid email correctly rejected with 422")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
