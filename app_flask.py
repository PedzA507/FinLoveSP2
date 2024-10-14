from flask import Flask, send_file, request, abort
from sklearn.neighbors import NearestNeighbors
import mysql.connector as sql
import pandas as pd
import os
import warnings

# Suppress warnings
warnings.filterwarnings("ignore")

# Create the Flask app (API)
app = Flask(__name__)

# Connect to the database
conn = sql.connect(host="localhost",
                   database="finlove", 
                   user="root",
                   password="1234")


@app.route('/api/recommend/<int:id>', methods=['GET'])
def recommend(id):
    # ดึงข้อมูลจากตาราง userpreferences
    sql_query = "SELECT * FROM userpreferences"
    x = pd.read_sql(sql_query, conn)

    # Pivot ข้อมูลเพื่อให้แต่ละ UserID เป็นแถว และ PreferenceID เป็นคอลัมน์
    x = x.pivot_table(index='UserID', columns='PreferenceID', aggfunc='size', fill_value=0)

    # แยกข้อมูลสำหรับผู้ใช้ที่ล็อกอินและผู้ใช้คนอื่น ๆ
    x_login_user = x.loc[[id]]  # ข้อมูลของผู้ใช้ที่ล็อกอิน
    x_other_users = x.drop([id])  # ข้อมูลของผู้ใช้คนอื่น ๆ

    # ตรวจสอบความชอบที่ตรงกันอย่างน้อย 1 ข้อ
    recommended_user_ids = []
    for other_user_id, other_user_data in x_other_users.iterrows():
        # คำนวณความชอบที่ตรงกันระหว่างผู้ใช้ที่ล็อกอินกับผู้ใช้คนอื่น
        common_preferences = (x_login_user.values[0] == other_user_data.values).sum()

        # ถ้ามีความชอบตรงกันอย่างน้อย 1 ข้อ ให้แนะนำผู้ใช้นั้น
        if common_preferences >= 1:
            recommended_user_ids.append(other_user_id)

    # ถ้าไม่มีผู้ใช้ที่ตรงกัน ให้ส่งข้อมูลว่างกลับ
    if len(recommended_user_ids) == 0:
        return {"message": "No similar users found"}, 200

    # แปลง UserID ที่แนะนำเป็นสตริงเพื่อใช้ใน SQL Query
    recommended_user_ids_str = ', '.join(map(str, recommended_user_ids))

    if not conn.is_connected():
        conn.reconnect()

    # ดึงข้อมูลผู้ใช้ที่แนะนำพร้อมทั้งแสดง nickname และ imageFile
    sql_query = f'''
    SELECT 
        user.UserID, 
        user.nickname, 
        user.imageFile
    FROM user
    WHERE UserID IN ({recommended_user_ids_str})
    '''
    recommended_users = pd.read_sql(sql_query, conn)

    # ปรับปรุงเส้นทางของ imageFile
    for index, user in recommended_users.iterrows():
        if user['imageFile']:
            # ตรวจสอบเส้นทางรูปภาพให้ตรงกับ API /api/user/<filename>
            recommended_users.at[index, 'imageFile'] = f"http://{request.host}/api/user/{user['imageFile']}"

    # ส่งข้อมูลผู้ใช้ที่แนะนำกลับในรูปแบบ JSON
    return recommended_users[['UserID', 'nickname', 'imageFile']].to_dict(orient='records'), 200


# Create Web server
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)