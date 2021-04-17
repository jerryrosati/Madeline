const { MessageAttachment } = require('discord.js')
const fetch = require('node-fetch')

module.exports = {
    name: 'theme',
    description: 'Search for anime theme',
    usage: 'anime_title',
    args: true,
    argsOptional: false,

    execute(message, args) {
        const seriesTitle = args.join(' ')
        const animeThemesUrl = `https://staging.animethemes.moe/api/search?q=${seriesTitle}&limit=1&fields[search]=anime&fields[anime]=themes`
        const queryOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        }

        fetch(animeThemesUrl, queryOptions)
            .then(response => response.json())
            .then(json => {
                console.log(json)
                const themeList = json.search.anime[0].themes
                let baseName = themeList[0].entries[0].videos[0].basename
                message.reply(`https://animethemes.moe/video/${baseName}`)
            }).catch(error => {
                console.error(error)
                message.reply('Failed to get theme')
            })
    }
}
