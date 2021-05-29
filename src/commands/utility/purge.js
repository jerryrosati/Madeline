/**
 * Deletes an amount of messages the user specifies.
 *
 * Usage: !purge 20
 */
const { Command } = require('discord.js-commando')

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
            const messagesToDelete = await message.channel.messages.fetch({ limit: amount, before: message.id })
            console.log(`messageToDelete size = ${messagesToDelete.size}`)
            const deletedMessages = await message.channel.bulkDelete(messagesToDelete)
            console.log(`Bulk deleted ${deletedMessages.size} messages from channel ${message.channel.name}.`)
        } catch (error) {
            console.error(error)
            message.reply('Failed to delete messages')
        }
    }
}
