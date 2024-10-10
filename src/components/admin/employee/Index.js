import React, { useEffect, useState } from "react";
import { Typography, Button, Container, Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, ButtonGroup } from '@mui/material';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

const token = localStorage.getItem('token');
const url = process.env.REACT_APP_BASE_URL;

export default function Index() {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    employeesGet();
  }, []);

  const employeesGet = () => {
    axios.get(`${url}/employee`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    .then((response) => {
      setEmployees(response.data); 
    })
    .catch((error) => {
      console.error('Error fetching employees', error);
    });
  };

  const ViewEmployee = (id) => {
    window.location = `/admin/employee/view/${id}`;
  }

  const UpdateEmployee = (id) => {
    window.location = `/admin/employee/update/${id}`;
  }

  const EmployeeDelete = (id) => {
    axios.delete(`${url}/employee/${id}`, {
      headers: {
        'Accept': 'application/form-data',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
    .then((response) => {
      if (response.data.status === true) {
        alert(response.data.message);
        employeesGet();
      } else {
        alert('Failed to delete employee');
      }
    })
    .catch((error) => {
      console.error('There was an error!', error);
    });
  };

  const EmployeeBan = (id) => {
    axios.put(`${url}/employee/ban/${id}`, null, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    .then((response) => {
      if (response.data.status === true) {
        alert(response.data.message);
        employeesGet(); // Refresh the employee list after banning
      } else {
        alert('Failed to suspend employee');
      }
    })
    .catch((error) => {
      console.error('Error suspending employee:', error);
    });
  };

  const EmployeeUnban = (id) => {
    axios.put(`${url}/employee/unban/${id}`, null, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    .then((response) => {
      if (response.data.status === true) {
        alert(response.data.message);
        employeesGet(); // Refresh the employee list after unbanning
      } else {
        alert('Failed to unban employee');
      }
    })
    .catch((error) => {
      console.error('Error unbanning employee:', error);
    });
  };

  return (
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {/* Main Content */}
        <Container sx={{ marginTop: 2 }} maxWidth="lg">
          <Paper sx={{ padding: 3, backgroundColor: '#fafafa', borderRadius: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                จัดการข้อมูลพนักงาน
              </Typography>
              <Link to="/addemployee">
                <Button variant="contained" color="primary" sx={{ backgroundColor: '#1976d2' }}>
                  เพิ่มข้อมูลพนักงาน
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
                  {employees.map((employee) => (
                    <TableRow key={employee.empID}> 
                      <TableCell align="right">{employee.empID}</TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center">
                          <Avatar src={url + '/employee/image/' + employee.imageFile} />
                        </Box>
                      </TableCell>
                      <TableCell align="left">{employee.firstname}</TableCell>
                      <TableCell align="left">{employee.lastname}</TableCell>
                      <TableCell align="left">{employee.username}</TableCell>
                      <TableCell align="center">
                        <ButtonGroup color="primary" aria-label="outlined primary button group">
                          <Button variant="contained" onClick={() => ViewEmployee(employee.empID)}>ตรวจสอบรายงาน</Button>
                          <Button variant="outlined" onClick={() => UpdateEmployee(employee.empID)}>แก้ไข</Button>

                          {/* Conditionally render "แบนผู้ใช้" or "ปลดแบน" based on isActive */}
                          {employee.isActive === 1 ? (
                            <Button variant="outlined" color="secondary" onClick={() => EmployeeBan(employee.empID)}>แบนผู้ใช้</Button>
                          ) : (
                            <Button variant="outlined" color="primary" onClick={() => EmployeeUnban(employee.empID)}>ปลดแบน</Button>
                          )}

                          <Button variant="contained" color="error" onClick={() => EmployeeDelete(employee.empID)}>ลบผู้ใช้</Button>
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
