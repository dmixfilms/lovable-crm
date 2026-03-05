"""
Instagram Session Manager
Maintains persistent login across searches
"""
import json
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

SESSION_DIR = Path("/tmp/instagram_sessions")
SESSION_DIR.mkdir(exist_ok=True)
SESSION_FILE = SESSION_DIR / "instagram_session.json"
STATE_FILE = SESSION_DIR / "instagram_state.json"

class InstagramSessionManager:
    """Manages Instagram session state and persistence"""

    @staticmethod
    def save_state(state: str, details: Optional[str] = None):
        """Save session state (logged_in, needs_login, error)"""
        data = {
            "state": state,  # "logged_in", "needs_login", "error"
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        with open(STATE_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"💾 Session state saved: {state}")

    @staticmethod
    def get_state() -> Dict[str, Any]:
        """Get current session state"""
        if not STATE_FILE.exists():
            return {"state": "needs_login", "details": None}

        try:
            with open(STATE_FILE, 'r') as f:
                return json.load(f)
        except:
            return {"state": "needs_login", "details": None}

    @staticmethod
    def is_logged_in() -> bool:
        """Check if user is logged in"""
        state = InstagramSessionManager.get_state()
        return state.get("state") == "logged_in"

    @staticmethod
    def has_session_file() -> bool:
        """Check if session file exists with cookies"""
        if not SESSION_FILE.exists():
            return False
        try:
            with open(SESSION_FILE, 'r') as f:
                data = json.load(f)
                cookies = data.get("cookies", [])
                return len(cookies) > 0
        except:
            return False

    @staticmethod
    def save_session(storage_state: Dict[str, Any]):
        """Save session from browser storage_state"""
        try:
            with open(SESSION_FILE, 'w') as f:
                json.dump(storage_state, f, indent=2)
            InstagramSessionManager.save_state("logged_in", "Session saved from browser")
            return True
        except Exception as e:
            print(f"❌ Error saving session: {str(e)}")
            InstagramSessionManager.save_state("error", str(e))
            return False

    @staticmethod
    def load_session() -> Optional[Dict[str, Any]]:
        """Load saved session"""
        if not SESSION_FILE.exists():
            return None

        try:
            with open(SESSION_FILE, 'r') as f:
                return json.load(f)
        except:
            return None

    @staticmethod
    def clear_session():
        """Clear saved session"""
        try:
            SESSION_FILE.unlink()
            STATE_FILE.unlink()
            print("🗑️ Session cleared")
        except:
            pass

    @staticmethod
    def get_status() -> Dict[str, Any]:
        """Get complete session status"""
        state = InstagramSessionManager.get_state()
        has_session = InstagramSessionManager.has_session_file()

        return {
            "logged_in": state.get("state") == "logged_in",
            "has_session_file": has_session,
            "state": state.get("state"),
            "details": state.get("details"),
            "message": get_status_message(state.get("state"), has_session)
        }

def get_status_message(state: str, has_session: bool) -> str:
    """Get user-friendly status message"""
    if state == "logged_in" and has_session:
        return "✅ Conectado! Você pode buscar leads sem fazer login novamente."
    elif state == "needs_login":
        return "❌ Não conectado. Clique em 'Conectar Instagram' para fazer login."
    elif state == "error":
        return "⚠️ Erro na sessão anterior. Tente fazer login novamente."
    else:
        return "🔄 Status desconhecido"
