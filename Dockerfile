FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY leadback ./leadback
# Mount a persistent volume at /data so the SQLite database survives redeploys.
ENV DATABASE_PATH=/data/leadback.db
RUN mkdir -p /data
EXPOSE 8000
CMD ["uvicorn", "leadback.app:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000"]
