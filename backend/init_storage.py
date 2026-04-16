import os
import boto3
from dotenv import load_dotenv
from botocore.client import Config

# Load variables from .env
load_dotenv()

ENDPOINT = os.getenv("MINIO_ENDPOINT")
ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY")
SECRET_KEY = os.getenv("MINIO_SECRET_KEY")
BUCKET_NAME = os.getenv("BUCKET_NAME")

print(f"🔌 Connecting to MinIO at {ENDPOINT}...")

s3 = boto3.client(
    's3',
    endpoint_url=f"http://{ENDPOINT}",
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    config=Config(signature_version='s3v4')
)

def init():
    try:
        # Check if bucket exists
        s3.head_bucket(Bucket=BUCKET_NAME)
        print(f"✅ Bucket '{BUCKET_NAME}' already exists.")
    except Exception:
        # If not, create it
        print(f"⚠️ Bucket '{BUCKET_NAME}' not found. Creating it...")
        try:
            s3.create_bucket(Bucket=BUCKET_NAME)
            print(f"🚀 Success! Bucket '{BUCKET_NAME}' created.")
        except Exception as e:
            print(f"❌ Failed to create bucket: {e}")

if __name__ == "__main__":
    init()