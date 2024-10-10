import React, { useState, useEffect } from 'react';
import { Button, TextField, Grid, Box, Typography, Container } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const token = localStorage.getItem('token');
const url = process.env.REACT_APP_BASE_URL;

export default function EditUser() {
  const [userID, setUserID] = useState(''); // เพิ่ม userID
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { id } = useParams(); // ดึง userID จาก URL

  useEffect(() => {
    // ดึงข้อมูลผู้ใช้จาก API
    axios.get(`${url}/profile/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      const user = response.data;
      setUserID(user.userID); // ตั้งค่า userID จากข้อมูลที่ได้มา
      setUsername(user.username);
      setFirstName(user.firstname);
      setLastName(user.lastname);
      setEmail(user.email);
      setAddress(user.home);
      setPhoneNumber(user.phonenumber);
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await axios.put(`${url}/user/${id}`, {
      username,
      firstname: firstName,
      lastname: lastName,
      email,
      home: address,
      phonenumber: phoneNumber
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const result = response.data;
    if (result.status) {
        alert('บันทึกข้อมูลสำเร็จ');
    } else {
        alert('เกิดข้อผิดพลาด: ' + result.message);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">แก้ไขข้อมูลผู้ใช้</Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          รหัสผู้ใช้: {userID} {/* แสดงรหัสผู้ใช้ */}
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
                id="address"
                label="ที่อยู่"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="phoneNumber"
                label="เบอร์โทร"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
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
