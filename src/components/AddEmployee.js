import React, { useState } from 'react';
import { Button, CssBaseline, TextField, Grid, Box, Typography, Container } from '@mui/material';
import Alert from '@mui/material/Alert';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import BackgroundImage from './assets/BG.png';

// Custom theme 
const customTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
  },
  typography: {
    h1: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1976d2',
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
          backgroundImage: `url(${BackgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container component="main" maxWidth="md"> {/* ขยาย maxWidth เป็น 'md' เพื่อรองรับข้อมูลเยอะขึ้น */}
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
              width: '100%',
            }}
          >
            <Typography component="h1" variant="h4" sx={{ backgroundColor: '#b3b3ff', padding: '10px 30px', borderRadius: '15px 15px 15px 15px', color: 'white', width: '100%', textAlign: 'center', mb: 4 }}>
            Add Employee
            </Typography>

            {/* Display message alert */}
            {message && (
              <Alert severity={status ? 'success' : 'error'} sx={{ width: '100%', mb: 2 }}>
                {message}
              </Alert>
            )}

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                required
                fullWidth
                id="firstname"
                label="First Name"
                name="firstname"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                required
                fullWidth
                id="lastname"
                label="Last Name"
                name="lastname"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
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
                    sx={{ mb: 2 }}
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
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  backgroundColor: '#333',
                  color: 'white',
                  padding: '12px',
                }}
              >
                ADD EMPLOYEE
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
