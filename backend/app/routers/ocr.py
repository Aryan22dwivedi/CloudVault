import os
import io
import re
import json
import traceback
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from PIL import Image
import pytesseract
import google.generativeai as genai
from dotenv import load_dotenv

# --- CONFIGURATION ---
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

router = APIRouter(prefix="/tools", tags=["Tools"])

# Configure Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# --- REGEX PATTERNS ---
EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
URL_RE = re.compile(r"(https?://[^\s]+|www\.[^\s]+)")
PHONE_RE = re.compile(
    r"""
    (?:(?:\+|00)\d{1,3}[\s\-\.\)]*)?
    (?:\(?\d{2,4}\)?[\s\-\.\)]*)?
    \d{3,4}[\s\-\.\)]*\d{3,4}
    """,
    re.VERBOSE,
)

# --- HELPER FUNCTIONS ---
def _dedupe_preserve_order(items):
    seen = set()
    out = []
    for i in items:
        cleaned = i.strip()
        if cleaned and cleaned not in seen:
            seen.add(cleaned)
            out.append(cleaned)
    return out

def _clean_phone(s: str) -> str:
    s = s.strip()
    s = re.sub(r"[\s\-\.\)]+", " ", s)
    return s.strip()

# --- GEMINI OCR LOGIC ---
def extract_with_gemini(image):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = """
        Analyze this image and extract contact information.
        Return ONLY a raw JSON object with these keys: "emails", "phones", "urls".
        Do not include markdown formatting like ```json.
        If a field is empty, return an empty list [].
        """
        response = model.generate_content([prompt, image])
        text = response.text.strip()
        
        # Clean markdown if present
        if text.startswith("```"): text = text.split("\n", 1)[1]
        if text.endswith("```"): text = text.rsplit("\n", 1)[0]
        
        return json.loads(text)
    except Exception as e:
        print(f"⚠️ Gemini Error: {e}")
        return None

# --- TESSERACT OCR LOGIC ---
def extract_with_tesseract(image):
    print("🔄 Switching to Tesseract OCR...")
    text = pytesseract.image_to_string(image)
    
    raw_emails = EMAIL_RE.findall(text)
    raw_urls = URL_RE.findall(text)
    raw_phones = [m.group(0) for m in PHONE_RE.finditer(text)]
    
    return {
        "emails": _dedupe_preserve_order(raw_emails),
        "urls": _dedupe_preserve_order([u.rstrip('.,;)') for u in raw_urls]),
        "phones": _dedupe_preserve_order([_clean_phone(p) for p in raw_phones]),
        "method": "Tesseract"
    }

# --- Pydantic Model for Manual Entry ---
class ManualEntryRequest(BaseModel):
    emails: str = ""
    phones: str = ""
    urls: str = ""

# --- ENDPOINTS ---

@router.post("/scan")
async def scan_image(
    file: UploadFile = File(...), 
    ocr_mode: str = Form("auto")
):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        result = None
        error_msg = None

        # 1. FORCE GEMINI
        if ocr_mode == "gemini":
            if GEMINI_API_KEY:
                result = extract_with_gemini(image)
                if result: result["method"] = "Gemini AI ⚡"
                else: error_msg = "Gemini returned no data."
            else:
                error_msg = "Gemini API Key missing."

        # 2. FORCE TESSERACT
        elif ocr_mode == "tesseract":
            result = extract_with_tesseract(image)

        # 3. AUTO (Default)
        else:
            if GEMINI_API_KEY:
                try:
                    result = extract_with_gemini(image)
                    if result: result["method"] = "Gemini AI ⚡"
                except: pass
            
            if not result:
                result = extract_with_tesseract(image)

        if not result:
             return JSONResponse(
                 content={"error": error_msg or "OCR Failed."}, 
                 status_code=400
             )

        return result

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)

@router.post("/manual")
async def manual_entry(payload: ManualEntryRequest):
    """
    Processes manual text using the same Regex logic as OCR.
    """
    def split_and_clean(text):
        if not text: return []
        items = re.split(r'[,\n]', text)
        return [i.strip() for i in items if i.strip()]

    raw_emails = split_and_clean(payload.emails)
    raw_phones = split_and_clean(payload.phones)
    raw_urls = split_and_clean(payload.urls)

    # Clean Data
    valid_emails = [e for e in raw_emails if EMAIL_RE.match(e)]
    
    valid_phones = []
    for p in raw_phones:
        if re.search(r'\d{3}', p):
             valid_phones.append(_clean_phone(p))

    valid_urls = [u.rstrip('.,;)') for u in raw_urls]

    return {
        "emails": _dedupe_preserve_order(valid_emails),
        "phones": _dedupe_preserve_order(valid_phones),
        "urls": _dedupe_preserve_order(valid_urls),
        "method": "Manual Entry (Regex)"
    }