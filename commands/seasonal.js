/**
 * Staff command
 */
const Discord = require('discord.js');
const utils = require('./../utils.js');

module.exports = {
    name: 'seasonal',
    description: 'Search for seasonal anime',
    args: false,
    argsOptional: false,
    usage: "<seasonal anime to search for>",

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
                    title {
                        romaji
                        english
                    }
                    startDate {
                        year
                        month
                        day
                    }
                    endDate {
                        year
                        month
                        day
                    }
                    episodes
                    siteUrl
                }
            }
        }
        `;

        var variables = {
            //TODO: Maybe quotes.
            season: SPRING,
            seasonYear: 2020,
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

        fetch(url, options)
            .then(response => response.json().then(json => response.ok ? json : Promise.reject(json)))
            .then(data => {
                console.log(JSON.stringify(data, null, 3));
                //TODO: anime name should be changed to be clearer.
                const anime = data.data.Page.media[0];

                            
                const embed = new Discord.MessageEmbed()
                    //TODO: Trying this set out. May not work!
                    .setTitle(`${variables.season} ( ${variables.seasonYear} )`)
                    .setURL(anime.siteUrl)
                    .setDescription(anime.title.romaji);

                message.channel.send(embed);
            }).catch(error => console.error(error));
    },
};