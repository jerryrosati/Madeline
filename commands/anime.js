/**
 * Used to search anilist for an anime.
 * 
 * Usage: !anime anime_title (can be partial)
 * Example: !anime kaguya
 */

const utils = require('./../utils.js');
const {ANIME_QUERY} = require('./../constants.js');

module.exports = {
    name: 'anime',
    description: 'Search for anime',
    usage: "anime_title (can be partial)",
    args: true,
    argsOptional: false,

    execute(message, args) {
        // Anilist query variables
        var variables = {
            search: args.join(" "),
            page: 1,
            perPage: 3
        };
        
        // Fetch the anime information and send an embed to the channel
        utils.queryAnilist(ANIME_QUERY, variables)
            .then(data => {
                console.log(JSON.stringify(data, null, 3));
                const series = data.data.Page.media[0];
                utils.sendAnimeSeriesEmbed(series, message);    
            }).catch(error => {
                console.error(error);
                message.reply("Failed to get anime :(");
            });
    },
};
