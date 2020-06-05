const Discord = require('discord.js');
const r2 = require('r2');

module.exports = {
    name: 'whatanime',
    description: 'Check what anime with a gif or image.',
    args: false,
    execute(message, args) {
        const attachedImageUrl = message.attachments.first().url;
        const traceUrl = `https://trace.moe/api/search?url=${attachedImageUrl}`;
        console.log(attachedImageUrl)

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
                console.log(error);
            }
        };

        getData(traceUrl);
    },
};