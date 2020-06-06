const Discord = require('discord.js');
const r2 = require('r2');

module.exports = {
    name: 'whatanime',
    description: 'Check what anime with a gif or image.',
    args: false,

    execute(message, args) {
        // Exit if message doesn't have any attachments.
        if (!message.attachments.array().length) {
            message.reply(`Couldn't search :( Need an image attachment.`)
            return;
        }

        const attachedImageUrl = message.attachments.first().url;
        console.log(attachedImageUrl);

        // Exit if attachment is a gif.
        if (attachedImageUrl.endsWith(".gif")) {
            message.reply("Right now I only handle still images :(");
            return;
        }

        // Search trace.moe for the anime and send an embed with the anime information to the channel.
        const traceUrl = `https://trace.moe/api/search?url=${attachedImageUrl}`;
        const getData = async url => {
            try {
                const response = await r2(url).json;
                const similarity = response.docs[0].similarity * 100;
                const englishTitle = response.docs[0].title_english;
                const exampleEmbed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(`${englishTitle}`)
                    .setURL(`https://anilist.co/anime/${response.docs[0].anilist_id}`)
                    .setDescription(`I'm literally just a link to anilist`);

                console.log(response);
                message.reply(`Anime is: ${englishTitle} (${similarity}% confidence)`);
                message.channel.send(exampleEmbed);
            } catch (error) {
                message.reply("Couldn't retrieve anime information :(");
                console.log(error);
            }
        };

        getData(traceUrl);
    },
};