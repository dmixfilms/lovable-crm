"""
Database backup worker
Automatically backs up the database regularly
"""
import os
import shutil
import gzip
from datetime import datetime
from pathlib import Path
from app.database import SessionLocal
from app.config import settings


def create_backup():
    """
    Creates a compressed backup of the database
    Stores backups in backups/ directory with timestamp
    """
    try:
        db_path = settings.database_url.replace("sqlite:///", "")
        backups_dir = Path("backups")
        backups_dir.mkdir(exist_ok=True)

        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        db_name = Path(db_path).name
        backup_filename = f"{db_name.replace('.db', '')}_{timestamp}.db.gz"
        backup_path = backups_dir / backup_filename

        # Create compressed backup
        with open(db_path, 'rb') as f_in:
            with gzip.open(backup_path, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)

        print(f"✅ Database backup created: {backup_path}")
        print(f"   Size: {backup_path.stat().st_size / 1024 / 1024:.2f} MB")

        # Keep only last 30 backups (delete old ones)
        cleanup_old_backups(backups_dir, keep_count=30)

        return str(backup_path)

    except Exception as e:
        print(f"❌ Backup failed: {e}")
        return None


def cleanup_old_backups(backups_dir, keep_count=30):
    """
    Removes old backups, keeping only the most recent ones
    """
    try:
        backup_files = sorted(backups_dir.glob("*.db.gz"), key=lambda x: x.stat().st_mtime)

        if len(backup_files) > keep_count:
            files_to_delete = backup_files[:-keep_count]
            for file in files_to_delete:
                file.unlink()
                print(f"   🗑️ Deleted old backup: {file.name}")
    except Exception as e:
        print(f"⚠️ Cleanup failed: {e}")


def restore_from_backup(backup_file):
    """
    Restores database from a backup file
    """
    try:
        db_path = settings.database_url.replace("sqlite:///", "")

        # Decompress backup
        with gzip.open(backup_file, 'rb') as f_in:
            with open(db_path, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)

        print(f"✅ Database restored from: {backup_file}")
        return True
    except Exception as e:
        print(f"❌ Restore failed: {e}")
        return False


def list_backups():
    """
    Lists all available backups
    """
    backups_dir = Path("backups")
    if not backups_dir.exists():
        print("No backups found")
        return []

    backup_files = sorted(backups_dir.glob("*.db.gz"), key=lambda x: x.stat().st_mtime, reverse=True)

    print("📦 Available backups:")
    for i, file in enumerate(backup_files, 1):
        size_mb = file.stat().st_size / 1024 / 1024
        mtime = datetime.fromtimestamp(file.stat().st_mtime)
        print(f"   {i}. {file.name} ({size_mb:.2f} MB) - {mtime}")

    return [str(f) for f in backup_files]
