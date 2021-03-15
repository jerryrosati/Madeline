/**
 * Gets the anime that's airing during a specific season.
 *
 * Usage: !season [SEASON YEAR] (case insensitive).
 * Examples:
 *    !season (gets anime from current season)
 *    !season winter 2020 (gets anime from the winter 2020 season)
 */
const Discord = require('discord.js')
const utils = require('../utils.js')

module.exports = {
    name: 'season',
    description: 'Search for seasonal anime',
    args: true,
    argsOptional: true,
    usage: '[season] [year]',

    execute(message, args) {
        // Anilist query
        const query = `
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
                    episodes
                    siteUrl
                    bannerImage
                    title { romaji english }
                    startDate { year month day }
                    endDate { year month day }
                }
            }
        }`

        let season
        let year

        // If the user doesn't provide arguments, use the current season.
        if (!args.length) {
            const currentSeason = getCurrentSeason()
            season = currentSeason.season
            year = currentSeason.year
        } else if (args.length === 2) {
            if (/fall|spring|winter|summer/.test(args[0].toLowerCase())) {
                season = args[0].toUpperCase()
            } else {
                message.reply('Invalid season. Season needs to be spring, summer, fall, or winter.')
            }

            year = args[1]
        } else {
            message.reply('Invalid arguments. Usage is: `!season` (for current season), or `!season SEASON (e.g. spring) YEAR (e.g. 2021)` for a specific season.')
            return
        }

        const variables = {
            season: season,
            seasonYear: year
        }

        utils.queryAnilist(query, variables)
            .then(json => {
                console.log(JSON.stringify(json, null, 3))
                const seasonalAnime = json.data.Page.media.slice(0, 11)
                const seasonalArray = seasonalAnime.flatMap(anime => generateSeriesString(anime))
                const seasonName = utils.capitalizeFirstLetter(variables.season)
                const embed = new Discord.MessageEmbed()
                    .setTitle(`${seasonName} ${variables.seasonYear}`)
                    .setURL(`https://anichart.net/${seasonName}-${variables.seasonYear}`)
                    .setDescription(seasonalArray.join('\n'))

                message.channel.send(embed)
            })
            .catch(error => {
                message.reply("Couldn't retrieve anime for that season")
                console.error(error)
            })
    }
}

/**
 * Gets the current season and year.
 *
 * @return {Object} An object containing the season string and the year.
 */
function getCurrentSeason() {
    const date = new Date()
    const month = date.getMonth() + 1
    let season

    if ([1, 2, 3].includes(month)) {
        season = 'WINTER'
    } else if ([4, 5, 6].includes(month)) {
        season = 'SPRING'
    } else if ([7, 8, 9].includes(month)) {
        season = 'SUMMER'
    } else {
        season = 'FALL'
    }

    return {
        season: season,
        year: date.getFullYear()
    }
}

/**
 * Generates a string to add to the discord embed for an anime series.
 *
 * @param {*} anime The anime information extracted from the JSON.
 * @return {String} The line as a string.
 */
function generateSeriesString(anime) {
    let baseString = `[__${anime.title.romaji}__](${anime.siteUrl})\n`

    // Add episode count if it exists.
    baseString += `**Episodes**: ${anime.episodes == null ? 'Unavailable' : anime.episodes}`

    // Add the date.
    baseString += generateDateString(anime)
    return baseString + '\n'
}

/**
 * Generates a date string from the anime start date.
 *
 * @param {*} anime The anime information extracted from the JSON.
 * @return {String} The line as a string.
 */
function generateDateString(anime) {
    let dateString = ''

    const month = anime.startDate.month
    const day = anime.startDate.day
    const year = anime.startDate.year

    // We only use the Date object to get the month, so don't add the day to the date.
    const startDate = new Date(year, month - 1)

    if ([month, day, year].some(part => part != null)) {
        dateString += '\n**Start Date:** '

        if (month != null) {
            const options = { month: 'long' }
            const longMonth = Intl.DateTimeFormat('en-US', options).format(startDate)
            dateString += `${longMonth} `
        }

        if (day != null) {
            dateString += `${day} `
        }

        if (year != null) {
            dateString += `${year}`
        }
    }

    return dateString
}
