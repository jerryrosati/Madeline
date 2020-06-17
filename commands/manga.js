const Discord = require('discord.js');
const utils = require('./../utils.js');

module.exports = {
    name: 'manga',
    description: 'Search for manga',
    args: true,

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
                media (id: $id, search: $search, type: MANGA) {
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
                    chapters
                    volumes
                    status
                    siteUrl
                    genres
                    staff {
                        edges {
                            role
                            node {
                                name {
                                    full
                                }
                                siteUrl
                            }
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
        
        fetch(url, options)
            .then(response => response.json().then(json => response.ok ? json : Promise.reject(json)))
            .then(json => {
                console.log(JSON.stringify(json, null, 3));
                const series = json.data.Page.media[0];
                            
                const embed = new Discord.MessageEmbed()
                    .setColor(series.coverImage.color)
                    .setThumbnail(series.coverImage.extraLarge)
                    .setTitle(series.title.romaji)
                    .setURL(series.siteUrl)
                    .setDescription(series.description.replace(/(<([^>]+)>)/g, "")) // Remove html tags from the description.
                    .setImage(series.bannerImage)
                    .addFields(
                        {name: 'Genres', value: series.genres, inline: true},
                        {name: 'Status', value: utils.capitalizeFirstLetter(series.status), inline: true},
                    );

                    if (series.status.toLowerCase() == 'finished') {
                        embed.addFields(
                            {name: 'Chapters', value: series.chapters, inline: true},
                            {name: 'Volumes', value: series.volumes, inline: true}
                        );
                    }

                    series.staff.edges.forEach(staff => {
                        embed.addField(staff.role, `[${staff.node.name.full}](${staff.node.siteUrl})`, true);
                    });
                message.channel.send(embed);
            }).catch(error => console.error(error));
    },
};
