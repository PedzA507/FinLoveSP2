import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom'; 
import Logo from './assets/logofin.png'; // ใส่ path ของโลโก้ที่คุณใช้

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const defaultTheme = createTheme();

export default function SignInUser() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(process.env.REACT_APP_BASE_URL + '/login',
        {
          username,
          password
        }
      );

      const result = response.data;
      console.log(result);
      alert(result['message']);

      if (result['status'] === true) {
        localStorage.setItem('token', result['token']);
        // ตรวจสอบ role ที่ได้รับจาก backend
        if (result['role'] === 'admin') {
          navigate('/dashboard'); // นำทางไปยังหน้าหลักของ admin
        } else if (result['role'] === 'employee') {
          navigate('/dashboard'); // นำทางไปยังหน้าหลักของ employee
        } else {
          navigate('/cusview'); // นำทางไปยังหน้าหลักของ user
        }
      }

    } catch (err) {
      console.log(err);
    }
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#F8E9F0', // สีพื้นหลังตามตัวอย่าง
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
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
              backgroundColor: 'transparent', // เอากรอบสีขาวออก
              padding: '40px',
              borderRadius: '15px',
              minHeight: '500px',
            }}
          >
            {/* เปลี่ยน Avatar เป็นโลโก้สี่เหลี่ยมขอบมน */}
            <Avatar src={Logo} sx={{ width: 80, height: 80, mb: 2, borderRadius: '10px' }} />
            <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', color: '#000', mb: 4 }}>
              FINLOVE
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                InputLabelProps={{
                  sx: {
                    transform: 'translate(14px, 10px) scale(1)', // ปรับตำแหน่งเริ่มต้นของ label
                    '&.MuiInputLabel-shrink': {
                      transform: 'translate(15px, -20px) scale(1)', // ปรับตำแหน่งเมื่อ label ลอย
                    },
                  },
                }}
                sx={{
                  backgroundColor: '#fff', // ปรับสีพื้นหลังเป็นสีขาว
                  width: '100%',
                  height: '50px',
                  borderRadius: '10px',
                  border: '1px solid #000',
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', // เพิ่มเงารอบกรอบ
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'transparent', // ลบขอบของกรอบ
                    },
                    '&:hover fieldset': {
                      borderColor: 'transparent', // ลบขอบเมื่อโฟกัส
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'transparent', // ลบขอบเมื่อโฟกัส
                    },
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                InputLabelProps={{
                  sx: {
                    transform: 'translate(14px, 10px) scale(1)', // ปรับตำแหน่งเริ่มต้นของ label
                    '&.MuiInputLabel-shrink': {
                      transform: 'translate(15px, -20px) scale(1)', // ปรับตำแหน่งเมื่อ label ลอย
                    },
                  },
                }}
                sx={{
                  backgroundColor: '#fff', // ปรับสีพื้นหลังเป็นสีขาว
                  width: '100%',
                  height: '50px',
                  borderRadius: '10px',
                  border: '1px solid #000',
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', // เพิ่มเงารอบกรอบ
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'transparent', // ลบขอบของกรอบ
                    },
                    '&:hover fieldset': {
                      borderColor: 'transparent', // ลบขอบเมื่อโฟกัส
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'transparent', // ลบขอบเมื่อโฟกัส
                    },
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  backgroundColor: '#FF6699',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  width: '450px',
                  height: '45px',
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', // เพิ่มเงารอบปุ่ม
                }}
              >
                เข้าสู่ระบบ
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2" onClick={() => navigate('/forgotpass')}>
                    ลืมรหัสผ่าน?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2" onClick={() => navigate('/signup')}>
                    {"สมัครสมาชิก"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Copyright sx={{ mt: 5 }} />
        </Container>
      </Box>
    </ThemeProvider>
  );
}
