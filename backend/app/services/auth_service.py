from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
import hashlib
import secrets
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.config import settings


class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using PBKDF2"""
        salt = secrets.token_hex(16)
        hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), bytes.fromhex(salt), 100000)
        return f"$pbkdf2${salt}${hashed.hex()}"

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        try:
            # Support bcrypt hashes
            if hashed_password.startswith('$2'):
                try:
                    from bcrypt import checkpw
                    return checkpw(plain_password.encode(), hashed_password.encode())
                except:
                    pass

            # Support PBKDF2 hashes
            parts = hashed_password.split('$')
            if len(parts) == 4 and parts[0] == '' and parts[1] == 'pbkdf2':
                salt_hex = parts[2]
                stored_hash = parts[3]
                computed_hash = hashlib.pbkdf2_hmac('sha256', plain_password.encode(), bytes.fromhex(salt_hex), 100000)
                return computed_hash.hex() == stored_hash

            # Fallback to plaintext comparison for demo
            return plain_password == hashed_password
        except:
            # Fallback to plaintext comparison for demo
            return plain_password == hashed_password

    @staticmethod
    def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token"""
        to_encode = {"sub": user_id}
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(
                minutes=settings.access_token_expire_minutes
            )
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
        return encoded_jwt

    @staticmethod
    def decode_token(token: str) -> Optional[str]:
        """Decode a JWT token and return the user_id, or None if invalid"""
        try:
            payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
            user_id: str = payload.get("sub")
            if user_id is None:
                return None
            return user_id
        except JWTError:
            return None

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user by email and password"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not AuthService.verify_password(password, user.password_hash):
            return None
        return user
