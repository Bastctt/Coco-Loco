// utils
import api from "./api";
import socket from "./socket";

const handleCommand = async (command, { username, setUsername, channelName, setActiveChannel, enqueueSnackbar, setMessages, setCurrentMessage }) => {
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();

    switch (cmd) {
      case '/nick': {
        const newNickname = parts.slice(1).join(' ');
        if (!newNickname.trim()) {
          enqueueSnackbar('Please provide a valid nickname.', { variant: 'error' });
        } else {
          enqueueSnackbar(`Your nickname is now ${newNickname}`, { variant: 'success' });
          localStorage.setItem('username', newNickname);
          setUsername(newNickname);
          setCurrentMessage('');
        }
        break;
      }

      case '/create': {
        const newChannel = parts.slice(1).join(' ');
        if (!newChannel.trim()) {
          enqueueSnackbar('Please provide a valid channel name.', { variant: 'error' });
        } else {
          try {
            await api.createChannel(newChannel);
            enqueueSnackbar(`Channel #${newChannel} created`, { variant: 'success' });
            setCurrentMessage('');
          } catch (error) {
            enqueueSnackbar('Failed to create channel', { variant: 'error' });
          }
        }
        break;
      }

      case '/delete': {
        const channelToDelete = parts.slice(1).join(' ');
        if (!channelToDelete.trim()) {
          enqueueSnackbar('Please provide a valid channel name.', { variant: 'error' });
        } else {
          try {
            await api.deleteChannel(channelToDelete);
            enqueueSnackbar(`Channel #${channelToDelete} deleted`, { variant: 'success' });
            setCurrentMessage('');
          } catch (error) {
            enqueueSnackbar('Failed to delete channel', { variant: 'error' });
          }
        }
        break;
      }

      case '/list': {
        try {
          const filter = parts.slice(1).join(' ');
          const { data } = await api.listChannels(filter);
          
          if (data.length === 0) {
            enqueueSnackbar('No channels found.', { variant: 'info' });
          } else {
            const channelNames = data.map((channel) => `#${channel.name}`).join(', ');
            enqueueSnackbar(`Available channels: ${channelNames}`, { variant: 'info' });
          }
          setCurrentMessage('');
        } catch (error) {
          enqueueSnackbar('Failed to fetch channels', { variant: 'error' });
        }
        break;
      }

      case '/join': {
        const channelToJoin = parts.slice(1).join(' ');
        if (!channelToJoin.trim()) {
          enqueueSnackbar('Please provide a valid channel name.', { variant: 'error' });
        } else {
          try {
            await api.joinChannel(channelToJoin, username);
            enqueueSnackbar(`Joined channel #${channelToJoin}`, { variant: 'success' });
    
            socket.emit('joinChannel', { username, channelName: channelToJoin });
    
            setActiveChannel(channelToJoin);
            localStorage.setItem('activeChannel', channelToJoin);
            setCurrentMessage('');
          } catch (error) {
            enqueueSnackbar('Failed to join channel', { variant: 'error' });
          }
        }
        break;
    }
    
      case '/quit': {
        const channelToQuit = parts.slice(1).join(' ');
        if (!channelToQuit.trim()) {
          enqueueSnackbar('Please provide a valid channel name.', { variant: 'error' });
        } else {
          try {
            await api.quitChannel(channelToQuit, username);
            enqueueSnackbar(`Left channel #${channelToQuit}`, { variant: 'success' });
    
            socket.emit('leaveChannel', { username, channelName: channelToQuit });
    
            setActiveChannel('');
            localStorage.removeItem('activeChannel');
            setMessages([]);
            setCurrentMessage('');
          } catch (error) {
            enqueueSnackbar('Failed to leave channel', { variant: 'error' });
          }
        }
        break;
    }

      case '/users': {
        if (!channelName) {
          enqueueSnackbar('You are not in a channel.', { variant: 'error' });
          return;
        }
      
        try {
          const { data } = await api.listUsersInChannel(channelName);
          if (data.users.length === 0) {
            enqueueSnackbar('No users in this channel.', { variant: 'info' });
          } else {
            const userList = data.users.join(', ');
            enqueueSnackbar(`Users in #${channelName}: ${userList}`, { variant: 'info' });
          }
          setCurrentMessage('');
        } catch (error) {
          enqueueSnackbar('Failed to fetch users in the channel.', { variant: 'error' });
        }
        break;
    }

    case '/msg': {
      const recipient = parts[1];
      const message = parts.slice(2).join(' ');

      if (!recipient || !message) {
        enqueueSnackbar('Usage: /msg nickname message', { variant: 'error' });
      } else {
        const privateChannel = [username, recipient].sort().join('-');
        
        socket.emit('privateMessage', { sender: username, recipient, text: message });

        setActiveChannel(privateChannel);
        localStorage.setItem('activeChannel', privateChannel);
        enqueueSnackbar(`Private chat started with ${recipient}`, { variant: 'success' });

        setCurrentMessage('');
      }
      break;
    }

      default:
        enqueueSnackbar('Unknown command', { variant: 'error' });
        break;
    }
  };

  export default handleCommand;