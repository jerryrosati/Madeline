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

// Search for all the events.
const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    // Initialize each of the events.
    const event = require(`./events/${file}`);

    // Handle each event.
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Login to Discord with your client's token.
client.login(token);
