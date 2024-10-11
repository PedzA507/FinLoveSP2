import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {useState} from "react";
import axios from "axios";
import AccountCircle from '@mui/icons-material/AccountCircle';
import InputAdornment from '@mui/material/InputAdornment';
import KeyIcon from '@mui/icons-material/Key';

function MyFunction(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyrights © '}
      <Link color="inherit" href="https://www.rmutto.ac.th/">
        Shopdee.com
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const url = process.env.REACT_APP_BASE_URL;
const defaultTheme = createTheme();

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await axios.post(url + '/admin/login',
            {
                username,
                password
            }
        );

        const result = response.data;
        console.log(result);
        alert(result['message']);

        if(result['status'] === true){
            localStorage.setItem('token', result['token']);
            window.location.href = '/admin/customer';
        }
    }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.dark' }}>            
            <LockOutlinedIcon/>            
          </Avatar>
          <Typography component="h1" variant="h5">
          เข้าสู่ระบบ
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField              
              margin="normal"
              required
              fullWidth
              id="username"
              label="ชื่อผู้ใช้"
              name="username"
              autoComplete="username"
              autoFocus              
              value={username}
              onChange={ (e) => setUsername(e.target.value) }
              slotProps={{
                input: {
                  endAdornment: 
                  <InputAdornment position="start">
                    <AccountCircle/>                    
                  </InputAdornment>,
                },
              }}  
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="รหัสผ่าน"              
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={ (e) => setPassword(e.target.value) }
              slotProps={{
                input: {
                  endAdornment: 
                  <InputAdornment position="start">
                    <KeyIcon/>                
                  </InputAdornment>,
                },
              }} 
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="จำรหัสผ่าน"
            />
            <Button
              id="btnLogin"
              name="btnLogin"
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              เข้าสู่ระบบ
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  ลืมรหัสผ่าน
                </Link>
              </Grid>
              <Grid item>
                <Link href="#" variant="body2">
                  {"สมัครสมาชิก"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <MyFunction sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}