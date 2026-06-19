import os
import logging
from functools import wraps
from flask import request, jsonify
from pydantic import BaseModel, ValidationError, field_validator
import bleach
from typing import Optional, List, Dict, Any, Union

# Set up logging for validation errors
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Only expose detailed validation errors in development; production stays generic.
DEBUG = os.environ.get('FLASK_ENV') == 'development'

# Reusable XSS Sanitizer Validator
class SanitizedBaseModel(BaseModel):
    """Base model that automatically sanitizes all string fields to prevent XSS."""
    
    @field_validator('*', mode='before')
    @classmethod
    def sanitize_strings(cls, v):
        if isinstance(v, str):
            # Strip all HTML tags entirely
            return bleach.clean(v, tags=[], attributes={}, strip=True)
        return v

# --- Schema Definitions ---

class AIProcessSchema(SanitizedBaseModel):
    fileBase64: Optional[str] = None
    toolId: str
    model: Optional[str] = "gemini-3.5-flash"
    
    # Toggles (sent as strings from FormData or bools from JSON)
    includeKeyPoints: Optional[Union[str, bool]] = False
    includeImportantDates: Optional[Union[str, bool]] = False
    includeConclusion: Optional[Union[str, bool]] = False
    includeActionItems: Optional[Union[str, bool]] = False
    includePageReferences: Optional[Union[str, bool]] = False
    includeSimpleExplanation: Optional[Union[str, bool]] = False
    
    # Config
    language: Optional[str] = "English"
    summaryLength: Optional[str] = "Medium"
    outputStyle: Optional[str] = "Bullet Points"
    tone: Optional[str] = "Professional"

class AIChatMessageSchema(SanitizedBaseModel):
    role: str
    content: str

class AIChatSchema(SanitizedBaseModel):
    messages: List[AIChatMessageSchema]
    model: Optional[str] = "gemini-3.5-flash"

class PDFOperationSchema(SanitizedBaseModel):
    # This schema acts as a base/catch-all for generic PDF endpoints
    rotation: Optional[int] = None
    pageRange: Optional[str] = None
    password: Optional[str] = None
    split_method: Optional[str] = None
    split_ranges: Optional[str] = None

# --- Flask Decorator ---

def validate_request(schema: type[BaseModel]):
    """
    Decorator to securely validate and sanitize Flask request data using Pydantic.
    Handles both JSON payloads and Form Data.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                # Extract data based on request content type
                if request.is_json:
                    data = request.get_json()
                else:
                    data = request.form.to_dict()

                if not data and request.method in ['POST', 'PUT']:
                    # Some endpoints might only send files, which is fine, 
                    # but if the schema expects data, it will fail validation.
                    data = {}

                # Attempt to parse and validate
                validated_data = schema(**data)
                
                # Attach the validated (and sanitized) data to the request object
                request.validated_data = validated_data.model_dump()
                
            except ValidationError as e:
                # Log the attempted bad request, including IP address
                client_ip = request.remote_addr
                logger.warning(f"Validation failed from {client_ip} on {request.path}: {e.errors()}")
                
                # Return a clear 400 Bad Request response. Detailed field-level
                # errors are only exposed in development to avoid leaking schema
                # internals to clients in production.
                if DEBUG:
                    return jsonify({
                        'error': 'Bad Request: Invalid input data',
                        'details': e.errors()
                    }), 400
                return jsonify({'error': 'Invalid request'}), 400
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator
