import React, { useEffect, useState } from 'react';
import { Button, Box, Grid, Typography, Paper, TextField } from '@mui/material';
import axios from 'axios';

const url = process.env.REACT_APP_BASE_URL;
const token = localStorage.getItem('token');

export default function ManagePreferences() {
  const [preferences, setPreferences] = useState([]);
  const [selectedPreference, setSelectedPreference] = useState(null); // Selected preference for editing
  const [newPreference, setNewPreference] = useState(''); // New preference text

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
    setSelectedPreference(id);
  };

  const handleDeletePreference = async () => {
    if (selectedPreference) {
      try {
        await axios.delete(`${url}/preferences/${selectedPreference}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setSelectedPreference(null);
        fetchPreferences();
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
      } catch (error) {
        console.error('Error updating preference:', error);
      }
    }
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
          <TextField
            value={newPreference}
            onChange={(e) => setNewPreference(e.target.value)}
            label="ความชอบใหม่/แก้ไข"
            variant="outlined"
            fullWidth
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          <Button variant="contained" color="primary" onClick={handleAddPreference}>เพิ่ม</Button>
          <Button variant="contained" color="secondary" onClick={handleDeletePreference} disabled={!selectedPreference}>ลบ</Button>
          <Button variant="contained" onClick={handleUpdatePreference} disabled={!selectedPreference}>แก้ไข</Button>
        </Box>
      </Paper>
    </Box>
  );
}
