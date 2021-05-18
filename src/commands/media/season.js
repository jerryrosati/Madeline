/**
 * Gets the anime that's airing during a specific season.
 *
 * Usage: !season [SEASON YEAR] (case insensitive).
 * Examples:
 *    !season (gets anime from current season)
 *    !season winter 2020 (gets anime from the winter 2020 season)
 */
const Discord = require('discord.js')
const utils = require('../../utils/utils.js')
const { Command } = require('discord.js-commando')

module.exports = class SeasonCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'season',
            group: 'media',
            memberName: 'season',
            description: 'Retrieves the anime that aired for a specific season.',
            args: [
                {
                    key: 'season',
                    prompt: 'What season do you want to search for?',
                    type: 'string',
                    oneOf: ['winter', 'spring', 'summer', 'fall'],
                    default: ''
                },
                {
                    key: 'year',
                    prompt: 'What year do you want to search for?',
                    type: 'string',
                    default: ''
                }
            ]
        })
    }

    async run(message, { season, year }) {
        // If the user didn't enter any arguments, get the current season.
        if (!season && !year) {
            const currentSeason = getCurrentSeason()
            season = currentSeason.season
            year = currentSeason.year
        } else if (!year) {
            year = getCurrentSeason().year
        }

        // Anilist query
        const query = `
        query ($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {
            Page (page: $page, perPage: $perPage) {
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

        // Left and right arrow unicode.
        const reactEmoji = ['⏮', '⏭']
        let page = 1

        const variables = {
            season: season.toUpperCase(),
            seasonYear: year,
            page: page,
            perPage: 10
        }

        const seasonalInfo = await queryAndGenerateEmbed(query, variables)
        let currentPage = seasonalInfo.currentPage
        let hasNextPage = seasonalInfo.hasNextPage

        const embedMessage = await message.embed(generateSeasonEmbed(seasonalInfo))
        reactEmoji.forEach(emoji => embedMessage.react(emoji))

        const filter = (reaction, user) => {
            return reactEmoji.includes(reaction.emoji.name) && (user.id === message.author.id)
        }

        const collector = embedMessage.createReactionCollector(filter)

        collector.on('collect', async (reaction, user) => {
            if (user.partial) {
                console.log('User who reacted is partial')
                try {
                    await user.fetch()
                } catch (error) {
                    console.error('Something went wrong when fetching the user')
                }
            }

            console.log(`Collected ${reaction.emoji.name} from ${user.tag}`)

            if (reaction.emoji.name === reactEmoji[0] && currentPage > 1) {
                // Go backwards if the back arrow was pressed and we can go backwards.
                page -= 1
                variables.page = page

                const seasonalInfo = await queryAndGenerateEmbed(query, variables)
                currentPage = seasonalInfo.currentPage
                hasNextPage = seasonalInfo.hasNextPage

                const embed = generateSeasonEmbed(seasonalInfo)
                reaction.users.remove(user)
                embedMessage.edit(embed)
            } else if (reaction.emoji.name === reactEmoji[1] && hasNextPage === true) {
                // Go forward if the forward arrow was pressed and there's a next page.
                page += 1
                variables.page = page

                const seasonalInfo = await queryAndGenerateEmbed(query, variables)
                currentPage = seasonalInfo.currentPage
                hasNextPage = seasonalInfo.hasNextPage

                const embed = generateSeasonEmbed(seasonalInfo)
                reaction.users.remove(user)
                embedMessage.edit(embed)
            } else {
                // If it can't get another page (because it's at the beginning or end) then just remove the reaction.
                reaction.users.remove(user)
            }
        })
        return embedMessage
    }
}

/**
 * Queries Anilist for information about the season.
 *
 * @param {String} query The query string.
 * @param {*} variables The query variables.
 * @returns An object containing information about the seasonal anime.
 */
async function queryAndGenerateEmbed(query, variables) {
    const response = await utils.queryAnilist(query, variables)
    const json = await response.json()
    console.log(JSON.stringify(json, null, 3))

    const seasonalAnime = json.data.Page.media.slice(0, 11)
    const seasonalArray = seasonalAnime.flatMap(anime => generateSeriesString(anime))
    const seasonName = utils.capitalizeFirstLetter(variables.season)

    return {
        currentPage: json.data.Page.pageInfo.currentPage,
        lastPage: json.data.Page.pageInfo.lastPage,
        hasNextPage: json.data.Page.pageInfo.hasNextPage,
        seasonalArray: seasonalArray,
        seasonName: seasonName,
        seasonYear: variables.year
    }
}

/**
 * Generates an embed with information about the seasonal anime.
 * @param {*} seasonalInfo Information about the season.
 * @returns The embed object.
 */
function generateSeasonEmbed(seasonalInfo) {
    return new Discord.MessageEmbed()
        .setTitle(`${seasonalInfo.seasonName} ${seasonalInfo.seasonYear}`)
        .setURL(`https://anichart.net/${seasonalInfo.seasonName}-${seasonalInfo.seasonYear}`)
        .setDescription(seasonalInfo.seasonalArray.join('\n') + `\nPage: ${seasonalInfo.currentPage}/${seasonalInfo.lastPage}`)
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
