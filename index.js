/**
 * Madeline the discord bot
 */

const fs = require('fs')
const utils = require('./utils.js')
const { prefix, token, defaultBroadcastChannelName } = require('./config.json')
const Discord = require('discord.js')

// Create a new discord client
const client = new Discord.Client({ partials: ['USER', 'GUILD_MEMBER'] })
client.commands = new Discord.Collection()

// Saves an array of all files in the commands folder that end in '.js'.
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.name, command)
}

// When the client is ready, run this code
// This event will only trigger one time after logging in
client.once('ready', () => {
    console.log('Ready!')
})

// Execute commands
client.on('message', async message => {
    if (message.channel.name === defaultBroadcastChannelName && !message.author.bot) {
        if (client.commands.has('broadcast')) {
            client.commands.get('broadcast').execute(message, message.content.match(/[^\s"]+|"([^"]*)"/g))
        }
        return
    }

    if (!message.content.startsWith(prefix) || message.author.bot) return

    // Split input into command and args.
    // Args are split based on spaces or quotes. E.g. the input, "this is a poll" option1 option2
    // will yield an args list of ["this is a poll", option1, option2]
    const args = message.content.slice(prefix.length).match(/[^\s"]+|"([^"]*)"/g)
    const commandName = args.shift().toLowerCase()

    console.log(`Command: ${commandName}`)
    console.log('Args:')
    for (let i = 0; i < args.length; i++) {
        console.log(`\t${args[i]}`)
    }

    // Make sure the command exists.
    if (!client.commands.has(commandName)) {
        message.reply('Unknown command')
        return
    };

    // Make sure the command has the correct arguments.
    const command = client.commands.get(commandName)
    if (command.args && !command.argsOptional && !args.length) {
        utils.reportCommandUsageError(command,
            message,
            'You didn\'t provide any arguments')
        return
    }

    // Execute the command.
    try {
        command.execute(message, args)
    } catch (error) {
        console.error(error)
        message.reply('There was an error trying to execute that command!')
    }
})

// Login to discord with the token
client.login(token)
