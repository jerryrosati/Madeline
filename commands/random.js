/**
 * Gets a random anime suggestion based off of an anime title or genre.
 *
 * Usage: !random anime ANIME|genre GENRE...
 * Examples:
 *     !random kaguya
 *     !random shounen pirates
 */
const utils = require('./../utils.js')
const fetch = require('node-fetch')

module.exports = {
    name: 'random',
    description: 'Get a random anime suggestion',
    usage: '[genre genres... | anime anime_title]',
    args: true,
    argsOptional: true,

    execute(message, args) {
        let basisFetchPromise

        // Anilist query url
        const url = 'https://graphql.anilist.co'

        if (args[0] === 'genre') {
            // Exit if the user hasn't provided a genre.
            if (args.length < 2) {
                utils.reportCommandUsageError(this,
                    message,
                    'Please provide at least one genre')
                return
            }

            // TODO: 7/4/2020 Implement random anime based on genres.
            const genreList = args.slice(1).join(',')
            console.log(genreList)
            message.reply("Malt hasn't implemented this yet.")
            return
        } else if (args[0] === 'anime') {
            // Exit if the user hasn't provided an anime title.
            if (args.length < 2) {
                utils.reportCommandUsageError(this,
                    message,
                    'Please provide an anime title')
                return
            }
            const animeTitle = args.slice(1).join(' ')
            console.log(animeTitle)
            basisFetchPromise = fetchBasisAnimeInfo(animeTitle, url)
                .then(data => {
                    console.log(`Basis Anime: ${JSON.stringify(data, null, 3)}`)
                    const series = data.data.Page.media[0]
                    const tagsJson = series.tags
                    const tags = tagsJson
                        .filter(tag => tag.rank >= 80)
                        .flatMap(tag => tag.name)
                    console.log(tags)
                    return tags
                })
        } else {
            // Exit if the user has provided an incorrect argument.
            utils.reportCommandUsageError(this,
                message,
                'Usage is incorrect')
            return
        }

        // Anilist query
        const query = `
        query ($tags: [String], $page: Int, $perPage: Int) {
          Page (page: $page, perPage: $perPage) {
            pageInfo {
              total
              currentPage
              lastPage
              hasNextPage
              perPage
            }
            media (tag_in: $tags, type: ANIME) {
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

        // Generate a random number for the query.
        const randomNum = Math.floor(Math.random() * (4000 + 1) + 1)
        console.log(`Random Number: ${randomNum}`)

        // Fetch the random anime info and send it to the channel.
        basisFetchPromise
            .then(tags => {
                const variables = {
                    tags: tags,
                    page: 1,
                    perPage: 3
                }

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
                return fetchInfo(url, options)
            }).then(data => {
                console.log(`Result anime: ${JSON.stringify(data, null, 3)}`)
                const series = data.data.Page.media[0]
                utils.sendAnimeSeriesEmbed(series, message)
            }).catch(error => {
                console.error(error)
                message.reply('Failed to get anime :(')
            })
    }
}

/**
 * Fetches info for the anime that we're basing the random anime off of.
 *
 * @param {String} animeTitle The title of the basis anime.
 * @param {String} url The Anilist query url.
 */
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
                        rank
                    }
                }
            }
        }`

    const variables = {
        search: animeTitle,
        page: 1,
        perPage: 3
    }

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({
            query: basisQuery,
            variables: variables
        })
    }

    return fetchInfo(url, options)
}

/**
 * Fetches info about an anime from Anilist.
 *
 * @param {String} url The Anilist query url.
 * @param {*} options The query options.
 */
function fetchInfo(url, options) {
    return fetch(url, options)
        .then(response => response.json()
            .then(json => response.ok ? json : Promise.reject(json)))
}
