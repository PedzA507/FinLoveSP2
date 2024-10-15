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
      main: '#ff6699', // เปลี่ยนเป็นสีชมพูอ่อน
    },
    background: {
      default: '#F8E9F0', // สีพื้นหลังจากตัวอย่าง
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
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
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(process.env.REACT_APP_BASE_URL + '/employee',
        {
          username,
          firstName,
          lastName,
          email,
          gender,
          positionID
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
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
        <Container component="main" maxWidth="xs"> {/* จำกัดความกว้างให้สอดคล้องกับตัวอย่าง */}
          <CssBaseline />
          <Box
            sx={{
              marginTop: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'white', // เปลี่ยนเป็นสีขาวตามตัวอย่าง
              padding: '40px',
              borderRadius: '15px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', color: '#000', mb: 3 }}>
              เพิ่มข้อมูลแอดมิน
            </Typography>

            {/* Display message alert */}
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

              <Button
                type="submit"
                fullWidth
                variant="outlined" // เปลี่ยนเป็น Outlined ตามตัวอย่าง
                sx={{
                  mt: 3,
                  mb: 2,
                  color: '#000', // ใช้สีดำตามตัวอย่างในรูป
                  backgroundColor: 'transparent', // เปลี่ยนพื้นหลังเป็นโปร่งใส
                  padding: '12px',
                  borderRadius: '15px', // เปลี่ยนเป็นขอบมนตามตัวอย่าง
                  border: '2px solid #000', // ใช้ขอบสีดำตามตัวอย่าง
                  textAlign: 'center', // จัดกลางข้อความในปุ่ม
                  fontWeight: 'bold', // ทำให้ตัวอักษรหนา
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
