import { React, useEffect, useState } from "react";
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {Card, CardContent, Table, TableBody, TableCell,
        TableContainer, TableHead, TableRow, Paper, Divider,
        Button, Box } from '@mui/material';
import { useParams } from 'react-router-dom';        
import axios from "axios";
import AppNavbar from '../components/AppNavbar';
import SideMenu from '../components/SideMenu';

const token = localStorage.getItem('token');
const url = process.env.REACT_APP_BASE_URL;

export default function View() {
    const [order, setOrder] = useState(null);     
    const { id } = useParams();  

    useEffect(() => {     
        axios.get(`${url}/payment/${id}`,
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
    // Calculate the total price of the payment
    const totalPrice = order.paymentDetails.reduce((total, item) => total + item.price, 0);

    
    // Function to update a status
    const UpdateStatus = (orderID, statusID) => {
        axios.post(`${url}/confirmpayment`, 
            {                       
                orderID,
                statusID
            },
            {            
                headers: {
                    'Accept': 'application/form-data',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        )
        .then((response) => {
        if (response.data.status === true) {
            window.location.href = '/admin/order';
        } else {
            alert('Failed to update status');
        }
        })
        .catch((error) => {
            console.error('There was an error!', error);
        });
    };    


    return (
        <Box sx={{ display: 'flex' }}>
            <SideMenu />
            <AppNavbar />               
            <Container maxWidth="md" sx={{ marginTop: 4 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            ข้อมูลการชำระเงิน
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

                                <Typography variant="body1">
                                    <strong>ชื่อลูกค้า :</strong> {order.firstName} {order.lastName}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>จำนวนเงินที่ต้องชำระ :</strong> {order.totalPrice.toLocaleString(undefined, {maximumFractionDigits:2})}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>จำนวนเงินที่ชำระแล้ว :</strong> {totalPrice.toLocaleString(undefined, {maximumFractionDigits:2})}
                                </Typography>                                
                            </Grid>
                        </Grid>

                        <Typography variant="body1">
                            <strong>รายการชำระเงิน :</strong>                            
                        </Typography>

                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ลำดับ</TableCell>
                                        <TableCell>วันที่ชำระเงิน</TableCell>
                                        <TableCell>จำนวนเงินที่ชำระ</TableCell>
                                        <TableCell>คอมเมนต์ </TableCell>
                                        <TableCell>สลิป</TableCell>  
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                {order.paymentDetails.map((item, index) => (
                                    <TableRow key={item.paymentID}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.paymentDate}</TableCell>
                                        <TableCell>฿{item.price.toLocaleString(undefined, {maximumFractionDigits:2})}</TableCell>
                                        <TableCell>{item.comment ? item.comment : '-'}</TableCell>
                                        <TableCell>
                                            <a href={`${url}/payment/image/${item.slipFile}`} target="_blank" rel="noopener noreferrer">
                                                ดูสลิป
                                            </a>
                                        </TableCell>                                        
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </TableContainer>                    
                    </CardContent>
                </Card>
                
                <Box sx={{ display: 'flex', justifyContent: 'center'}}>
                    <Button
                        type="submit"
                        id="btnCreate"
                        name="btnCreate"              
                        color="primary"
                        variant="contained"
                        sx={{ m: 2 }}
                        onClick={() => UpdateStatus(order.orderID, 3)}
                    >
                        ยืนยันการชำระเงิน
                    </Button>

                    <Button
                        type="submit"
                        id="btnCreate"
                        name="btnCreate"              
                        color="error"
                        variant="contained"
                        sx={{ m: 2 }}
                        onClick={() => UpdateStatus(order.orderID, 2)}
                    >
                        ไม่ยืนยันการชำระเงิน
                    </Button>       
                </Box>         
            </Container>
        </Box>
    );
}