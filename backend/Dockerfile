FROM --platform=linux/amd64 python:3.10-slim

WORKDIR /app

# OpenSeesPy requires libblas, liblapack, libgfortran, libgomp
RUN apt-get update && apt-get install -y --no-install-recommends \
    libblas3 \
    liblapack3 \
    libgfortran5 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Verify OpenSeesPy loads correctly
RUN python -c "import openseespy.opensees as ops; ops.wipe(); print('OpenSeesPy OK')"

COPY . .

EXPOSE 8000

CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
