import React, { useEffect, useState } from "react";
import { Button, Container, Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, ButtonGroup } from '@mui/material';
import { useNavigate } from "react-router-dom";
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
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8E9F0' }}>
      <Container sx={{ marginTop: 2 }} maxWidth="lg">
        <Paper sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 3, border: '2px solid black' }}> {/* เพิ่มกรอบสีดำ */}
          <Box display="flex" justifyContent="flex-start" alignItems="center" sx={{ mb: 2 }}>
            <Button
              startIcon={<ArrowBackIcon sx={{ fontSize: '20px', color: 'black' }} />}  // ปรับขนาดและสีของไอคอน
              onClick={() => navigate('/dashboard')}
              sx={{ mr: 2, color: 'black', fontWeight: 'bold', fontSize: '20px' }} // ปรับสีและขนาดของข้อความ
            >
              จัดการข้อมูลผู้ใช้
            </Button>
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
                          onClick={() => ViewUser(user.userID)} 
                          sx={{ border: '1px solid black' }}  // ใส่กรอบสีดำ
                        >
                          ตรวจสอบรายงาน
                        </Button>

                        <Button 
                          variant="outlined" 
                          onClick={() => UpdateUser(user.userID)} 
                          sx={{ border: '1px solid black' }}  // ใส่กรอบสีดำ
                        >
                          แก้ไข
                        </Button>

                        {/* ปุ่มระงับผู้ใช้ */}
                        <Button 
                          variant="outlined" 
                          color="secondary" 
                          onClick={() => UserBan(user.userID)} 
                          disabled={user.isActive === 0}
                          sx={{
                            border: '1px solid black',
                            color: user.isActive === 0 ? '#fff' : '#FF0000', // สีตัวอักษรแดงเข้มเมื่อยังไม่ถูกแบน
                            backgroundColor: user.isActive === 0 ? '#f97d7d' : 'transparent', // พื้นหลังแดงเข้มเมื่อถูกกด
                            fontWeight: 'bold',
                            '&:hover': {
                              backgroundColor: user.isActive === 0 ? '#FF0000' : 'rgba(255, 0, 0, 0.1)', // พื้นหลังโปร่งเมื่อ hover
                            }
                          }}
                        >
                          ระงับผู้ใช้
                        </Button>

                        {/* ปุ่มปลดแบน */}
                        <Button 
                          variant="outlined" 
                          color="primary" 
                          onClick={() => UserUnban(user.userID)} 
                          disabled={user.isActive === 1} 
                          sx={{
                            border: '1px solid black',
                            color: user.isActive === 1 ? '#fff' : '#00FF00', // สีเขียวเมื่อยังไม่ได้กด
                            backgroundColor: user.isActive === 1 ? '#abfcab' : 'transparent', // พื้นหลังเขียวเมื่อกดแล้ว
                            fontWeight: 'bold',
                            '&:hover': {
                              backgroundColor: user.isActive === 1 ? '#00FF00' : 'rgba(0, 255, 0, 0.1)', // พื้นหลังโปร่งเมื่อ hover
                            }
                          }}
                        >
                          ปลดแบน
                        </Button>

                        <Button 
                          variant="contained" 
                          color="error" 
                          onClick={() => UserDelete(user.userID)} 
                          sx={{ border: '1px solid black' }}  // ใส่กรอบสีดำ
                        >
                          ลบผู้ใช้
                        </Button>

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
