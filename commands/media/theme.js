/**
 * Searches Anithemes.moe for an anime opening or ending song and sends it to the channel.
 *
 * Usage: !theme type (OP | ED) title
 */
const { Command } = require('discord.js-commando')
const fetch = require('node-fetch')

module.exports = class ThemeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'theme',
            group: 'media',
            memberName: 'theme',
            description: 'Search for an anime theme (op/ed).',
            args: [
                {
                    key: 'type',
                    prompt: 'Do you want to search for an OP or an ED?',
                    type: 'string',
                    oneOf: ['OP', 'ED', 'op', 'ed', 'Op', 'Ed', 'oP', 'eD']
                },
                {
                    key: 'number',
                    prompt: 'What number theme do you want to search for in the series? (1, 2, 3 ...)',
                    type: 'string'
                },
                {
                    key: 'title',
                    prompt: 'What title do you want to search for?',
                    type: 'string'
                }
            ]
        })
    }

    async run(message, { type, number, title }) {
        const seriesTitle = title
        console.log(`title: ${seriesTitle}`)
        console.log(`type = ${type}, number = ${number}`)

        // The query variables.
        const animeThemesUrl = `https://staging.animethemes.moe/api/search?q=${title}&fields[search]=anime&include=themes.entries.videos&limit=1`
        const queryOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        }

        console.log(`query url = ${animeThemesUrl}`)

        fetch(animeThemesUrl, queryOptions)
            .then(response => response.json())
            .then(json => {
                // Filter the JSON response and look for the correct OP/ED.
                const themeList = json.search.anime[0].themes.filter(theme => theme.type === type.toUpperCase())
                const theme = themeList.length === 1 ? themeList[0] : themeList.filter(theme => theme.sequence == number)[0]
                console.log(JSON.stringify(theme, null, 3))

                // Get the filename of the theme video file and send the link to the channel.
                const baseName = theme.entries[0].videos[0].basename
                message.reply(`https://animethemes.moe/video/${baseName}`)
            }).catch(error => {
                console.error(error)
                message.reply('Failed to get theme')
            })
    }
}
