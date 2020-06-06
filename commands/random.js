const Discord = require('discord.js');
const utils = require('./../utils.js');

module.exports = {
    name: 'random',
    description: 'Get a random anime suggestion',
    args: false,

    execute(message, args) {
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
                const series = data.data.Media;
                            
                const exampleEmbed = new Discord.MessageEmbed()
                    .setColor(series.coverImage.color)
                    .setThumbnail(series.coverImage.extraLarge)
                    .setTitle(series.title.romaji)
                    .setURL(`https://anilist.co/anime/${series.id}`)
                    .setDescription(series.description.replace(/(<([^>]+)>)/g, "")) // Remove html tags from the description.
                    .setImage(series.bannerImage)
                    .addFields(
                        {name: 'Episodes', value: series.episodes, inline: true},
                        {name: 'Status', value: utils.capitalizeFirstLetter(series.status), inline: true},
                        {name: 'Season', value: `${utils.capitalizeFirstLetter(series.season)} ${series.seasonYear}`, inline: true},
                        {name: 'Genres', value: series.genres, inline: true},
                    );
                message.channel.send(exampleEmbed);
            }).catch(error => {
                console.error(error);
                message.channel.send("Failed to get anime :(");
            });
    },
};
