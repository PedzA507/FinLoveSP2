import React, { useState } from 'react';
import { Button, CssBaseline, TextField, Grid, Box, Typography, Container } from '@mui/material';
import Alert from '@mui/material/Alert';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Import useNavigate เพื่อใช้ในการนำทาง

// Custom theme
const customTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000', // เปลี่ยนสีของขอบเมื่อคลิกเป็นสีดำแทน
    },
    background: {
      default: '#F8E9F0', // สีพื้นหลัง
    },
    text: {
      primary: '#000000', // สีดำสำหรับข้อความหลัก
      secondary: '#666666', // สีเทาสำหรับข้อความรอง
    },
  },
  typography: {
    h1: {
      fontSize: '1.8rem',
      fontWeight: 'bold',
      color: '#000',
    },
    h5: {
      color: '#333333',
    },
    h6: {
      color: '#333333',
      fontWeight: 'bold',
    },
  },
});

export default function AddEmployee() {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [positionID, setPositionID] = useState('');
  const [phonenumber, setPhonenumber] = useState(''); // เพิ่ม state สำหรับเบอร์โทร
  const [profileImage, setProfileImage] = useState(null); // เพิ่ม state สำหรับจัดเก็บรูปภาพ
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  
  const navigate = useNavigate(); // ใช้ useNavigate สำหรับการนำทาง

  // ฟังก์ชันสำหรับอัปโหลดรูปภาพ
  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(); // ใช้ FormData เพื่อให้รองรับการอัปโหลดไฟล์
    formData.append('username', username);
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('email', email);
    formData.append('gender', gender);
    formData.append('positionID', positionID);
    formData.append('phonenumber', phonenumber); // เพิ่มเบอร์โทรลงใน FormData
    if (profileImage) {
      formData.append('profileImage', profileImage); // เพิ่มรูปภาพลงใน FormData
    }

    try {
      const response = await axios.post(process.env.REACT_APP_BASE_URL + '/employee', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data' // ใช้ multipart/form-data ในการส่งข้อมูล
        }
      });
      const result = response.data;
      setMessage(result['message']);
      setStatus(result['status']);

      if (result['status'] === true) {
        // Reset fields
        setUsername('');
        setFirstName('');
        setLastName('');
        setEmail('');
        setGender('');
        setPositionID('');
        setPhonenumber(''); // Reset เบอร์โทร
        setProfileImage(null); // Reset รูปภาพ
      }
    } catch (err) {
      console.log(err);
      setMessage('เกิดข้อผิดพลาดในการเพิ่มพนักงาน');
      setStatus(false);
    }
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8E9F0',
        }}
      >
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', color: '#ff6699', mb: 3 }}>
              เพิ่มข้อมูลแอดมิน
            </Typography>

            {message && (
              <Alert severity={status ? 'success' : 'error'} sx={{ width: '100%', mb: 2 }}>
                {message}
              </Alert>
            )}

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 2, backgroundColor: '#fff', borderRadius: '4px' }}
                variant="outlined"
              />
              <TextField
                required
                fullWidth
                id="firstname"
                label="Firstname"
                name="firstname"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                sx={{ mb: 2, backgroundColor: '#fff', borderRadius: '4px' }}
                variant="outlined"
              />
              <TextField
                required
                fullWidth
                id="lastname"
                label="Lastname"
                name="lastname"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                sx={{ mb: 2, backgroundColor: '#fff', borderRadius: '4px' }}
                variant="outlined"
              />
              <TextField
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2, backgroundColor: '#fff', borderRadius: '4px' }}
                variant="outlined"
              />
              {/* ช่องกรอกข้อมูล Gender และ Position ID จะถูกจัดเรียงให้เรียงลงมาแบบเดียวกับช่องกรอกข้อมูลอื่น */}
              <TextField
                fullWidth
                id="gender"
                label="GenderID"
                name="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                sx={{ mb: 2, backgroundColor: '#fff', borderRadius: '4px' }}
                variant="outlined"
              />
              <TextField
                fullWidth
                id="positionID"
                label="Position ID"
                name="positionID"
                value={positionID}
                onChange={(e) => setPositionID(e.target.value)}
                sx={{ mb: 2, backgroundColor: '#fff', borderRadius: '4px' }}
                variant="outlined"
              />

              {/* เพิ่มฟิลด์สำหรับเบอร์โทร */}
              <TextField
                fullWidth
                id="phonenumber"
                label="Phonenumber"
                name="phonenumber"
                value={phonenumber}
                onChange={(e) => setPhonenumber(e.target.value)}
                sx={{ mb: 2, backgroundColor: '#fff', borderRadius: '10px' }}
              />

              {/* เพิ่มฟิลด์สำหรับอัปโหลดรูปภาพ */}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                style={{ marginTop: '16px', marginBottom: '16px' }} 
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  color: '#fff',
                  backgroundColor: '#ff6699',
                  padding: '12px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#ff4d88', // สีเมื่อ hover กลับไปแบบเดิม
                  },
                }}
              >
                เพิ่มข้อมูลแอดมิน
              </Button>

              {/* ปุ่มย้อนกลับไปหน้าแดชบอร์ด */}
              <Button
                fullWidth
                variant="outlined"
                sx={{
                  color: '#000',
                  mt: 2,
                  borderRadius: '10px',
                  textAlign: 'center',
                  border: '2px solid #000', // ขอบสีดำ
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#ff69b4',
                  },
                }}
                onClick={() => navigate('/dashboard')}  // ใช้ navigate กลับไปหน้าแดชบอร์ด
              >
                ย้อนกลับไปหน้าแดชบอร์ด
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
