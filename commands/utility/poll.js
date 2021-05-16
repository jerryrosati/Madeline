/**
 * Creates a poll.
 *
 * Usage: !poll "Poll text" option1 option2 [option3 ... option10]
 * Example: !poll "What day should we play?" Monday Tuesday Wednesday
 */
const Discord = require('discord.js')
const { Command } = require('discord.js-commando')

module.exports = class PollCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'poll',
            group: 'utility',
            memberName: 'poll',
            description: 'Make a poll.',
            args: [
                {
                    key: 'name',
                    prompt: 'What should the name of the poll be?',
                    type: 'string'
                },
                {
                    key: 'options',
                    prompt: 'What options should the poll have?',
                    type: 'string'
                }
            ]
        })
    }

    run(message, { name, options }) {
        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
        const checkMark = '✅'

        console.log(`name = ${name}`)
        console.log(`options = ${options}`)
        const pollOptions = options.split(' ')
        console.log(`pollOptions = ${pollOptions}`)

        const reactEmojis = emojis.slice(0, pollOptions.length)
        reactEmojis.push(checkMark)

        let desc = ''
        for (let i = 0; i < pollOptions.length; i++) {
            desc += `${emojis[i]}: ${pollOptions[i]}\n\n`
        }

        const embed = new Discord.MessageEmbed()
            .setTitle(`Poll: ${name}`)
            .addFields({ name: 'Options', value: desc, inline: true })

        // Send the message with the poll embed.
        message.channel.send(embed)
            .then(embedMessage => {
                reactEmojis.forEach(emoji => embedMessage.react(emoji))

                const filter = (reaction, user) => {
                    return emojis.slice(0, pollOptions.length - 1).includes(reaction.emoji.name) ||
                        (reaction.emoji.name === checkMark && user.id === message.author.id)
                }

                const collector = embedMessage.createReactionCollector(filter)

                collector.on('collect', async (reaction, user) => {
                    // If the user hasn't sent a message after the poll was started, the user
                    // won't be cached and will be partial, so reactions from that user won't be counted.
                    // If this happens, fetch the user before counting the reaction.
                    if (user.partial) {
                        console.log('User who reacted is partial')
                        try {
                            await user.fetch()
                        } catch (error) {
                            console.error('Something went wrong when fetching the user')
                        }
                    }

                    console.log(`Collected ${reaction.emoji.name} from ${user.tag}`)

                    // The poll ends when the person who started it presses the check mark.
                    if (reaction.emoji.name === checkMark && user.id === message.author.id) {
                        collector.stop()
                    }
                })

                // Calculate and announce the winner.
                collector.on('end', collected => {
                    console.log(`Collected ${collected.size} items`)
                    const winner = collected.filter(r => r.emoji.name !== checkMark).sort((r1, r2) => r2.count - r1.count).first()
                    collected.forEach(reaction => console.log(`${reaction.emoji.name}, ${reaction.count}`))
                    console.log(`Length of emojis: ${collected.filter(reaction => reaction.emoji.name !== checkMark).size} `)
                    message.reply(`Winner for Poll ${pollOptions[0]}: ${winner.emoji.name}`)
                })
            })
            .catch(console.error)
    }
}
