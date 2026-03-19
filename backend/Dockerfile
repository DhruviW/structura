FROM --platform=linux/amd64 python:3.10

WORKDIR /app

# Install libblas + liblapack (not included even in the full image)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libblas3 \
    liblapack3 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Verify OpenSeesPy loads
RUN python -c "import openseespy.opensees as ops; ops.wipe(); print('OpenSeesPy OK')"

COPY . .

EXPOSE 8000

CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
