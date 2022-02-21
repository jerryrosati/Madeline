const { SlashCommandBuilder } = require('@discordjs/builders');
const Query = require('../data/query');
const { QueryTypes } = require('../data/query-type');
const utils = require('../utils/utils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anime')
        .setDescription('Search anilist for an anime series')
        .addStringOption(option =>
            option.setName('series')
                .setDescription('The series to search for')
                .setRequired(true)),

    async execute(interaction) {
        const title = interaction.options.getString('series');

        const variables = {
            search: title,
            page: 1,
            perPage: 3,
        };

        // Query anilist with the name of the anime.
        const query = new Query(QueryTypes.Anime, variables);
        const response = await query.performQuery();
        const json = await response.json();
        console.log(JSON.stringify(json, null, 3));

        // Back out early if no anime was found.
        if (!json.data.Page.media || !json.data.Page.media.length) {
            interaction.reply('Couldn\'t find any anime with that name :(');
            return;
        }

        // Post an embed with information if an anime was found.
        const series = json.data.Page.media[0];
        const embed = utils.generateAnimeSeriesEmbed(series);
        await interaction.reply({ embeds: [embed] });
    },
};
