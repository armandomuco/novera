# Infrastructure

Local development uses Docker Compose for MongoDB, Redis, and MinIO.

Production should split the API, worker, and web app into separately deployable services. Use managed MongoDB Atlas, managed Redis, S3-compatible object storage, centralized logs, metrics, alerts, backups, and secret management.
