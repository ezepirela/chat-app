const   path                                            =   require('path'),
        express                                         =   require('express'),
        http                                            =   require('http'),
        app                                             =   express(),
        PORT                                            =   3000,
        server                                          =   http.createServer(app),
        socketio                                        =   require('socket.io'),
        io                                              =   socketio(server),
        generateMessage                                 =   require('./utils/message'),
        publicDirectoryPath                             =   path.join(__dirname, './public'),
        { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
const message = 'welcome user';
app.use(express.static(publicDirectoryPath));
io.on('connection', (socket) => {
    console.log('connected');
    
    socket.on('join', (options, callback) => {
        //io.to.emit socket.broadcast.to.emit sends message for users inside a specific room
        const {error, user} = addUser({id: socket.id, ...options});
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage('admin', 'Welcome!'));
        socket.broadcast.to(user.room).emit('message', generateMessage('admin', `${user.username} has joined!`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })
    socket.on('sendMessage', (sendMessage, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message', generateMessage(user.username, sendMessage));
        callback();
    })
    // if the function has third argument its a actknowledgment parameter
    //that its sent when the message was delivered
    
    socket.on('sendLocation', (position, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateMessage(user.username, `https://google.com/maps?q=${position.latitude},${position.longitude}`));
        callback();
    })
    socket.on('disconnect', () =>{
        const user = removeUser(socket.id);
        if(user) {
           io.to(user.room).emit('message', generateMessage('admin', `${user.username} has left!`));
           io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        }
        
        
    })
})
server.listen(PORT, () => {
    console.log('app running')
})