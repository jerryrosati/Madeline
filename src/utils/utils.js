/**
 * Utility functions.
 */
const { MessageEmbed } = require('discord.js');

module.exports = {
    /**
     * Capitalizes the first letter of the given string.
     *
     * @param {String} string A string to capitalize.
     */
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    },

    /**
     * Generates a discord embed for an anime series.
     *
     * @param {Media} series The anime series
     * @param {Message} message The message containing the original command.
     */
    generateAnimeSeriesEmbed(series) {
        // Create the message embed using the series information.
        const embed = new MessageEmbed()
            .setColor(series.coverImage.color)
            .setThumbnail(series.coverImage.extraLarge)
            .setTitle(series.title.romaji)
            .setURL(`https://anilist.co/anime/${series.id}`)
            .setDescription(series.description.replace(/(<([^>]+)>)/g, ''))
            .setImage(series.bannerImage)
            .addFields(
                { name: 'Episodes', value: `${series.episodes}`, inline: true },
                { name: 'Status', value: this.capitalizeFirstLetter(series.status), inline: true },
                { name: 'Season', value: `${this.capitalizeFirstLetter(series.season)} ${series.seasonYear}`, inline: true },
                { name: 'Genres', value: series.genres.join('\n'), inline: true },
            );

        // Add studios if there are any listed.
        const studios = series.studios.nodes;
        if (studios.length > 0) {
            embed.addField('Studio', series.studios.nodes.map(studio => studio.name).join('\n'), true);
        }

        return embed;
    },

    /**
     * Generates a discord embed for a manga series.
     * @param {Media} series The manga series.
     * @returns {MessageEmbed} The message containing the original command.
     */
    generateMangaSeriesEmbed(series) {
        const embed = new MessageEmbed()
            .setColor(series.coverImage.color)
            .setThumbnail(series.coverImage.extraLarge)
            .setTitle(series.title.romaji)
            .setURL(series.siteUrl)
            .setDescription(series.description.replace(/(<([^>]+)>)/g, ''))
            .setImage(series.bannerImage)
            .addFields(
                { name: 'Genres', value: series.genres.join('\n'), inline: true },
                { name: 'Status', value: this.capitalizeFirstLetter(series.status), inline: true }
            );

        if (series.status.toLowerCase() === 'finished') {
            embed.addFields(
                { name: 'Chapters', value: `${series.chapters}`, inline: true },
                { name: 'Volumes', value: `${series.volumes}`, inline: true },
            );
        }

        series.staff.edges.forEach(staff => {
            embed.addField(staff.role, `[${staff.node.name.full}](${staff.node.siteUrl})`, true);
        });

        return embed;
    },
};
