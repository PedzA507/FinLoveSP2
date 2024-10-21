import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, Box, Typography, Container } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const token = localStorage.getItem('token');
const url = process.env.REACT_APP_BASE_URL;

export default function EditEmployee() {
  const [empID, setEmpID] = useState(''); // รหัสพนักงาน
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phonenumber, setPhonenumber] = useState(''); // เบอร์โทร
  const [gender, setGender] = useState(''); // เพศ
  const [profileImage, setProfileImage] = useState(null); // สำหรับรูปภาพใหม่
  const { id } = useParams(); // ดึง empID จาก URL

  useEffect(() => {
    // ดึงข้อมูลพนักงานจาก API
    axios.get(`${url}/employee/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      const employee = response.data;
      setEmpID(employee.empID); // ตั้งค่า empID จากข้อมูลที่ได้มา
      setUsername(employee.username);
      setFirstName(employee.firstname || ''); // ตรวจสอบและตั้งค่าเป็นค่าว่างถ้าเป็น null
      setLastName(employee.lastname || '');   // ตรวจสอบและตั้งค่าเป็นค่าว่างถ้าเป็น null
      setEmail(employee.email);
      setPhonenumber(employee.phonenumber || ''); // ใช้ phonenumber แทน phoneNumber
      setGender(employee.gender || ''); // เพิ่ม gender
    })
    .catch(error => {
      console.error('Error fetching employee data:', error);
    });
  }, [id]);

  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  // ฟังก์ชันสำหรับส่งข้อมูลที่แก้ไขไปยัง API
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('username', username);
    formData.append('firstname', firstName || '');  // ตรวจสอบไม่ให้เป็น null
    formData.append('lastname', lastName || '');    // ตรวจสอบไม่ให้เป็น null
    formData.append('email', email);
    formData.append('phonenumber', phonenumber); // เบอร์โทร
    formData.append('gender', gender); // เพศ

    if (profileImage) {
      formData.append('profileImage', profileImage); // ส่งรูปภาพถ้ามีการเปลี่ยนแปลง
    }

    try {
      const response = await axios.put(`${url}/employee/${id}`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' // ใช้ multipart/form-data สำหรับการส่งไฟล์
        }
      });

      const result = response.data;
      if (result.status) {
        alert('บันทึกข้อมูลสำเร็จ');
      } else {
        alert('เกิดข้อผิดพลาด: ' + result.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        alert('คุณไม่มีสิทธิ์ในการแก้ไขข้อมูล');
      } else {
        console.error('Error submitting form:', error);
      }
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">แก้ไขข้อมูลพนักงาน</Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          รหัสพนักงาน: {empID} {/* แสดงรหัสพนักงาน */}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="username"
                label="ชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="firstname"
                label="ชื่อ"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastname"
                label="นามสกุล"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="อีเมล"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="phonenumber" // เบอร์โทร
                label="เบอร์โทร"
                value={phonenumber}
                onChange={(e) => setPhonenumber(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="gender"
                label="เพศ"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              {/* Input สำหรับอัปโหลดรูปภาพ */}
              <input type="file" onChange={handleImageChange} />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            บันทึกข้อมูล
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
