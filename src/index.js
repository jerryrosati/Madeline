/**
 * Madeline the discord bot.
 */

// Require the necessary discord.js classes.
const fs = require('fs');
const path = require('path');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./../config.json');

/**
 * Traverses the specific directory to find a list of javascript files.
 * @param dir The root directory to traverse.
 */
function gatherJsFiles(dir) {
    const files = [];
    fs.readdirSync(dir).forEach(file => {
        const sub = path.join(dir, file);

        if (fs.statSync(sub).isDirectory()) {
            gatherJsFiles(sub).forEach(f => files.push(f));
        } else if (file.endsWith('.js')) {
            files.push(sub);
        }
    });

    return files;
}

// Create a new client instance.
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
// const commandFiles = gatherJsFiles('./src/commands');

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

console.log('Found the following files:');
commandFiles.forEach(name => console.log(name));

// When the client is ready, run this code (only once).
client.once('ready', () => {
    console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// Login to Discord with your client's token.
client.login(token);

/*
const { prefix, devID, token, defaultBroadcastChannelName } = require('./../config.json')
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
    client.user.setActivity('the chat zoom by', { type: 'WATCHING' })
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
*/
