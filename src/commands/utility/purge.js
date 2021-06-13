/**
 * Deletes an amount of messages the user specifies.
 *
 * Usage: !purge 20
 */
const { Command, ArgumentCollector } = require('discord.js-commando')
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
                }
            ]
        })
    }

    async run(message, { amount }, fromPattern, result) {
        // Collector for the confirmation argument.
        const confirmationCollector = new ArgumentCollector(message.client, [
            {
                key: 'confirmation',
                prompt: 'Are you sure you want to delete that many messages? Type "yes" to confirm.',
                type: 'string'
            }
        ])

        // Collect the confirmation argument manually to force a prompt.
        const confirmation = await confirmationCollector.obtain(message)

        // Exit if the user doesn't confirm.
        if (confirmation.values.confirmation !== 'yes') {
            message.reply('Purge was not confirmed by typing \'yes\'; not purging.')
            return
        }

        // Exit if the user tries to delete more than 90 messages (Discord API's max is 100, so limit to 90
        // to account for the extra prompt and answer messages being deleted).
        if (amount > 90) {
            message.reply('Number of messages to delete must be less than or equal to 95.')
            return
        }

        console.log(`Number of messages to delete: ${amount}`)

        try {
            // Fetch the list of messages to delete.
            const messagesToDelete = await message.channel.messages.fetch({ limit: amount, before: message.id })
            console.log(`messageToDelete size = ${messagesToDelete.size}`)

            // Delete the original purge message.
            message.delete()

            // Delete the messages the user wants to delete.
            const deletedMessages = await message.channel.bulkDelete(messagesToDelete)

            // Delete the user's prompt answer messages.
            const deletedAnswers = await message.channel.bulkDelete(result.answers)
            const deletedConfirmationAnswers = await message.channel.bulkDelete(confirmation.answers)

            // Delete Madeline's prompt messages.
            const deletedPrompts = await message.channel.bulkDelete(result.prompts)
            const deletedConfirmationPrompts = await message.channel.bulkDelete(confirmation.prompts)

            // Log purged message statistics to the terminal.
            const totalDeleted = deletedMessages.size +
                deletedAnswers.size +
                deletedConfirmationAnswers.size +
                deletedPrompts.size +
                deletedConfirmationPrompts.size

            console.log(`Number of messages to delete:
                Deleted messages from purge command: ${deletedMessages.size}
                Deleted user answers for amount arg: ${deletedAnswers.size}
                Deleted Madeline prompts for amount arg: ${deletedPrompts.size}
                Deleted user answers for confirmation arg: ${deletedConfirmationAnswers.size}
                Deleted Madeline prompts for amount arg: ${deletedConfirmationPrompts.size}`)
            console.log(`Bulk deleted ${totalDeleted} messages from channel ${message.channel.name}.`)

            // Log purged messages to the channel.
            this.logPurge(message, messagesToDelete, amount)
        } catch (error) {
            console.error(error)
            message.reply('Failed to delete messages')
        }
    }

    /**
     * Logs the purged messages in a channel and to the terminal.
     * @param {*} message The purge message.
     * @param {*} messagesToDelete The list of messages that will be deleted by the purge (doesn't include prompts or answers for the purge command).
     * @param {*} amount The amount of messages to delete.
     */
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
