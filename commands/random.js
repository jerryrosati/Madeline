const Discord = require('discord.js');
const utils = require('./../utils.js');

module.exports = {
    name: 'random',
    description: 'Get a random anime suggestion',
    usage: "[genre genres... | anime anime_title]",
    args: true,
    argsOptional: true,

    execute(message, args) {

        // Anilist query url
        const url = 'https://graphql.anilist.co';

        if (!args.length) {

        } else if (args[0] === 'genre') {
            // Exit if the user hasn't provided a genre.
            if (args.length < 2) {
                utils.reportCommandUsageError(this,
                    message,
                    "Please provide at least one genre");
                return;
            }
            const genreList = args.slice(1).join(",");
            console.log(genreList);
            return;
        } else if (args[0] === 'anime') {
            // Exit if the user hasn't provided an anime title.
            if (args.length < 2) {
                utils.reportCommandUsageError(this,
                    message,
                    "Please provide an anime title");
                return;
            }
            const animeTitle = args.slice(1).join(" ");
            console.log(animeTitle);
            fetchBasisAnimeInfo(animeTitle, url)
                .then(data => {
                    console.log(JSON.stringify(data, null, 3));
                    const series = data.data.Page.media[0];
                    const tags = series.tags;
                    console.log(tags);
                    const tagsString = tags.map(tag => tag.name).join(",");
                    console.log(tagsString);
                    message.channel.send(`Tags for ${series.title.romaji}: ${tagsString}`);
                }).catch(error => {
                    console.error(error);
                    message.reply("Failed to get anime :(");
                });
            return;
        } else {
            // Exit if the user has provided an incorrect argument.
            utils.reportCommandUsageError(this,
                message,
                `Usage is incorrect`);
                return;
        }

        // Anilist query
        var query = `
        query ($popularity: Int) {
            Media (popularity: $popularity, type: ANIME) {
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
        `;

        // Generate a random number for the query.
        let randomNum = Math.floor(Math.random() * (4000 + 1) + 1);
        console.log(`Random Number: ${randomNum}`);

        // Anilist query variables
        var variables = {
            popularity: randomNum,
        };
        
        let options = {
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
        
        // Fetch the random anime info and send it to the channel.
        fetchInfo(url, options)
            .then(data => {
                console.log(JSON.stringify(data, null, 3));
                const series = data.data.Media;
                utils.sendAnimeSeriesEmbed(series, message);
            }).catch(error => {
                console.error(error);
                message.reply("Failed to get anime :(");
            });
    },
};

function fetchBasisAnimeInfo(animeTitle, url) {
    // Anilist query
    const basisQuery = `
        query ($page: Int, $perPage: Int, $search: String) {
            Page (page: $page, perPage: $perPage) {
                pageInfo {
                    total
                    currentPage
                    lastPage
                    hasNextPage
                    perPage
                }
                media (search: $search, type: ANIME) {
                    id
                    title {
                        romaji
                    }
                    tags {
                        name
                    }
                }
            }
        }`;

    const variables = {
        search: animeTitle,
        page: 1,
        perPage: 3
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: basisQuery,
            variables: variables
        })
    };

    return fetchInfo(url, options);    
}

/**
 * Fetches info about an anime from Anilist.
 * 
 * @param {String} url 
 * @param {*} options 
 */
function fetchInfo(url, options) {
    return fetch(url, options)
        .then(response => response.json()
            .then(json => response.ok ? json : Promise.reject(json)));
}