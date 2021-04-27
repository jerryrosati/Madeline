/**
 * Broadcast command. Sends a message to all channels with the name specified in the config.json.
 *
 * Usage: !broadcast message_text
 * Example: !broadcast This is a test
 */
const { dev_id, statusChannelName, updatesChannelName, defaultBroadcastChannelName } = require('./../config.json')
const utils = require('./../utils.js')
const Discord = require('discord.js')

/* eslint-disable quote-props */
module.exports = {
    name: 'broadcast',
    description: 'Broadcast to all channels (admin command only)',
    usage: 'message',
    args: true,

    execute(message, args) {
        const types = {
            'status': statusChannelName,
            'change': updatesChannelName
        }

        if (args.length < 1) {
            utils.reportCommandUsageError(this, message, 'Broadcasts must have a message')
            return
        }

        // Check if there's a type (e.g. status or change)
        const typeFlagIndex = args.indexOf('-t')
        let channelName = defaultBroadcastChannelName
        if (typeFlagIndex !== -1) {
            if (message.author.id !== dev_id) {
                utils.reportCommandUsageError(this, message, 'Must be a developer to use the -t argument')
                return
            }

            if (typeFlagIndex + 1 >= args.length) {
                utils.reportCommandUsageError(this, message, 'Must provide an argument for -t')
            }

            const matches = args[typeFlagIndex + 1].toLowerCase().match(/(status|change)/)
            if (matches.length === 0) {
                utils.reportCommandUsageError(this, message, 'Type must be either status or change')
            } else {
                channelName = types[matches[1]]
                args.splice(typeFlagIndex, 2)
            }
        }

        const embed = new Discord.MessageEmbed()
            .setDescription(args.join(' '))

        message.guild.members.fetch(message.author.id)
            .then(member => {
                embed.setAuthor(`Broadcast from ${member.displayName}`, member.user.avatarURL())
                embed.setColor(member.displayColor)

                message.client.guilds.cache
                    .filter(guild => guild.available)
                    .each(guild => {
                        console.log(`Guild name: ${guild.name}`)
                        console.log(`id = ${message.author.id}`)

                        guild.channels.cache
                            .filter(channel => channel.name === channelName)
                            .each(channel => channel.send(embed))
                    })
            })
            .catch(error => {
                console.log('Error while fetching user', error)
            })
    }
}
