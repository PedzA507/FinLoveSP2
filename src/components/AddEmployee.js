import React, { useState } from 'react';
import { Button, CssBaseline, TextField, Grid, Box, Typography, Container } from '@mui/material';
import Alert from '@mui/material/Alert';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';

// Custom theme
const customTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ff6699', // สีชมพูอ่อน
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
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '15px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
              border: '1px solid #ddd' 
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
                sx={{ mb: 2, backgroundColor: '#fff', borderRadius: '10px' }}
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
                sx={{ mb: 2, backgroundColor: '#fff', borderRadius: '10px' }}
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
                sx={{ mb: 2, backgroundColor: '#fff', borderRadius: '10px' }}
              />
              <TextField
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2, backgroundColor: '#fff', borderRadius: '10px' }}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    id="gender"
                    label="Gender"
                    name="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    sx={{ mb: 2, backgroundColor: '#fff', borderRadius: '10px' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    id="positionID"
                    label="Position ID"
                    name="positionID"
                    value={positionID}
                    onChange={(e) => setPositionID(e.target.value)}
                    sx={{ mb: 2, backgroundColor: '#fff', borderRadius: '10px' }}
                  />
                </Grid>
              </Grid>

              {/* เพิ่มฟิลด์สำหรับเบอร์โทร */}
              <TextField
                fullWidth
                id="phonenumber"
                label="Phone Number"
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
                variant="outlined"
                sx={{
                  mt: 3,
                  mb: 2,
                  color: '#ff6699',
                  backgroundColor: 'transparent',
                  padding: '12px',
                  borderRadius: '15px',
                  border: '2px solid #ff6699',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                เพิ่มข้อมูลแอดมิน
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
