import React, { useEffect, useState } from "react";
import { Typography, Button, Container, Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, ButtonGroup } from '@mui/material';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // ใช้ไอคอนสำหรับปุ่มย้อนกลับ

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
  };

  const UpdateUser = (id) => {
    window.location = `/admin/user/update/${id}`;
  };

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
        usersGet();  // Refresh the users list after banning
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
        usersGet();  // Refresh the users list after unbanning
      } else {
        alert('Failed to unban user');
      }
    })
    .catch((error) => {
      console.error('Error unbanning user:', error);
    });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8E9F0' }}>
      <Container sx={{ marginTop: 2 }} maxWidth="lg">
        <Paper sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 3 }}>
          <Box display="flex" justifyContent="flex-start" alignItems="center" sx={{ mb: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{ mr: 2 }}
            >
              จัดการข้อมูลผู้ใช้
            </Button>
          </Box>
          <TableContainer sx={{ border: '2px solid black', borderRadius: '10px' }}> {/* เพิ่มกรอบรอบนอกตาราง */}
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
                        <Avatar src={url + '/user/image/' + user.imageFile} sx={{ width: 56, height: 56 }} />
                      </Box>
                    </TableCell>
                    <TableCell align="left">{user.firstname}</TableCell>
                    <TableCell align="left">{user.lastname}</TableCell>
                    <TableCell align="left">{user.username}</TableCell>
                    <TableCell align="center">
                      <ButtonGroup color="primary" aria-label="outlined primary button group">
                        <Button
                          variant="outlined"
                          sx={{ borderColor: '#000', color: '#000' }}
                          onClick={() => ViewUser(user.userID)}
                        >
                          ตรวจสอบรายงาน
                        </Button>
                        <Button
                          variant="outlined"
                          sx={{ borderColor: '#000', color: '#000' }}
                          onClick={() => UpdateUser(user.userID)}
                        >
                          แก้ไข
                        </Button>
                        <Button
                          variant="contained"
                          sx={{
                            backgroundColor: user.isActive === 0 ? '#ffcccc' : '#fff',
                            color: 'red',
                            border: '1px solid red',
                            '&:hover': {
                              backgroundColor: '#ffe6e6',
                            },
                          }}
                          onClick={() => UserBan(user.userID)}
                          disabled={user.isActive === 0} // ปิดการใช้งานเมื่อถูกแบน
                        >
                          ระงับผู้ใช้
                        </Button>
                        <Button
                          variant="contained"
                          sx={{
                            backgroundColor: user.isActive === 1 ? '#ccffcc' : '#fff',
                            color: 'green',
                            border: '1px solid green',
                            '&:hover': {
                              backgroundColor: '#e6ffe6',
                            },
                          }}
                          onClick={() => UserUnban(user.userID)}
                          disabled={user.isActive === 1} // ปิดการใช้งานเมื่อยังไม่ได้แบน
                        >
                          ปลดแบน
                        </Button>
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
