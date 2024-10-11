import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState } from "react";
import axios from "axios";
import BackgroundImage from '../../assets/BG.png';

// Custom theme (เหมือนกับหน้ารายการข้อมูลลูกค้า)
const customTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#1f1f1f',
      paper: '#242424',
    },
    text: {
      primary: '#000000',
      secondary: '#cccccc',
    },
  },
  typography: {
    h1: {
      fontSize: '2.5rem',
      color: '#000000',
    },
    h5: {
      color: '#000000',
    },
    h6: {
      color: '#000000 ',
      fontWeight: 'bold',
    },
  },
});

export default function Create() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await axios.post(process.env.REACT_APP_BASE_URL + '/register',
      {
        username,
        password,
        firstName,
        lastName
      }
    );

    const result = response.data;
    console.log(result);
    alert(result['message']);

    if (result['status'] === true) {
      window.location.href = '/admin/user';
    }
  }

  return (
    <ThemeProvider theme={customTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundImage: `url(${BackgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
        }}
      >
        <Container component="main" maxWidth="md"> {/* Increase the maxWidth to 'md' */}
          <CssBaseline />
          <Box
            sx={{
              marginTop: 4, // ลด marginTop เพื่อลดระยะห่างจากด้านบน
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '50px',  // Increased padding
              borderRadius: '20px',  // Increased border-radius for a softer look
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',  // Slightly larger shadow
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h4" sx={{ color: '#1976d2', mb: 2 }}> {/* Increase the font size */}
              เพิ่มข้อมูลสมาชิก
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Grid container spacing={3}> {/* Increase spacing between fields */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete="given-name"
                    name="firstName"
                    required
                    fullWidth
                    id="firstName"
                    label="ชื่อ"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoFocus
                    sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem' }}  // Slightly larger font
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="นามสกุล"
                    name="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                    sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="username"
                    label="ชื่่อผู้ใช้"
                    name="username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="รหัสผ่าน"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem' }}
                  />
                </Grid>
              </Grid>
              <Button
                id="btnCreate"
                name="btnCreate"
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 4,  // Increase top margin
                  mb: 3,  // Increase bottom margin
                  backgroundColor: '#333',  // Adjust button color to match primary theme
                  color: 'white',
                  padding: '14px',  // Increase padding for better touch experience
                  fontSize: '1.1rem'  // Slightly larger font for the button
                }}
              >
                บันทึกข้อมูล
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
