FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y git libgl1 libglib2.0-0 curl && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "backend.segmentar:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
