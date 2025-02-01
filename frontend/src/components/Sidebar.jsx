import React, { useEffect, useState } from 'react';

// utils
import api from '../utils/api';
import socket from '../utils/socket';

// mui
import { Box, Typography, List, ListItem, ListItemText, Button, Avatar } from '@mui/material';

const Sidebar = ({ username, handleLogout }) => {
  const [channels, setChannels] = useState([]);

  const fetchChannels = async () => {
    try {
      const { data } = await api.getChannels();
      setChannels(data);
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    }
  };

  useEffect(() => {
    fetchChannels();
    socket.on('channelUpdate', fetchChannels);
    return () => {
      socket.off('channelUpdate', fetchChannels);
    };
  }, []);

  return (
    <Box
      sx={{
        width: 250,
        padding: 2,
        backgroundColor: 'background.default',
        borderRight: '1px solid rgba(0, 0, 0, 0.1)',
      }}
    >
      <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 56,
            height: 56,
            margin: '0 auto',
          }}
        >
          {username.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h6" sx={{ marginTop: 2 }}>{`Welcome ${username}`}</Typography>
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        Channels
      </Typography>
      <List>
        {channels.map((channel) => (
          <Box key={channel.name} sx={{ display: 'flex', alignItems: 'center' }}>
            <ListItem>
              <ListItemText primary={`#${channel.name}`} />
            </ListItem>
          </Box>
        ))}
      </List>

      <Button
        variant="contained"
        fullWidth
        size="small"
        onClick={handleLogout}
        sx={{ marginTop: 2 }}
      >
        Logout
      </Button>
    </Box>
  );
};

export default Sidebar;
