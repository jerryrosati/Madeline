/**
 * Searches Anilist for a manga title.
 *
 * Usage: !manga TITLE
 */

const utils = require('./../../utils.js')
const MediaQueries = require('./../../MediaQueries.js')
const { Command } = require('discord.js-commando')

module.exports = class MangaCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'manga',
            group: 'media',
            memberName: 'manga',
            description: 'Searches anilist for a manga series and displays information about the series.',
            args: [
                {
                    key: 'title',
                    prompt: 'What manga series do you want to search for?',
                    type: 'string'
                }
            ]
        })
    }

    async run(message, { title }) {
        // Anilist query variables
        const variables = {
            search: title,
            page: 1,
            perPage: 3
        }

        // Query anilist with the name of the manga.
        const response = await MediaQueries.performMangaQuery(variables)
        const json = await response.json()
        console.log(JSON.stringify(json, null, 3))

        // Generate an embed with the anime information.
        const series = json.data.Page.media[0]
        const embed = utils.generateMangaSeriesEmbed(series)
        return message.embed(embed)
    }
}
