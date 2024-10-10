import React, { useEffect, useState } from "react";
import { Typography, Button, Container, Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, ButtonGroup } from '@mui/material';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

const token = localStorage.getItem('token');
const url = process.env.REACT_APP_BASE_URL;

export default function Index() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    usersGet();  // Fetch users when component mounts
  }, []);

  const usersGet = () => {
    axios.get(`${url}/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    .then((response) => {
      setUsers(response.data);  // Set users data
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
        usersGet();  // Refresh users list after deletion
      } else {
        alert('Failed to delete user');
      }
    })
    .catch((error) => {
      console.error('There was an error!', error);
    });
  };

  const UserBan = (id) => {
    axios.put(`${url}/user/ban/${id}`, null, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    .then((response) => {
      if (response.data.status === true) {
        alert(response.data.message);
        // Update state directly after banning the user
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.userID === id ? { ...user, isActive: 0 } : user
          )
        );
      } else {
        alert('Failed to suspend user');
      }
    })
    .catch((error) => {
      console.error('Error suspending user:', error);
    });
  };

  const UserUnban = (id) => {
    axios.put(`${url}/user/unban/${id}`, null, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    .then((response) => {
      if (response.data.status === true) {
        alert(response.data.message);
        // Update state directly after unbanning the user
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.userID === id ? { ...user, isActive: 1 } : user
          )
        );
      } else {
        alert('Failed to unban user');
      }
    })
    .catch((error) => {
      console.error('Error unbanning user:', error);
    });
  };

  return (
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {/* Main Content */}
        <Container sx={{ marginTop: 2 }} maxWidth="lg">
          <Paper sx={{ padding: 3, backgroundColor: '#fafafa', borderRadius: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                จัดการข้อมูลผู้ใช้
              </Typography>
              <Link to="/adduser">
                <Button variant="contained" color="primary" sx={{ backgroundColor: '#1976d2' }}>
                  เพิ่มข้อมูลผู้ใช้
                </Button>
              </Link>
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
                          <Button variant="contained" onClick={() => ViewUser(user.userID)}>ตรวจสอบรายงาน</Button>
                          <Button variant="outlined" onClick={() => UpdateUser(user.userID)}>แก้ไข</Button>

                          {/* Conditionally render "แบนผู้ใช้" or "ปลดแบน" based on isActive */}
                          {user.isActive === 1 ? (
                            <Button variant="outlined" color="secondary" onClick={() => UserBan(user.userID)}>แบนผู้ใช้</Button>
                          ) : (
                            <Button variant="outlined" color="primary" onClick={() => UserUnban(user.userID)}>ปลดแบน</Button>
                          )}

                          <Button variant="contained" color="error" onClick={() => UserDelete(user.userID)}>ลบผู้ใช้</Button>
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
