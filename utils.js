const config = require('./config.json');
const Discord = require('discord.js');

module.exports = {
    /**
     * Capitalizes the first letter of the given string.
     * 
     * @param {String} string A string to capitalize.
     */
    capitalizeFirstLetter(string)
    {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    },

    /**
     * Callback when errors are caught; logs the error and alerts the bot developer.
     * 
     * @param {Message} message The message containing the command.
     * @param {*} error The error that occurred.
     */
    logError(message, error) {
        message.channel.send(`<@${config.dev_id}> Madeline has encountered an error and is shutting down for now.`);
        console.log(error);
    },

    /**
     * Report command usage errors.
     * 
     * @param {*} command The command being executed.
     * @param {Message} message The message containing the command.
     * @param {String} errorDescription The reply to send back to the user who initiated the command.
     * 
     */
    reportCommandUsageError(command, message, errorDescription) {
        let reply = `${errorDescription}, ${message.author}`;
        if (command.usage) {
            reply += `\nThe proper usage would be: \`${config.prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    },

    /**
     * Sends a discord embed for an anime series.
     * 
     * @param {Media} series The anime series
     * @param {Message} message The message containing the original command.
     */
    sendAnimeSeriesEmbed(series, message) {
        const embed = new Discord.MessageEmbed()
            .setColor(series.coverImage.color)
            .setThumbnail(series.coverImage.extraLarge)
            .setTitle(series.title.romaji)
            .setURL(`https://anilist.co/anime/${series.id}`)
            .setDescription(series.description.replace(/(<([^>]+)>)/g, "")) // Remove html tags from the description.
            .setImage(series.bannerImage)
            .addFields(
                {name: 'Episodes', value: series.episodes, inline: true},
                {name: 'Status', value: this.capitalizeFirstLetter(series.status), inline: true},
                {name: 'Season', value: `${this.capitalizeFirstLetter(series.season)} ${series.seasonYear}`, inline: true},
                {name: 'Genres', value: series.genres, inline: true},
            );

        let studios = series.studios.nodes;
        if (studios.length > 0) {
            embed.addFields(
                {name: 'Studio', value: series.studios.nodes.map(studio => studio.name), inline: true},
            );
        }
        message.channel.send(embed);
    }
}