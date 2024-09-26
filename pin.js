const pinCode = Math.floor(1000 + Math.random() * 9000); // สุ่ม PIN 4 หลัก
const expirationDate = new Date(Date.now() + 3600000); // หมดอายุใน 1 ชั่วโมง

await db.promise().query(
    "UPDATE User SET pinCode = ?, pinCodeExpiration = ? WHERE email = ?",
    [pinCode, expirationDate, email]
);
