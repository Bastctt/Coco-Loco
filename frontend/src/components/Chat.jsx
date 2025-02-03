import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';

// utils
import api from '../utils/api';
import socket from '../utils/socket';
import commands from '../utils/commands';
import handleCommand from '../utils/commandHandler';

// lib
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material/styles';

// mui
import SendIcon from '@mui/icons-material/Send';
import { Box, TextField, List, ListItem, Typography, Avatar, Paper, CircularProgress, IconButton, Popover, Stack } from '@mui/material';

const Chat = ({ username, channelName, setUsername, setActiveChannel }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [filteredCommands, setFilteredCommands] = useState([]);

  const textFieldRef = useRef(null);
  const messagesEndRef = useRef(null);

  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const isDarkMode = theme.palette.mode === 'dark';

  useEffect(() => {
    if (channelName) {
      const fetchMessages = async () => {
        setLoading(true);
        try {
          const { data } = await api.listMessages(channelName);
          setMessages(data);
        } catch (error) {
          enqueueSnackbar('Failed to load messages.', { variant: 'error' });
        } finally {
          setLoading(false);
        }
      };
      fetchMessages();
    }
  }, [channelName, enqueueSnackbar]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('message');
    };
  }, []);

  const handleSendMessage = async () => {
    if (currentMessage.startsWith('/')) {
      handleCommand(currentMessage, { username, setUsername, channelName, setActiveChannel, enqueueSnackbar, setMessages, setCurrentMessage });
    } else if (currentMessage.trim() && channelName) {
      const newMessage = { sender: username, text: currentMessage, channel: channelName, timestamp: new Date() };
      try {
        socket.emit('sendMessage', newMessage);
      } catch (error) {
        enqueueSnackbar('Failed to send message.', { variant: 'error' });
      }
      setCurrentMessage('');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setCurrentMessage(value);

    if (value.startsWith('/')) {
      const filtered = commands.filter((cmd) =>
        cmd.command.startsWith(value.toLowerCase())
      );
      setFilteredCommands(filtered);
      setAnchorEl(textFieldRef.current);
    } else {
      setFilteredCommands([]);
      setAnchorEl(null);
    }
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 2 }}>
      <Typography variant="h5" gutterBottom textAlign="center" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
        {channelName ? `Chat Room: #${channelName}` : 'No Channel Selected'}
      </Typography>

      <Paper
        elevation={0}
        sx={{
          flex: 1,
          padding: 2,
          marginBottom: 2,
          overflowY: 'auto',
          borderRadius: 2,
          transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out',
          opacity: loading ? 0.5 : 1,
          transform: loading ? 'translateY(-20px)' : 'translateY(0)',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {messages.length ? (
              messages.map((message, index) => (
                <ListItem
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === "System" ? "center" : (message.sender === username ? "flex-end" : "flex-start"),
                    marginBottom: 1,
                    flexDirection: message.sender === username ? "row-reverse" : "row",
                  }}
                >
                  {message.sender === "System" ? (
                    <Stack
                      sx={{
                        padding: 1.5,
                        maxWidth: '80%',
                        color: isDarkMode ? 'white' : 'rgba(0, 0, 0, 0.54)',
                        textAlign: 'center',
                        borderRadius: 2,
                        fontWeight: "bold",
                        fontStyle: "italic"
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        {message.text}
                      </Typography>
                    </Stack>
                  ) : (
                    <>
                      <Avatar sx={{ bgcolor: message.sender === username ? 'primary.main' : 'secondary.main', margin: 1 }}>
                        {message.sender.charAt(0).toUpperCase()}
                      </Avatar>

                      <Paper
                        elevation={0}
                        sx={{
                          padding: 1.5,
                          maxWidth: '70%',
                          ml: message.sender === username ? "auto" : 0,
                          color: message.isPrivate 
                            ? 'warning.contrastText' 
                            : (message.sender === username ? 'text.primary' : 'text.primary'),
                          borderRadius: message.sender === username ? '16px 0 16px 16px' : '0 16px 16px 16px',
                          textAlign: message.sender === username ? "right" : "left",
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                          {message.sender} {message.isPrivate && '(Private Chat)'}
                        </Typography>
                        <Typography variant="body2" mb={1}>{message.text}</Typography>
                        <Typography 
                          variant="caption" 
                          color={message.isPrivate ? 'warning.contrastText' : 'text.secondary'}
                          sx={{ display: "block", textAlign: message.sender === username ? "right" : "left" }}
                        >
                          {moment(message.timestamp).format('LTS')}
                        </Typography>
                      </Paper>
                    </>
                  )}
                </ListItem>
              ))
            ) : (
              <Typography variant="body1" color="text.secondary" textAlign="center">
                No messages yet. Start the conversation!
              </Typography>
            )}
            <div ref={messagesEndRef} />
          </List>

        )}
      </Paper>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          ref={textFieldRef}
          size="small"
          fullWidth
          variant="outlined"
          autoComplete="off"
          value={currentMessage}
          placeholder={`Send a message into #${channelName} or type a command...`}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <IconButton color="info" onClick={handleSendMessage}>
          <SendIcon />
        </IconButton>
      </Box>

      <Popover
        open={Boolean(anchorEl) && filteredCommands.length > 0}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        sx={{ mt: -2 }}
        slotProps={{
          paper: {
            sx: {
              width: textFieldRef.current ? textFieldRef.current.clientWidth : 'auto',
              padding: 2,
              height: `${Math.min(filteredCommands.length * 110, 300)}px`,
              borderRadius: 2,
            },
          },
        }}
      >
        <List>
          {filteredCommands.map((cmd, index) => (
            <ListItem button key={index} sx={{ padding: 1, display: 'block', cursor: "pointer", borderRadius: 2 }} onClick={() => setCurrentMessage(cmd.command)}>
              <Typography variant="body2" sx={{ color: isDarkMode ? 'white' : '#333', fontWeight: 'bold' }}>
                {cmd.command}
              </Typography>
              <Typography variant="caption" sx={{ color: '#b9bbbe' }}>
                {cmd.description}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Popover>
    </Box>
  );
};

export default Chat;
