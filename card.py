from flask import Flask, request, jsonify
import cv2
import pytesseract
import re
import os

# กำหนดที่ตั้งของ tesseract บนเครื่อง (ตรวจสอบว่าเส้นทางนี้ถูกต้อง)
pytesseract.pytesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

app = Flask(__name__)

# ฟังก์ชันปรับแต่งภาพก่อน OCR
def preprocess_image_for_ocr(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    enhanced_image = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
    
    # เพิ่มการใช้ dilate เพื่อลด noise และทำให้เส้นขอบชัดเจนขึ้น
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    processed_image = cv2.dilate(enhanced_image, kernel, iterations=1)
    
    return processed_image

# ฟังก์ชัน OCR เพื่อดึงข้อความจากบัตรประชาชน
def extract_text_from_image(image):
    processed_image = preprocess_image_for_ocr(image)
    
    # ใช้ psm 4 เพื่อรองรับ layout ที่มีหลายบรรทัดและซับซ้อน
    custom_config = r'--psm 4'
    text = pytesseract.image_to_string(processed_image, config=custom_config, lang='eng+tha')
    
    # ลบอักขระพิเศษและตัวอักษรที่ไม่จำเป็นออก
    text = re.sub(r'[^\w\s]', '', text)
    return text

# ฟังก์ชันตรวจสอบว่าองค์ประกอบหลักของบัตรมีครบหรือไม่
def check_id_card_components(text):
    components = {
        "Identification Number": re.search(r'\d{1}\s*\d{4}\s*\d{5}\s*\d{2}\s*\d{1}', text),
        "Name": re.search(r'(Name|ชื่อ)\s*[A-Za-zก-ฮ]+', text),
        "Lastname": re.search(r'(Lastname|นามสกุล)\s*[A-Za-zก-ฮ]+', text)
    }
    
    missing_components = [key for key, value in components.items() if value is None]
    
    if missing_components:
        return False, missing_components
    return True, []

@app.route('/process', methods=['POST'])
def process_image():
    if 'id_card' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    id_card = request.files['id_card']
    
    # บันทึกภาพที่อัปโหลดไปยังโฟลเดอร์ 'uploads'
    upload_folder = 'uploads'
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    
    id_card_path = os.path.join(upload_folder, 'uploaded_id_card.jpg')
    id_card.save(id_card_path)

    image = cv2.imread(id_card_path)

    extracted_text = extract_text_from_image(image)
    print(f"Extracted Text: {extracted_text}")

    # ตรวจสอบว่ามีองค์ประกอบครบหรือไม่
    has_all_components, missing_components = check_id_card_components(extracted_text)

    if has_all_components:
        return jsonify({
            "message": "บัตรประชาชนมีองค์ประกอบครบถ้วน",
            "extracted_text": extracted_text
        })
    else:
        return jsonify({
            "message": "บัตรประชาชนขาดองค์ประกอบ",
            "missing_components": missing_components,
            "extracted_text": extracted_text
        }), 400

if __name__ == '__main__':
    app.run(debug=True)
