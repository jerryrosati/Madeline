/**
 * Deletes an amount of messages the user specifies.
 *
 * Usage: !purge 20
 */
const { Command } = require('discord.js-commando')
const Discord = require('discord.js')
module.exports = class PurgeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'purge',
            group: 'utility',
            memberName: 'purge',
            description: 'Deletes a certain amount of messages.',
            userPermissions: ['MANAGE_MESSAGES'],
            args: [
                {
                    key: 'amount',
                    prompt: 'How many messages would you like to delete?',
                    type: 'integer'
                },
                {
                    key: 'confirmation',
                    prompt: 'Are you sure you want to delete that many messages? Type "yes" to confirm.',
                    type: 'string'
                }
            ]
        })
    }

    async run(message, { amount, confirmation }) {
        if (confirmation !== 'yes') {
            return
        }

        if (amount > 100) {
            message.reply('Number of messages to delete must be less than or equal to 100.')
            return
        }

        console.log(`Messages to delete: ${amount}`)

        try {
            // Fetch the list of messages to delete. Add 3 to account for the message with the purge command,
            // Madeline's confirmation message, and then the user's confirmation message
            const messagesToDelete = await message.channel.messages.fetch({ limit: amount + 3 })
            console.log(`messageToDelete size = ${messagesToDelete.size}`)

            // Delete the messages.
            const deletedMessages = await message.channel.bulkDelete(messagesToDelete)

            // Log the purge to the console and to the purge-log channel.
            console.log(`Bulk deleted ${deletedMessages.size} messages (${amount} + ${deletedMessages.size - amount}) from channel ${message.channel.name}.`)
            this.logPurge(message, messagesToDelete, amount)
        } catch (error) {
            console.error(error)
            message.reply('Failed to delete messages')
        }
    }

    logPurge(message, messagesToDelete, amount) {
        const messageText = messagesToDelete
            .sort((messageA, messageB) => messageA.createdTimestamp - messageB.createdTimestamp)
            .map(message => `[${message.createdAt.toLocaleTimeString()}] ${message.author.tag}: ${message.content}`)
            .slice(0, amount)
            .join('\n')

        const embed = new Discord.MessageEmbed()
            .setDescription(messageText)

        message.guild.members.fetch(message.author.id)
            .then(member => {
                embed.setAuthor(`${amount} messages deleted by ${member.user.tag}`, member.user.avatarURL())
                embed.setColor(member.displayColor)

                message.client.guilds.cache
                    .filter(guild => guild.available)
                    .each(guild => {
                        guild.channels.cache
                            .filter(channel => channel.name === 'purge-log')
                            .each(channel => channel.send(embed))
                    })
            })
            .catch(error => {
                console.log('Error while fetching user', error)
            })
    }
}
