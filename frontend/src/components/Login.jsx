import React, { useState } from 'react';

// utils
import socket from '../utils/socket';

// lib
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material/styles';

// mui
import { TextField, Button, Typography, Paper, Stack } from '@mui/material';

const Login = ({ onLogin }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [username, setUsername] = useState('');

  const isDarkMode = theme.palette.mode === 'dark';

  const handleLogin = () => {
    if (!username.trim()) {
      enqueueSnackbar('Username cannot be empty', { variant: 'warning' });
      return;
    }

    socket.emit('setUsername', { username }, (response) => {
      if (response.success) {
        enqueueSnackbar('Connected successfully!', { variant: 'success' });
        onLogin(username);
        localStorage.setItem('username', username);
        localStorage.setItem('activeChannel', 'general');
      } else {
        enqueueSnackbar(response.message, { variant: 'error' });
      }
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleLogin();
    }
  };

  return (
    <Paper
      elevation={4}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        height: '100vh',
        padding: 4,
      }}
    >
      <Stack direction="row" spacing={2} alignItems={'center'}>
        <Typography variant="h4" gutterBottom>
          Welcome to Coco Loco IRC
        </Typography>
        <img style={{ width: '30px', height: '30px' }} src="frontend/src/assets/coco.png"  alt="Coco Loco Logo" />
      </Stack>
      <Stack direction="column" spacing={2} alignItems={'center'}>
      <TextField
          size="small"
          label="Choose a username to start chatting :)"
          InputLabelProps={{
            style: {
              color: isDarkMode ? 'white' : '#333',
            },
          }}
          value={username}
          autoComplete='off'
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            marginBottom: 3,
            width: '300px',
            backgroundColor: isDarkMode ? '#424242' : 'white',
            borderRadius: 1,
            color: 'black'
          }}
        />
        <Button variant="contained" size="small" color="primary" onClick={handleLogin}>
          Login
        </Button>
      </Stack>
    </Paper>
  );
};

export default Login;
