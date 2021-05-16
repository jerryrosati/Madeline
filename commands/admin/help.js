/**
 * Prints out details about all of Madeline's commands
 *
 * Usage: !help
 */
const Discord = require('discord.js')
const { prefix } = require('./../../config.json')

module.exports = {
    name: 'help',
    description: 'Display details about Madeline\'s commands',
    usage: '',
    args: false,
    argsOptional: false,

    execute(message, args) {
        const { commands } = message.client
        const commandStr = commands.map(command => `**${prefix}${command.name}**: ${command.description}\n*Usage*: ${prefix}${command.name} ${command.usage}\n`).join('\n')

        const embed = new Discord.MessageEmbed()
            .setTitle('Madeline\'s Commands:')
            .setDescription(commandStr)

        message.channel.send(embed)
    }
}
