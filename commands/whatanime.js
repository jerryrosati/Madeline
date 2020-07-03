/**
 * whatanime command. Used to search search Trace.moe for an anime using a picture.
 * 
 * Usage: !whatanime (with image attached to discord message)
 */

const utils = require('./../utils.js');
const fetch = require("node-fetch");

module.exports = {
    name: 'whatanime',
    description: 'Check what anime with a gif or image.',
    args: false,

    execute(message, args) {
        // Exit if message doesn't have any attachments.
        if (!message.attachments.array().length) {
            message.reply(`Couldn't search :( Need an image attachment.`)
            return;
        }

        const attachedImageUrl = message.attachments.first().url;
        console.log(attachedImageUrl);

        // Exit if attachment is a gif.
        if (attachedImageUrl.endsWith(".gif")) {
            message.reply("Right now I only handle still images :(");
            return;
        }

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

        let traceMoeUrl = `https://trace.moe/api/search?url=${attachedImageUrl}`,
            traceMoeOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            }

        fetch(traceMoeUrl, traceMoeOptions)
            .then(response => response.json())
            .then(json => {
                let animeTitle = json.docs[0].title_english;
                message.reply(`Anime is: ${animeTitle} (${json.docs[0].similarity * 100}% confidence)`);

                // Anilist query variables
                let variables = {
                    search: animeTitle,
                    page: 1,
                    perPage: 3
                };
                
                // Anilist query url
                let url = 'https://graphql.anilist.co',
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
                return fetch(url, options);
            }).then(response => response.json()
                .then(json => response.ok ? json : Promise.reject(json)))
            .then(json => {
                console.log(JSON.stringify(json, null, 3));
                const series = json.data.Page.media[0];
                utils.sendAnimeSeriesEmbed(series, message);    
            }).catch(error => {
                console.error(error);
                message.reply("Failed to get anime :(");
            })
    },
};