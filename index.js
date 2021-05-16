/**
 * Madeline the discord bot
 */
const { prefix, devID, token, defaultBroadcastChannelName } = require('./config.json')
const { CommandoClient } = require('discord.js-commando')
const path = require('path')

// Create a new discord client
const client = new CommandoClient({
    commandPrefix: prefix,
    owner: devID
})

// Register the commands.
client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['admin', 'Admin commands'],
        ['media', 'Commands related to media (anime, manga, etc.)'],
        ['utility', 'Utility commands'],
        ['misc', 'Other commands']
    ])
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'))

// Triggered when the client is ready, which will happen once after login.
client.once('ready', () => {
    console.log('Ready!')
    client.user.setActivity('In dev')
})

// Triggered when a message is sent.
client.on('message', async message => {
    // If a message is sent in a broadcast channel, then broadcast is to all other servers with that channel.
    // Need to manually look for the broadcast command because this won't have the normal command format of !broadcast <message>.
    if (message.channel.name === defaultBroadcastChannelName && !message.author.bot) {
        const commands = client.registry.commands
        const broadcastCommand = commands.get('broadcast')
        broadcastCommand.run(message, { text: message.content })
    }
})

client.on('error', error => console.error(error))

// Login to discord with the token
client.login(token)
