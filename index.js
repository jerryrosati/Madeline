/**
 * Madeline the discord bot
 */

 const fs = require('fs');

 // Require auth.json
const { prefix, token } = require('./config.json');

// Require the discord.js module
const Discord = require('discord.js');

// Create a new discord client
const client = new Discord.Client();
client.commands = new Discord.Collection();

// Saves an array of all files in the commands folder that end in '.js'.
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles)
{
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// When the client is ready, run this code
// This event will only trigger one time after logging in
client.once('ready', () => {
    console.log('Ready!');
});

// Log any message send inside a channel the bot has access to, log it
client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/)
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName))
    {
        message.reply('Unknown command');
        return;
    };

    const command = client.commands.get(commandName);

    if (command.args && !args.length)
    {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage)
        {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    try
    {
        command.execute(message, args);
    }
    catch (error)
    {
        console.error(error);
        message.reply('There was an error trying to execute that command!');
    }
});

// Login to discord with the token
client.login(token);