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
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f0f0f0',
      paper: '#ffffff',
    },
  },
  typography: {
    h4: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#333',
    },
    h6: {
      color: '#666',
    },
    body1: {
      fontSize: '1rem',
      color: '#333',
    },
  },
});

const drawerWidth = 240;
const token = localStorage.getItem('token');
const url = process.env.REACT_APP_BASE_URL;

export default function View() {
  const [user, setUser] = useState({});
  const [reportHistory, setReportHistory] = useState([]);
  const { id } = useParams();  // UserID from the clicked profile
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the current user data
    axios.get(`${url}/profile/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then(response => {
        const userData = response.data;
        setUser(userData);
        setReportHistory(userData.reportHistory || []);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });
  }, [id]);

  const UpdateUser = (id) => {
    navigate(`/admin/customer/update/${id}`);
  }

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, action: () => navigate('/') },
    { text: 'Clients', icon: <PeopleIcon />, action: () => navigate('/admin/customer') },
    { text: 'Tasks', icon: <AnalyticsIcon />, action: () => navigate('/tasks') },
    { text: 'Settings', icon: <SettingsIcon />, action: () => navigate('/settings') },
    { text: 'Feedback', icon: <FeedbackIcon />, action: () => navigate('/feedback') },
    { text: 'About', icon: <InfoIcon />, action: () => navigate('/about') },
  ];

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundImage: `url(${BackgroundImage})`, backgroundSize: 'cover' }}>
        {/* Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              backgroundColor: '#f4f4f4',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {menuItems.map((item, index) => (
                <ListItem button key={item.text} onClick={item.action}>
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        {/* Main content */}
        <Container maxWidth="md" sx={{ marginTop: 10, marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
          <Card sx={{ backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)', padding: '30px', width: '100%' }}>
            <CardContent>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Avatar sx={{ width: 150, height: 150 }}
                    src={user.imageFile ? `${url}/user/image/${user.imageFile}` : '/path/to/default-avatar.jpg'} />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Typography variant="h4" gutterBottom>
                    {user.firstname} {user.lastname}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {user.email}
                  </Typography>
                  <Typography color="textSecondary">
                    เพศ : {user.GenderID === 1 ? "ชาย" : user.GenderID === 2 ? "หญิง" : user.GenderID === 3 ? "อื่นๆ" : "-"}
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ marginY: 2 }} />
              <Typography variant="body1" gutterBottom>
                ที่อยู่ : {user.home || "ไม่ระบุ"}
              </Typography>
              <Typography variant="body1" gutterBottom>
                เบอร์โทร : {user.phonenumber || "ไม่ระบุ"}
              </Typography>
              <Divider sx={{ marginY: 2 }} />
              <Typography variant="h6" gutterBottom>
                ประวัติการโดนรายงาน
              </Typography>
              {reportHistory.length > 0 ? (
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {reportHistory.map((report, index) => (
                    <Typography key={index} variant="body1" sx={{ marginBottom: '10px' }}>
                      รายงานประเภท: {report.reportType}
                    </Typography>
                  ))}
                </Box>
              ) : (
                <Typography variant="body1" gutterBottom>
                  ไม่มีประวัติการโดนรายงาน
                </Typography>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
