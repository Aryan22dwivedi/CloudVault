import boto3
import os
from dotenv import load_dotenv
from botocore.client import Config

# Load variables
load_dotenv()

# Read from .env
ENDPOINT = os.getenv("MINIO_ENDPOINT")
ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY")
SECRET_KEY = os.getenv("MINIO_SECRET_KEY")
BUCKET_NAME = os.getenv("BUCKET_NAME")

# Initialize Client
s3_client = boto3.client(
    's3',
    endpoint_url=f"http://{ENDPOINT}",
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    config=Config(signature_version='s3v4')
)

def upload_file_to_s3(file_obj, object_name, content_type):
    try:
        s3_client.upload_fileobj(
            file_obj,
            BUCKET_NAME,
            object_name,
            ExtraArgs={'ContentType': content_type}
        )
        return True
    except Exception as e:
        print(f"❌ MinIO Upload Error: {e}")
        return False

def generate_presigned_url(object_name, expiration=3600, force_download=False, filename=None):
    try:
        params = {'Bucket': BUCKET_NAME, 'Key': object_name}
        if force_download and filename:
            params['ResponseContentDisposition'] = f'attachment; filename="{filename}"'

        response = s3_client.generate_presigned_url(
            'get_object',
            Params=params,
            ExpiresIn=expiration
        )
        return response
    except Exception as e:
        print(f"❌ Link Error: {e}")
        return None