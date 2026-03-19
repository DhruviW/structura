FROM --platform=linux/amd64 python:3.10

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Debug: show what openseespy installed and try to import
RUN python -c "import openseespy; print(openseespy.__file__)" || true
RUN python -c "import openseespy.opensees" 2>&1 || \
    python -c "import sys; print(sys.path)" && \
    find /usr/local/lib/python3.10/site-packages/opensees* -name "*.so" 2>/dev/null | head -5 || true

COPY . .

EXPOSE 8000

CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
