"""Secure file upload handling and validation."""

import os
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.config import get_settings

settings = get_settings()

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


class FileService:
    """Handle secure file uploads with validation."""

    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.max_size = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    async def save_upload(self, file: UploadFile, subfolder: str = "resumes") -> dict:
        """Validate and save uploaded file, return metadata."""
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")

        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
            )

        content = await file.read()
        if len(content) > self.max_size:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE_MB}MB",
            )

        if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
            # Allow if extension is valid (some browsers send wrong MIME)
            if ext not in ALLOWED_EXTENSIONS:
                raise HTTPException(status_code=400, detail="Invalid file MIME type")

        folder = self.upload_dir / subfolder
        folder.mkdir(parents=True, exist_ok=True)

        unique_name = f"{uuid.uuid4().hex}{ext}"
        file_path = folder / unique_name

        with open(file_path, "wb") as f:
            f.write(content)

        return {
            "filename": unique_name,
            "original_filename": file.filename,
            "file_path": str(file_path),
            "file_type": ext.lstrip("."),
            "file_size": len(content),
        }

    def delete_file(self, file_path: str) -> None:
        path = Path(file_path)
        if path.exists():
            os.remove(path)


file_service = FileService()
