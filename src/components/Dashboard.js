import React, { useEffect, useState } from 'react';
import { Typography, Avatar, Button, ButtonGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Container, Grid, Card, CardContent, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, People as PeopleIcon, Settings as SettingsIcon } from '@mui/icons-material';

const url = process.env.REACT_APP_BASE_URL;
const token = localStorage.getItem('token');

// Sample data for charts
const data = [
  { name: 'Jan', sessions: 28 },
  { name: 'Feb', sessions: 53 },
  { name: 'Mar', sessions: 51 },
  { name: 'Apr', sessions: 26 },
  { name: 'May', sessions: 58 },
];

const pageData = [
  { name: 'Jan', views: 90 },
  { name: 'Feb', views: 70 },
  { name: 'Mar', views: 80 },
  { name: 'Apr', views: 85 },
  { name: 'May', views: 95 },
  { name: 'Jun', views: 70 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // ดึงข้อมูลผู้ใช้ที่ถูก report จาก API
    axios.get(`${url}/user`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then((response) => {
      setUsers(response.data); // ตั้งค่าผู้ใช้จากการตอบสนองของ API
    })
    .catch((error) => {
      console.error('Error fetching users:', error);
    });
  }, []);

  const handleBanUser = (userID) => {
    axios.put(`${url}/user/ban/${userID}`, null, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then((response) => {
      if (response.data.status === true) {
        alert(response.data.message);
        setUsers((prevUsers) => prevUsers.map(user => user.userID === userID ? { ...user, isActive: 0 } : user));
      } else {
        alert('Failed to suspend user');
      }
    })
    .catch((error) => {
      console.error('Error suspending user:', error);
    });
  };

  const handleUnbanUser = (userID) => {
    axios.put(`${url}/user/unban/${userID}`, null, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then((response) => {
      if (response.data.status === true) {
        alert(response.data.message);
        setUsers((prevUsers) => prevUsers.map(user => user.userID === userID ? { ...user, isActive: 1 } : user));
      } else {
        alert('Failed to unban user');
      }
    })
    .catch((error) => {
      console.error('Error unbanning user:', error);
    });
  };

  const drawerWidth = 240;
  const menuItems = [
    { text: 'จัดการข้อมูลผู้ใช้', action: () => navigate('/admin/user'), icon: <PeopleIcon /> },
    { text: 'จัดการข้อมูลพนักงาน', action: () => navigate('/admin/employee'), icon: <SettingsIcon /> },
    { text: 'ตรวจสอบรายงานผู้ใช้', action: () => navigate('/admin/employee'), icon: <PeopleIcon /> },
    { text: 'เพิ่มผู้ดูแล', action: () => navigate('/addEmployee'), icon: <SettingsIcon /> },
    { text: 'ออกจากระบบ', action: () => navigate('/signinuser'), icon: <HomeIcon /> }
  ];

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#F8E9F0' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            backgroundColor: '#fff',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            borderRight: '1px solid #e0e0e0',
            paddingTop: '20px',
          },
        }}
      >
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item, index) => (
              <ListItem button key={item.text} onClick={item.action} sx={{ padding: '15px 20px' }}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 3,
          backgroundColor: '#F8E9F0',
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          {/* Charts */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ผู้ใช้งานใหม่
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data}>
                      <CartesianGrid stroke="#ccc" />
                      <XAxis dataKey="name" stroke="#000" />
                      <YAxis stroke="#000" />
                      <Tooltip />
                      <Line type="monotone" dataKey="sessions" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    จำนวนการแมท
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={pageData}>
                      <CartesianGrid stroke="#ccc" />
                      <XAxis dataKey="name" stroke="#000" />
                      <YAxis stroke="#000" />
                      <Tooltip />
                      <Bar dataKey="views" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* User Table */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              ผู้ใช้ถูกระงับใหม่
            </Typography>
            <TableContainer component={Paper} sx={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">รหัส</TableCell>
                    <TableCell align="center">รูป</TableCell>
                    <TableCell align="left">ชื่อผู้ใช้</TableCell>
                    <TableCell align="left">เหตุผล</TableCell>
                    <TableCell align="center">จัดการข้อมูล</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.userID}>
                      <TableCell align="center">{user.userID}</TableCell>
                      <TableCell align="center">
                        <Avatar src={`${url}/user/image/${user.imageFile}`} alt={user.username} />
                      </TableCell>
                      <TableCell align="left">{user.username}</TableCell>
                      <TableCell align="left">{user.reportType || 'ไม่ระบุเหตุผล'}</TableCell> {/* แสดงเหตุผลจาก reportType */}
                      <TableCell align="center">
                        <ButtonGroup color="primary" aria-label="outlined primary button group">
                          {user.isActive === 1 ? (
                            <Button variant="outlined" color="secondary" onClick={() => handleBanUser(user.userID)} sx={{ borderRadius: '10px' }}>ระงับผู้ใช้</Button>
                          ) : (
                            <Button variant="outlined" color="primary" onClick={() => handleUnbanUser(user.userID)} sx={{ borderRadius: '10px' }}>ปลดแบน</Button>
                          )}
                        </ButtonGroup>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
