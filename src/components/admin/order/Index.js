import {React, useEffect, useState} from "react";
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ButtonGroup from '@mui/material/ButtonGroup';
import axios from 'axios';
import AppNavbar from '../components/AppNavbar';
import SideMenu from '../components/SideMenu';


// Fetch token from local storage
const token = localStorage.getItem('token');
const url = process.env.REACT_APP_BASE_URL;


// Main component for rendering the order list
export default function Index() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    OrdersGet(setOrders);
  }, []);

  // Function to fetch orders from the API
  const OrdersGet = () => {
    axios.get(`${url}/admin/history`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    .then((response) => {
      setOrders(response.data);  // Update the state with the new list of customers
    })
    .catch((error) => {
      console.error('Error fetching orders', error);
    });
  };

  // Function to view a order's details
  const ViewOrder = (id) => {
    window.location = `/admin/order/view/${id}`;
  }

  const ViewPayment = (id) => {
    window.location = `/admin/payment/view/${id}`;
  }


  return (
    <Box sx={{ display: 'flex' }}>
      <SideMenu />
      <AppNavbar />         
      <Container sx={{ marginTop: 2 }} maxWidth="lg">    
        <Paper sx={{ padding: 2, color: 'text.secondary' }}>
          <Box display="flex">
            <Box flexGrow={1}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                รายการสั่งซื้อ
              </Typography>
            </Box>
          </Box>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">รหัส</TableCell>
                  <TableCell align="center">วันที่สั่งซื้อ</TableCell>
                  <TableCell align="center">ราคารวม</TableCell>
                  <TableCell align="center">สถานะ</TableCell>                  
                  <TableCell align="center">จัดการข้อมูล</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.orderID}>
                    <TableCell align="center">{order.orderID}</TableCell> 
                    <TableCell align="center">{order.orderDate}</TableCell>                    
                    <TableCell align="right">฿{order.totalPrice.toLocaleString(undefined, {maximumFractionDigits:2})}</TableCell>
                    <TableCell align="center">{order.status}</TableCell>                     
                    <TableCell align="center">
                      <ButtonGroup color="primary" aria-label="outlined primary button group">                        
                        <Button onClick={() => ViewOrder(order.orderID)}>การสั่งซื้อ</Button>
                        <Button onClick={() => ViewPayment(order.orderID)}>การชำระเงิน</Button>
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
