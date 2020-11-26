module.exports = {
    name: 'ping',
    description: 'Ping!',

    execute(message, args) {
        // eslint-disable-next-line no-useless-escape
        message.channel.send('Pong ^\_\_^')
    }
}
