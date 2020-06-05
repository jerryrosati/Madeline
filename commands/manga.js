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
              status
              genres
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
            .then(response =>
            {
                return response.json().then(json =>
                {
                    return response.ok ? json : Promise.reject(json);
                })
            })
            .then(data => 
            {
                console.log(JSON.stringify(data, null, 3));
                const series = data.data.Page.media[0];
                            
                const exampleEmbed = new Discord.MessageEmbed()
                    .setColor(series.coverImage.color)
                    .setThumbnail(series.coverImage.extraLarge)
                    .setTitle(series.title.romaji)
                    .setURL(`https://anilist.co/manga/${series.id}`)
                    .setDescription(series.description.replace(/(<([^>]+)>)/g, "")) // Remove html tags from the description.
                    .setImage(series.bannerImage)
                    .addFields(
                        {name: 'Status', value: utils.capitalizeFirstLetter(series.status), inline: true},
                        {name: 'Genres', value: series.genres, inline: true},
                    );
                message.channel.send(exampleEmbed);
            })
            .catch(error => console.error(error));
    },
};
