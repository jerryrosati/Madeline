/**
 * Admin command. Announces a status or changelog update.
 *
 * Usage: !announce <change|status> message
 * Example: !announce status Madeline is up and running.
 */
const { statusChannelName, updatesChannelName } = require('../../../config.json')
const Discord = require('discord.js')
const { Command } = require('discord.js-commando')

module.exports = class AnnounceCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'announce',
            group: 'admin',
            memberName: 'announce',
            description: 'Announces a changelog or status update about Madeline to all servers where she is running.',
            ownerOnly: true,
            args: [
                {
                    key: 'type',
                    prompt: 'What kind of an announcement is this?',
                    type: 'string',
                    oneOf: ['status', 'change']
                },
                {
                    key: 'text',
                    prompt: 'What is the announcement text?',
                    type: 'string'
                }
            ]
        })
    }

    run(message, { type, text }) {
        let channelName

        // Set the channel name based on the type of announcement it is.
        if (type === 'status') {
            channelName = statusChannelName
        } else if (type === 'change') {
            channelName = updatesChannelName
        }

        const embed = new Discord.MessageEmbed()
            .setDescription(text)

        // Get the user information to add to the embed.
        message.guild.members.fetch(message.author.id)
            .then(member => {
                embed.setAuthor(`Broadcast from ${member.displayName}`, member.user.avatarURL())
                embed.setColor(member.displayColor)

                // Get the server information to add to the embed.
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
            .catch(error => console.log('Error while fetching user', error))
    }
}
