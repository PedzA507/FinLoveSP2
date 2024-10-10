import { React, useState, useEffect } from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import HomeIcon from '@mui/icons-material/Home';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import FeedbackIcon from '@mui/icons-material/Feedback';
import InfoIcon from '@mui/icons-material/Info';
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";
import BackgroundImage from '../../assets/BG.png';

// Custom theme
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
      color: '#ffffff',
    },
    h6: {
      color: '#ffffff',
      fontWeight: 'bold',
    },
  },
});

const drawerWidth = 240;
const token = localStorage.getItem('token');
const url = process.env.REACT_APP_BASE_URL;

export default function View() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [genderID, setGenderID] = useState("");
  const [imageFile, setImageFile] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");  
  const { id } = useParams();  // ใช้ employeeID จากการคลิกดู
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the current employee data when the component is mounted
    axios.get(`${url}/profile/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then(response => {
        const employee = response.data;
        setFirstName(employee.firstname || "No Firstname Provided");
        setLastName(employee.lastname || "No Lastname Provided");
        setEmail(employee.email || "No Email Provided");
        setGenderID(employee.GenderID !== undefined ? employee.GenderID : "-");  // ใช้ GenderID
        setImageFile(employee.imageFile || "");
        setAddress(employee.home || "No home provided");  // ใช้ home แทน address
        setPhoneNumber(employee.phonenumber || "No phone number provided");  // ใช้ phonenumber
      })
      .catch(error => {
        console.error('Error fetching employee data:', error);
      });
  }, [id]);

  // Function to handle employee update
  const Updateemployee = (id) => {
    navigate(`/admin/customer/update/${id}`);
  }

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, action: () => navigate('/') },
    { text: 'Add Employee', icon: <AnalyticsIcon />, action: () => navigate('/addemployee') },
    { text: 'Clients', icon: <PeopleIcon />, action: () => navigate('/admin/customer') },
    { text: 'Tasks', icon: <AnalyticsIcon />, action: () => navigate('/tasks') },
    { text: 'Settings', icon: <SettingsIcon />, action: () => navigate('/settings') },
    { text: 'Feedback', icon: <FeedbackIcon />, action: () => navigate('/feedback') },
    { text: 'About', icon: <InfoIcon />, action: () => navigate('/about') },
  ];

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundImage: `url(${BackgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {/* Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              backgroundColor: '#1f1f1f',
              color: '#ffffff',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {menuItems.map((item, index) => (
                <ListItem button key={item.text} onClick={item.action}>
                  <ListItemIcon sx={{ color: '#ffffff' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        <Container maxWidth="md" sx={{ marginTop: 10, marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
          <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '15px', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)', padding: '30px', width: '100%' }}>
            <CardContent>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Avatar sx={{ width: 150, height: 150 }}
                    src={imageFile ? `${url}/customer/image/${imageFile}` : '/path/to/default-avatar.jpg'} />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Typography variant="h4" gutterBottom>
                    {firstName} {lastName}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {email}
                  </Typography>
                  <Typography color="textSecondary">
                    เพศ : {genderID === 0 ? "ชาย" : genderID === 1 ? "หญิง" : "-"}
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ marginY: 2 }} />
              <Typography variant="body1" gutterBottom>
                ที่อยู่ : {address}
              </Typography>
              <Typography variant="body1" gutterBottom>
                เบอร์โทร : {phoneNumber}
              </Typography>
              <Divider sx={{ marginY: 2 }} />
              <Button variant="contained" color="primary"
                onClick={() => Updateemployee(id)}>
                แก้ไขบัญชีผู้ใช้
              </Button>
            </CardContent>
          </Card>
        </Container>

      </Box>
    </ThemeProvider>
  );
}
