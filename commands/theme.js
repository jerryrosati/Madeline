/**
 * Searches Anithemes.moe for an anime opening or ending song and sends it to the channel.
 *
 * Usage: !theme title [-t OP|ED [-n number]]
 */
const fetch = require('node-fetch')

module.exports = {
    name: 'theme',
    description: 'Search for anime theme',
    usage: 'anime_title [-t OP|ED [-n number]]',
    args: true,
    argsOptional: false,

    execute(message, args) {
        const typeFlagIndex = args.indexOf('-t')
        const numberFlagIndex = args.indexOf('-n')
        let type = 'OP'
        let number = ''
        if (typeFlagIndex !== -1) {
            if (typeFlagIndex < args.length - 1 && (['op', 'ed'].includes(args[typeFlagIndex + 1].toLowerCase()))) {
                type = args[typeFlagIndex + 1]
                args.splice(typeFlagIndex, 2)
            } else {
                args.splice(typeFlagIndex, 1)
            }
        }

        if (numberFlagIndex !== -1) {
            if (numberFlagIndex < args.length - 1) {
                number = args[numberFlagIndex + 1]
                args.splice(numberFlagIndex, 2)
            } else {
                args.splice(numberFlagIndex, 1)
            }
        }

        const seriesTitle = args.join(' ')
        console.log(`title: ${seriesTitle}`)
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
                const themeList = json.search.anime[0].themes.filter(theme => theme.type === type.toUpperCase())
                const baseName = themeList[0].entries[0].videos[0].basename
                message.reply(`https://animethemes.moe/video/${baseName}`)
            }).catch(error => {
                console.error(error)
                message.reply('Failed to get theme')
            })
    }
}
