/**
 * Seasonal command
 */
const Discord = require('discord.js');
const utils = require('./../utils.js');
const fetch = require("node-fetch");

module.exports = {
    name: 'season',
    description: 'Search for seasonal anime',
    args: true,
    argsOptional: true,
    usage: "[season] [year]",

    execute(message, args) {
        // Anilist query
        // format: TV is for a current season. specfic searches will use format_in: [TV, MOVIE]
        var query = `
        query ($season: MediaSeason, $seasonYear: Int) {
            Page {
                pageInfo {
                    total
                    perPage
                    currentPage
                    lastPage
                    hasNextPage
                }
                media(season: $season, seasonYear: $seasonYear, format: TV, sort: POPULARITY_DESC) {
                    episodes
                    siteUrl
                    bannerImage
                    title { romaji english }
                    startDate { year month day }
                    endDate { year month day }
                }
            }
        }`;

        // TODO: 6/11/2020 Update default value to current season.
        let season = (args[0] && /fall|spring|winter|summer/.test(args[0].toLowerCase())) ? args[0].toUpperCase() : "SPRING";
        let year = args[1] ? args[1] : 2020;

        var variables = {
            season: season,
            seasonYear: year,
        };

        utils.queryAnilist(query, variables)
            .then(data => {
                console.log(JSON.stringify(data, null, 3));
                const seasonalAnime = data.data.Page.media.slice(0, 11);
                const seasonalArray = seasonalAnime.flatMap(anime => `[__${anime.title.romaji}__](${anime.siteUrl})\n**Episodes**: ${anime.episodes} | **Start Date**: ${anime.startDate.month}/${anime.startDate.day}/${anime.startDate.year}\n`);
                const seasonName = utils.capitalizeFirstLetter(variables.season)

                // TODO: 6/11/2020 Update title style.
                const embed = new Discord.MessageEmbed()
                    .setTitle(`${seasonName} ${variables.seasonYear}`)
                    .setURL(`https://anichart.net/${seasonName}-${variables.seasonYear}`)
                    .setImage(seasonalAnime[Math.floor(Math.random() * seasonalAnime.length)].bannerImage)
                    .setDescription(seasonalArray.join("\n"));

                message.channel.send(embed);
            }).catch(error => console.error(error));
    },
};