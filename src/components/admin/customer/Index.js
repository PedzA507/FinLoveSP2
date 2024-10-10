import React, { useEffect, useState } from "react";
import { Typography, Button, Container, Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, ButtonGroup, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { Link, useNavigate } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import FeedbackIcon from '@mui/icons-material/Feedback';
import InfoIcon from '@mui/icons-material/Info';
import axios from 'axios';
import { createTheme, ThemeProvider } from '@mui/material/styles';


const drawerWidth = 240;
const token = localStorage.getItem('token');
const url = process.env.REACT_APP_BASE_URL;

export default function Index() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    UsersGet();
  }, []);

  const UsersGet = () => {
    axios.get(`${url}/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    .then((response) => {
      setUsers(response.data); 
    })
    .catch((error) => {
      console.error('Error fetching users', error);
    });
  };

  const ViewUser = (id) => {
    window.location = `/admin/user/view/${id}`;
  }

  const UpdateUser = (id) => {
    window.location = `/admin/user/update/${id}`;
  }

  const UserDelete = (id) => {
    axios.delete(`${url}/user/${id}`, {
      headers: {
        'Accept': 'application/form-data',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
    .then((response) => {
      if (response.data.status === true) {
        alert(response.data.message);
        UsersGet();
      } else {
        alert('Failed to delete user');
      }
    })
    .catch((error) => {
      console.error('There was an error!', error);
    });
  };

  return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>

        {/* Main Content */}
        <Container sx={{ marginTop: 2 }} maxWidth="lg">
          <Paper sx={{ padding: 2 }}>
            <Box display="flex">
              <Box flexGrow={1}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  จัดการข้อมูลผู้ใช้
                </Typography>
              </Box>
              <Box>
                <Link to="/admin/user/create">
                  <Button variant="contained" color="primary">
                    เพิ่มข้อมูลผู้ใช้
                  </Button>
                </Link>
              </Box>
            </Box>
            <TableContainer>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell align="right">รหัส</TableCell>
                    <TableCell align="center">รูป</TableCell>
                    <TableCell align="left">ชื่อ</TableCell>
                    <TableCell align="left">นามสกุล</TableCell>
                    <TableCell align="left">ชื่อผู้ใช้</TableCell>
                    <TableCell align="center">จัดการข้อมูล</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.userID}>
                      <TableCell align="right">{user.userID}</TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center">
                          <Avatar src={url + '/user/image/' + user.imageFile} />
                        </Box>
                      </TableCell>
                      <TableCell align="left">{user.firstname}</TableCell>
                      <TableCell align="left">{user.lastname}</TableCell>
                      <TableCell align="left">{user.username}</TableCell>
                      <TableCell align="center">
                        <ButtonGroup color="primary" aria-label="outlined primary button group">
                          <Button onClick={() => ViewUser(user.userID)}>ตรวจสอบรายงาน</Button>
                          <Button onClick={() => UpdateUser(user.userID)}>แก้ไข</Button>
                          <Button onClick={() => UserDelete(user.userID)}>ระงับผู้ใช้</Button>
                        </ButtonGroup>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
      </Box>
  );
}
