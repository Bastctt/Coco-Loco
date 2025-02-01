import React, { useState, useEffect } from 'react';

// utils
import socket from './utils/socket';

// components
import Chat from './components/Chat';
import Login from './components/Login';
import Sidebar from './components/Sidebar';

// lib
import { SnackbarProvider } from 'notistack';

// mui
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { ThemeProvider, createTheme, CssBaseline, IconButton, Stack, Divider } from '@mui/material';

const App = () => {
  const [username, setUsername] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeChannel, setActiveChannel] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedChannel = localStorage.getItem('activeChannel') || 'general';
    const storedDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (storedUsername) {
      setUsername(storedUsername);
      setIsLoggedIn(true);
      setActiveChannel(storedChannel);
    }
    
    setDarkMode(storedDarkMode);
  }, []);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const toggleTheme = () => {
    setDarkMode((prev) => {
      localStorage.setItem('darkMode', !prev);
      return !prev;
    });
  };

  const handleLogin = (name) => {
    setUsername(name);
    setIsLoggedIn(true);
    localStorage.setItem('username', name);
    localStorage.setItem('activeChannel', 'general');
    setActiveChannel('general');
    socket.emit('joinChannel', { username: name, channelName: 'general' });
  };

  const handleLogout = () => {
    if (username) {
      socket.emit('leaveChannel', { username, channelName: activeChannel });
      socket.disconnect();
    }
    
    setUsername('');
    setIsLoggedIn(false);
    setActiveChannel('');
    localStorage.removeItem('username');
    localStorage.removeItem('activeChannel');
  };

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <CssBaseline />
        <Stack height={'100vh'} sx={{ display: 'flex', flexDirection: 'column' }}>
          <IconButton onClick={toggleTheme} sx={{ position: 'absolute', top: 16, right: 16 }}>
            {darkMode ? <WbSunnyIcon /> : <DarkModeIcon />}
          </IconButton>
          {!isLoggedIn ? (
            <Login onLogin={handleLogin} />
          ) : (
            <Stack direction={{ xs: 'column', sm: 'column', md: 'row' }} sx={{ overflow: 'hidden', height: '100%' }}>
              <Sidebar username={username} handleLogout={handleLogout} setActiveChannel={setActiveChannel} />
              <Divider orientation="horizontal" flexItem />
              <Chat username={username} channelName={activeChannel} setUsername={setUsername} setActiveChannel={setActiveChannel} />
            </Stack>
          )}
        </Stack>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
