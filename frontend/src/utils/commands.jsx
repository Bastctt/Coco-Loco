const commands = [
    { command: '/nick', description: 'nickname: define your nickname on the server.' },
    { command: '/create', description: 'channel: create a channel with the specified name.' },
    { command: '/delete', description: 'channel: delete the channel with the specified name.' },
    { command: '/list', description: '[string]: list the available channels from the server.' },
    { command: '/join', description: 'channel: join the specified channel.' },
    { command: '/quit', description: 'channel: quit the specified channel.' },
    { command: '/users', description: 'list the users currently in the channel.' },
    { command: '/msg', description: 'nickname message: send a private message to the specified nickname.' },
    { command: 'message', description: 'send a message to all the users on the channel' }
  ];
  
  export default commands;
  