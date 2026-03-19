FROM --platform=linux/amd64 python:3.10-slim

WORKDIR /app

# Install all system dependencies OpenSeesPy needs on Linux
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    libgfortran5 \
    libblas3 \
    liblapack3 \
    libstdc++6 \
    tcl8.6 \
    tk8.6 \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Verify OpenSeesPy imports correctly during build
RUN python -c "import openseespy.opensees as ops; ops.wipe(); print('OpenSeesPy verified OK')"

COPY . .

EXPOSE 8000

CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
