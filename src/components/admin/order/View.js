import {React, useEffect, useState } from "react";
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {Card, CardContent, Table, TableBody, TableCell,
        TableContainer, TableHead, TableRow, Paper, Divider } from '@mui/material';
import axios from "axios";
import { useParams } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar';
import SideMenu from '../components/SideMenu';


const token = localStorage.getItem('token');
const url = process.env.REACT_APP_BASE_URL;

export default function View() {
    const [order, setOrder] = useState(null);     
    const { id } = useParams();  

    useEffect(() => {     
        axios.get(`${url}/orderinfo/${id}`,
        {
            headers: {
            'Authorization': `Bearer ${token}`,
            },
        })
        .then(response => {
            const results  = response.data;
            setOrder(results[0]);                   
        })
        .catch(error => {
            console.error('Error fetching customer data:', error);
        });
    }, [id]);

    if (!order) {
        return <Typography>Loading...</Typography>;
    }

    // Calculate the total price of the order
    const totalPrice = order.orderDetails.reduce((total, item) => total + item.quantity * item.price, 0);


    return (
        <Box sx={{ display: 'flex' }}>
            <SideMenu />
            <AppNavbar />                 
            <Container maxWidth="md" sx={{ marginTop: 4 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            รายละเอียดใบสั่งซื้อ
                        </Typography>
                        <Divider sx={{ marginY: 2 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body1">
                                    <strong>เลขที่ใบสั่งซื้อ:</strong> {order.orderID}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>วันที่สั่งซื้อ :</strong> {order.orderDate}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body1">
                                    <strong>ชื่อลูกค้า :</strong> {order.firstName} {order.lastName}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>ที่อยู่ :</strong> {order.address}
                                </Typography>
                            </Grid>
                        </Grid>

                        <Divider sx={{ marginY: 2 }} />

                        <Typography variant="h6" gutterBottom>
                            รายการสินค้า
                        </Typography>

                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ลำดับ</TableCell>
                                        <TableCell>ชื่อสินค้า</TableCell>
                                        <TableCell>จำนวน</TableCell>
                                        <TableCell>ราคาต่อหน่วย</TableCell>
                                        <TableCell>รวม</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {order.orderDetails.map((item, index) => (
                                        <TableRow key={item.productID}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{item.productName}</TableCell>
                                            <TableCell>{item.quantity.toLocaleString()}</TableCell>
                                            <TableCell>฿{item.price.toLocaleString(undefined, {maximumFractionDigits:2})}</TableCell>
                                            <TableCell>฿{(item.quantity * item.price).toLocaleString(undefined, {maximumFractionDigits:2})}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Typography variant="h6" align="right" sx={{ marginTop: 2 }}>
                            <strong>ยอดรวม : </strong> ฿{totalPrice.toLocaleString(undefined, {maximumFractionDigits:2})}
                        </Typography>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}