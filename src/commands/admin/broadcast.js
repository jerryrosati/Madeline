/**
 * Broadcast command. Sends a message to all channels with the name specified in the config.json.
 *
 */
const { defaultBroadcastChannelName } = require('../../../config.json')
const Discord = require('discord.js')
const { Command } = require('discord.js-commando')

/* eslint-disable quote-props */
module.exports = class BroadcastCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'broadcast',
            group: 'admin',
            memberName: 'broadcast',
            description: 'Broadcast something into the void',
            args: [
                {
                    key: 'text',
                    prompt: 'What do you want to broadcast?',
                    type: 'string'
                }
            ]
        })
    }

    run(message, { text }) {
        const channelName = defaultBroadcastChannelName
        const embed = new Discord.MessageEmbed()
            .setDescription(text)

        console.log(`text to broadcast: ${text}`)

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
                            .each(channel => channel.embed(embed))
                    })
            })
            .catch(error => {
                console.log('Error while fetching user', error)
            })
    }
}
