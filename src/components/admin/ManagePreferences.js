import React, { useEffect, useState } from 'react';
import { Button, Box, Grid, Typography, Paper, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from 'axios';

const url = process.env.REACT_APP_BASE_URL;
const token = localStorage.getItem('token');

export default function ManagePreferences() {
  const [preferences, setPreferences] = useState([]);
  const [selectedPreference, setSelectedPreference] = useState(null);
  const [newPreference, setNewPreference] = useState('');
  const [openDialog, setOpenDialog] = useState(false); // State สำหรับจัดการการเปิดปิด modal
  const [dialogType, setDialogType] = useState(''); // เพื่อระบุประเภทของ modal (เพิ่ม, ลบ, แก้ไข)

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get(`${url}/preferences`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPreferences(response.data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const handleSelectPreference = (id) => {
    // ถ้าคลิกซ้ำที่ preference เดิม ให้ยกเลิกการเลือก
    if (selectedPreference === id) {
        setSelectedPreference(null);
        setNewPreference(''); // ล้างค่าใน input ถ้ายกเลิกการเลือก
    } else {
        // ถ้าเป็นการคลิกใหม่ ให้เลือก preference นั้น
        setSelectedPreference(id);
        setNewPreference(preferences.find((pref) => pref.PreferenceID === id)?.PreferenceNames || ''); // แสดงชื่อที่เลือกใน input
    }
};


  const handleDeletePreference = async () => {
    if (selectedPreference) {
      try {
        await axios.delete(`${url}/preferences/${selectedPreference}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setSelectedPreference(null);
        fetchPreferences();
        setOpenDialog(false);
      } catch (error) {
        console.error('Error deleting preference:', error);
      }
    }
  };

  const handleAddPreference = async () => {
    if (newPreference.trim()) {
      try {
        await axios.post(`${url}/preferences`, { PreferenceName: newPreference }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setNewPreference('');
        fetchPreferences();
        setOpenDialog(false);
      } catch (error) {
        console.error('Error adding preference:', error);
      }
    }
  };

  const handleUpdatePreference = async () => {
    if (selectedPreference && newPreference.trim()) {
      try {
        await axios.put(`${url}/preferences/${selectedPreference}`, { PreferenceName: newPreference }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setSelectedPreference(null);
        setNewPreference('');
        fetchPreferences();
        setOpenDialog(false);
      } catch (error) {
        console.error('Error updating preference:', error);
      }
    }
  };

  // ฟังก์ชันสำหรับเปิด Dialog modal
  const openModal = (type) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
      <Paper sx={{ padding: 2, width: '80%' }}>
        <Typography variant="h6">จัดการความชอบ</Typography>
        <Grid container spacing={2} sx={{ marginTop: 2 }}>
          {preferences.map((pref) => (
            <Grid item xs={4} key={pref.PreferenceID}>
              <Box
                sx={{
                  border: selectedPreference === pref.PreferenceID ? '2px solid pink' : '1px solid black',
                  backgroundColor: selectedPreference === pref.PreferenceID ? 'pink' : 'white',
                  color: selectedPreference === pref.PreferenceID ? 'white' : 'black',
                  padding: '10px',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => handleSelectPreference(pref.PreferenceID)}
              >
                {pref.PreferenceNames}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          <Button variant="contained" color="primary" onClick={() => openModal('add')}>เพิ่ม</Button>
          <Button variant="contained" color="secondary" onClick={() => openModal('delete')} disabled={!selectedPreference}>ลบ</Button>
          <Button variant="contained" onClick={() => openModal('edit')} disabled={!selectedPreference}>แก้ไข</Button>
        </Box>

        {/* Dialog สำหรับเพิ่ม, แก้ไข, ลบ */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>{dialogType === 'add' ? 'กรอกข้อมูลความชอบที่ต้องการเพิ่ม' : dialogType === 'edit' ? 'กรอกข้อมูลความชอบที่ต้องการแก้ไข' : 'คุณแน่ใจหรือไม่ที่จะลบความชอบนี้'}</DialogTitle>
          {dialogType !== 'delete' && (
            <DialogContent>
              <TextField
                value={newPreference}
                onChange={(e) => setNewPreference(e.target.value)}
                label="ความชอบ"
                variant="outlined"
                fullWidth
              />
            </DialogContent>
          )}
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="secondary">ยกเลิก</Button>
            <Button
              onClick={dialogType === 'add' ? handleAddPreference : dialogType === 'edit' ? handleUpdatePreference : handleDeletePreference}
              color="primary"
            >
              {dialogType === 'add' ? 'เพิ่ม' : dialogType === 'edit' ? 'แก้ไข' : 'ยืนยัน'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}
