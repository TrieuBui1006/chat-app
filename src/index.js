const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('new WebSocket connection')

    socket.emit('message', 'Welcome')
    socket.broadcast.emit('message', 'A new user has joined')

    socket.on('sendMessage', (message, callBack) => {
        const filter = new Filter()

        if(filter.isProfane(message)) {
            return callBack('Profanity is not allowed!')
        }

        io.emit('message', message)
        callBack()
    })

    socket.on('sendLocation', (coords, callBack) => {
        io.emit('locationMessage', `https://google.com/maps?q=${coords.latitude},${coords.longtitude}`)
        callBack()
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user has left')
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})