/**
 * Creates a poll.
 * 
 * Usage: !poll "Poll text" option1 option2 [option3 ... option10]
 * Example: !poll "What day should we play?" Monday Tuesday Wednesday
 */

const Discord = require('discord.js');
const utils = require("../utils");

 module.exports = {
     name: 'poll',
     description: 'Create a poll',
     usage: '\"Poll text\" option1 option2 [option3 ... option10]',
     args: true,
     argsOptional: false,

     execute(message, args) {
        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
        const checkMark = '✅';

        if (args.length < 3) {
            utils.reportCommandUsageError(this, message, "Polls must have a description and at least 2 options");
            return;
        } else if (args.length > 11) {
            utils.reportCommandUsageError(this, message, "Polls can only have up to 10 options");
            return;
        }

        let reactEmojis = emojis.slice(0, args.length - 1);
        reactEmojis.push(checkMark);

        let desc = '';
        for (let i = 1; i < args.length; i++) {
            desc += `\t${emojis[i - 1]}: ${args[i]}\n\n`
        }

        const embed = new Discord.MessageEmbed()
            .setTitle(`Poll: ${args[0]}`)
            .addFields({name: 'Options', value: desc, inline: true});

        message.channel.send(embed)
            .then(embedMessage => {
                reactEmojis.forEach(emoji => embedMessage.react(emoji));

                const filter = (reaction, user) => {
                    return emojis.slice(0, args.length - 1).includes(reaction.emoji.name) || 
                        reaction.emoji.name === checkMark && user.id === message.author.id;
                }
        
                const collector = embedMessage.createReactionCollector(filter);
        
                collector.on('collect', (reaction, user) => {
                    console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);

                    if (reaction.emoji.name === checkMark && user.id === message.author.id) {
                        collector.stop();
                    }
                });
        
                collector.on('end', collected => {
                    console.log(`Collected ${collected.size} items`);
                    let winner = collected.filter(r => r.emoji.name != checkMark).sort((r1, r2) => r2.count - r1.count).first();
                    collected.forEach(reaction => console.log(`${reaction.emoji.name}, ${reaction.count}`));
                    console.log(`Length of emojis: ${collected.filter(reaction => reaction.emoji.name != checkMark).size} `);
                    message.reply(`Winner: ${winner.emoji.name}`);
                });
            })
            .catch(console.error);
     }
 };