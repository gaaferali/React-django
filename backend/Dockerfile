# Use official Python runtime as base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Set work directory
WORKDIR /app

# Install system dependencies

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install  -r requirements.txt

# Copy project
COPY . .

# Expose port
EXPOSE 8000

# Run gunicorn
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
