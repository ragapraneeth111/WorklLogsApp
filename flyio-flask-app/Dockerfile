# Use Python slim image
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=8080
EXPOSE 8080

# Run Flask app with Gunicorn (the Flask object is `app` in app.py)
CMD ["gunicorn", "-b", "0.0.0.0:8080", "app:app"]
