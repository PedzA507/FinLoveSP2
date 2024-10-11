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

export default function ForgotPass() {
  const [email, setEmail] = useState("");
  const [verifyPin, setVerifyPin] = useState("");
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(process.env.REACT_APP_BASE_URL + '/forgot-password',
        {
          email,
          verifyPin,
        }
      );
      const result = response.data;
      console.log(result);
      alert(result['message']);

      
      if (result['status'] === true) {
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
              Forgot Password
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="verifypin"
                    label="Verify PIN"
                    id="verifypin"
                    autoComplete="verifypin"
                    onChange={(e) => setVerifyPin(e.target.value)}
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 4, mb: 2, backgroundColor: '#333', color: 'white', padding: '12px' }}
              >
                Reset Password
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link href="#" variant="body2" onClick={() => navigate('/choice')}>
                    Remember your password? Sign in
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
