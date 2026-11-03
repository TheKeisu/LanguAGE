import unittest
from unittest.mock import patch

from fastapi import HTTPException

from app.core.config import Settings
from app.core.security import get_admin_claims


class AdminAccessTests(unittest.TestCase):
    def test_configured_supabase_user_is_admin(self) -> None:
        claims = {"sub": "admin-user-id"}
        settings = Settings(admin_user_ids="other-id, admin-user-id")

        with patch("app.core.security.get_settings", return_value=settings):
            self.assertEqual(get_admin_claims(claims), claims)

    def test_unlisted_user_is_forbidden(self) -> None:
        settings = Settings(admin_user_ids="admin-user-id")

        with patch("app.core.security.get_settings", return_value=settings):
            with self.assertRaises(HTTPException) as raised:
                get_admin_claims({"sub": "regular-user-id"})

        self.assertEqual(raised.exception.status_code, 403)

    def test_empty_admin_list_grants_no_admin_access(self) -> None:
        settings = Settings(admin_user_ids=" , ")

        with patch("app.core.security.get_settings", return_value=settings):
            with self.assertRaises(HTTPException) as raised:
                get_admin_claims({"sub": "any-user-id"})

        self.assertEqual(raised.exception.status_code, 403)


if __name__ == "__main__":
    unittest.main()
