/**
 * whatanime command. Used to search search Trace.moe for an anime using a picture.
 *
 * Usage: !whatanime (with image attached to discord message)
 */
const utils = require('./../utils.js')
const fetch = require('node-fetch')

module.exports = {
    name: 'whatanime',
    description: 'Check what anime with a gif or image.',
    usage: '(gif needs to be attached)',
    args: false,

    execute(message, args) {
        // Exit if message doesn't have any attachments.
        if (!message.attachments.array().length) {
            message.reply('Couldn\'t search :( Need an image attachment.')
            return
        }

        const attachedImageUrl = message.attachments.first().url
        console.log(attachedImageUrl)

        // Exit if attachment is a gif.
        if (attachedImageUrl.endsWith('.gif')) {
            message.reply('Right now I only handle still images :(')
            return
        }

        // Anilist query
        const query = `
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
        `

        const traceMoeUrl = `https://trace.moe/api/search?url=${attachedImageUrl}`
        const traceMoeOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        }

        fetch(traceMoeUrl, traceMoeOptions)
            .then(response => response.json())
            .then(json => {
                const animeTitle = json.docs[0].title_english

                // Round to 2 decimal places.
                const confidence = (json.docs[0].similarity * 100).toFixed(2)

                message.reply(`Anime is: ${animeTitle} (${confidence}% confidence)`)

                // Anilist query variables
                const variables = {
                    search: animeTitle,
                    page: 1,
                    perPage: 3
                }

                // Anilist query url
                const url = 'https://graphql.anilist.co'
                const options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify({
                        query: query,
                        variables: variables
                    })
                }
                return fetch(url, options)
            }).then(response => response.json()
                .then(json => response.ok ? json : Promise.reject(json)))
            .then(json => {
                console.log(JSON.stringify(json, null, 3))
                const series = json.data.Page.media[0]
                utils.sendAnimeSeriesEmbed(series, message)
            }).catch(error => {
                console.error(error)
                message.reply('Failed to get anime :(')
            })
    }
}
