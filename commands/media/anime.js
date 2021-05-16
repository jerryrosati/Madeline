/**
 * Used to search anilist for an anime.
 *
 * Usage: !anime anime_title (can be partial)
 * Example: !anime kaguya
 */

const utils = require('./../../utils.js')
const { ANIME_QUERY } = require('./../../constants.js')
const { Command } = require('discord.js-commando')

module.exports = class AnimeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'anime',
            group: 'media',
            memberName: 'anime',
            description: 'Searches anilist for an anime series and displays information about the series.',
            args: [
                {
                    key: 'title',
                    prompt: 'What\'s the title of the series you\'re searching for?',
                    type: 'string'
                }
            ]
        })
    }

    async run(message, { title }) {
        const variables = {
            search: title,
            page: 1,
            perPage: 3
        }

        // Query anilist with the name of the anime.
        const response = await utils.queryAnilist(ANIME_QUERY, variables)
        const json = await response.json()
        console.log(JSON.stringify(json, null, 3))

        // Generate an embed with the anime information.
        const series = json.data.Page.media[0]
        const embed = utils.generateAnimeSeriesEmbed(series)
        return message.embed(embed)
    }
}
