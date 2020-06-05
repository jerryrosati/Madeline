const Discord = require('discord.js');

module.exports = {
    name: 'embedtest',
    description: 'Fake embed',
    args: false,
    execute(message, args) {
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle("Embed Title lolol")
            .setURL('https://anilist.co')
            .setDescription(`I'm literally just a link to anilist`);
        message.channel.send(exampleEmbed);
    },
};