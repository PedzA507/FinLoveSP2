import React, { useEffect, useState } from 'react';
import { Typography, Avatar, Button, ButtonGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Container } from '@mui/material';
import axios from 'axios';

const url = process.env.REACT_APP_BASE_URL;
const token = localStorage.getItem('token');

export default function Dashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // ดึงข้อมูลผู้ใช้ที่ถูก report จาก API
    axios.get(`${url}/userreport`, {
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          ผู้ใช้ถูกระงับใหม่
        </Typography>
        <TableContainer component={Paper} sx={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', border: '2px solid black' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ padding: '16px', width: 100 }}>รหัส</TableCell>
                <TableCell align="center" sx={{ padding: '16px', width: 100 }}>รูป</TableCell>
                <TableCell align="left" sx={{ padding: '16px' }}>ชื่อผู้ใช้</TableCell>
                <TableCell align="left" sx={{ padding: '16px' }}>เหตุผล</TableCell>
                <TableCell align="center" sx={{ padding: '16px' }}>จัดการข้อมูล</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.userID}>
                  <TableCell align="center" sx={{ padding: '16px' }}>{user.userID}</TableCell>
                  <TableCell align="center" sx={{ padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Avatar 
                      src={`${url}/user/image/${user.imageFile}`} 
                      alt={user.username} 
                      sx={{ width: 50, height: 50 }} // ขนาดรูปภาพคงที่
                    />
                  </TableCell>
                  <TableCell align="left" sx={{ padding: '16px' }}>{user.username}</TableCell>
                  <TableCell align="left" sx={{ padding: '16px' }}>{user.reportType || 'ไม่ระบุเหตุผล'}</TableCell>
                  <TableCell align="center" sx={{ padding: '16px' }}>
                    <ButtonGroup color="primary" aria-label="outlined primary button group">
                      {user.isActive === 1 ? (
                        <Button
                          variant="outlined"
                          sx={{
                            borderRadius: '10px',
                            color: 'red',
                            borderColor: 'red',
                            backgroundColor: 'white',
                            '&:hover': {
                              backgroundColor: '#ffe6e6',
                            },
                          }}
                          onClick={() => handleBanUser(user.userID)}
                        >
                          ระงับผู้ใช้
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          sx={{
                            borderRadius: '10px',
                            color: 'black',
                            borderColor: 'black',
                            backgroundColor: 'white',
                            '&:hover': {
                              backgroundColor: '#f8e9f0',
                            },
                          }}
                          onClick={() => handleUnbanUser(user.userID)}
                        >
                          ปลดแบน
                        </Button>
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
  );
}
