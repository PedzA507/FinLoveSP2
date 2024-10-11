import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom'; 
import BackgroundImage from './assets/BG.png'; 

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
          backgroundImage: `url(${BackgroundImage})`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
        }}
      >
        <Container component="main" maxWidth="sm">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              padding: '40px',
              borderRadius: '15px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
              minHeight: '500px',
            }}
          >
            <Typography component="h1" variant="h4" sx={{ backgroundColor: '#b3b3ff', padding: '10px 30px', borderRadius: '15px 15px 15px 15px', color: 'white', width: '100%', textAlign: 'center', mb: 4 }}>
              Sign In
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, backgroundColor: '#333', color: 'white', padding: '12px' }}
              >
                Sign In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2" onClick={() => navigate('/forgotpass')}>
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2" onClick={() => navigate('/signup')}>
                    {"Don't have an account? Sign Up"}
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
