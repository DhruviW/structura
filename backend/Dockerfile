FROM --platform=linux/amd64 python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenSeesPy
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    libgfortran5 \
    libblas3 \
    liblapack3 \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Verify OpenSeesPy imports correctly
RUN python -c "import openseespy.opensees as ops; print('OpenSeesPy OK')" || \
    echo "WARNING: OpenSeesPy import failed, analysis endpoint will error"

COPY . .

EXPOSE 8000

# Render sets PORT env var; default to 8000
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
