/**
 * Used to search anilist for an anime.
 *
 * Usage: !anime anime_title (can be partial)
 * Example: !anime kaguya
 */

const utils = require('../../utils/utils.js')
const Query = require('../../data/query.js')
const { Command } = require('discord.js-commando')
const { QueryTypes } = require('../../data/query-type')

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
        const query = new Query(QueryTypes.Anime, variables)
        const response = await query.performQuery()
        const json = await response.json()
        console.log(JSON.stringify(json, null, 3))

        // Generate an embed with the anime information, if any series were retrieved.
        if (!json.data.Page.media || !json.data.Page.media.length) {
            message.reply('Couldn\'t find any anime with that name :(')
            return
        }

        const series = json.data.Page.media[0]
        const embed = utils.generateAnimeSeriesEmbed(series)
        return message.embed(embed)
    }
}
