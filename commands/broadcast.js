/**
 * Broadcast command. Sends a message to all channels with the name specified in the config.json.
 *
 * Usage: !broadcast message_text
 * Example: !broadcast This is a test
 */
const { dev_id, broadcast_channel_name } = require('./../config.json')
const utils = require('./../utils.js')
const Discord = require('discord.js')

module.exports = {
    name: 'broadcast',
    description: 'Broadcast to all channels (admin command only)',
    usage: 'message',
    args: true,

    execute(message, args) {
        if (message.author.id !== dev_id) {
            message.reply('Not permitted to broadcast :(')
            return
        }

        if (args.length < 1) {
            utils.reportCommandUsageError(this, message, 'Broadcasts must have a message')
            return
        }

        const embed = new Discord.MessageEmbed()
            .setDescription(args.join(' '))

        message.client.guilds.cache
            .filter(guild => guild.available)
            .each(guild => {
                console.log(`Guild name: ${guild.name}`)
                console.log(`id = ${message.author.id}`)

                guild.members.fetch(message.author.id)
                    .then(member => {
                        embed.setAuthor('Broadcast', member.user.avatarURL())
                        embed.setColor(member.displayColor)

                        guild.channels.cache
                            .filter(channel => channel.name === broadcast_channel_name)
                            .each(channel => channel.send(embed))
                    })
            })
    }
}
