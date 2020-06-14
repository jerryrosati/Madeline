/**
 * Anime command. Used to search anilist for an anime.
 * 
 * Usage: !anime anime_title (can be partial)
 * Example: !anime kaguya
 */
const utils = require('./../utils.js');

module.exports = {
    name: 'anime',
    description: 'Search for anime',
    usage: "anime_title (can be partial)",
    args: true,
    argsOptional: false,

    execute(message, args) {
        // Anilist query
        var query = `
        query ($id: Int, $page: Int, $perPage: Int, $search: String) {
            Page (page: $page, perPage: $perPage) {
                pageInfo {
                    total
                    currentPage
                    lastPage
                    hasNextPage
                    perPage
                }
                media (id: $id, search: $search, type: ANIME) {
                    id
                    title {
                        romaji
                    }
                    coverImage {
                        extraLarge
                        color
                    }
                    bannerImage
                    description(asHtml: false)
                    episodes
                    status
                    genres
                    season
                    seasonYear
                    studios(isMain: true) {
                        nodes {
                            name
                        }
                    }
                }
            }
        }
        `;

        // Anilist query variables
        var variables = {
            search: args.join(" "),
            page: 1,
            perPage: 3
        };
        
        // Anilist query url
        var url = 'https://graphql.anilist.co',
            options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    variables: variables
                })
            };
        
        // Fetch the anime information and send an embed to the channel
        fetch(url, options)
            .then(response => response.json()
                .then(json => response.ok ? json : Promise.reject(json)))
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
