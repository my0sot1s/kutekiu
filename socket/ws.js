
const CHANNEL_DEFINED = {
    received: 'cvs.message.received.',
    sent: 'cvs.message.sent.'
}

const CHANNEL_ROOM = {
    leave: 'cvs.room.leave',
    join: 'cvs.room.join',
    room: 'cvs.room.'
}

const makeid = () => {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 20; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text
}

const generateID = (io) => {
    io.engine.generateId = (req) => {
        let id = makeid()
        console.log(id)
        return req.id = id
    }
}
/**
 *  send Message
 * @param {*} connection
 * @param {*} message
 */
let sendMessage = (connection, message) => {
    connection.emit(`${CHANNEL_DEFINED.received}${connection.id}`, { svb: message })
}
/**
 *
 * @param {*} io
 * @param {array} rooms
 * @param {*} message
 */
let broadcastMessage = (socket, rooms, message) => {
    for (var r of rooms) {
        // socket.broadcast.to(r).emit(message)  // broadcast to everyone in the room
        socket.broadcast.emit(`${CHANNEL_ROOM.room}${r}`, { svb: { mes: `${message} :${r}` } })
    }
}
 const initSocket = async (io) => {

    io.use((socket, next) => {
        // console.log(socket.request.headers)
        let clientId = socket.handshake.headers['x-clientid'];
        if (clientId && clientId.length === 40) {
            return next();
        }
        // if (socket.request.headers.cookie) return next();
        // return next(new Error('authentication error'));
    });

    await generateID(io)

    let connection = await io.on('connection', (connection) => {
        console.log('Client connected: ', connection.id)
        connection.on(`${CHANNEL_DEFINED.sent}${connection.id}`, message => {
            // console.log(`${CHANNEL_DEFINED.sent}${connection.id}`)
            for (var r of connection.rooms) {
                connection.broadcast.emit(`${CHANNEL_ROOM.room}${r}`, { svb: message })
            }
        })
        // message:{rooms:array}
        connection.on(`${CHANNEL_ROOM.join}`, message => {
            console.log(`----->join room `, message.rooms)
            connection.join(message.rooms, () => {
                connection.rooms = message.rooms
                broadcastMessage(connection, message.rooms, `${connection.id} has joined room`)
            })
        })
        // message:{rooms:array}
        connection.on(`${CHANNEL_ROOM.leave}`, message => {
            // leave room
            broadcastMessage(connection, message.rooms, `${connection.id} has left room`)
            connection.leave(message.rooms, () => {
                // broadcastMessage(connection, message.rooms, `${connection.id} has left room`)
            })
        })
        connection.on('disconnect', (reason) => {
            console.log(`Disconnect: `, connection.id)
        });
    })
}

module.exports={initSocket}
