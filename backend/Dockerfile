FROM python:3.11-slim

# Install system dependencies
# libreoffice-writer + fonts enable layout-accurate Word/Doc -> PDF conversion
RUN apt-get update && apt-get install -y \
    poppler-utils \
    libmagic1 \
    curl \
    gcc \
    libreoffice-writer \
    fonts-liberation \
    fonts-dejavu \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose the Railway public domain target port.
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run the app
CMD ["sh", "start.sh"]
