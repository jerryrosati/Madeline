/**
 * Searches Anithemes.moe for an anime opening or ending song and sends it to the channel.
 *
 * Usage: !theme title [-t OP|ED[number]]
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
        let type = 'OP'
        let themeNum = 1

        // Parse the arguments to look at whether an OP or ED is being requested, and the number of the OP/ED.
        // Users can enter the OP or ED option in the format OPn or EDn where n is an integer.
        if (typeFlagIndex !== -1) {
            const matches = args[typeFlagIndex + 1].toLowerCase().match(/(op|ed)([\d]*)/)
            if (typeFlagIndex < args.length - 1 && matches) {
                type = matches[1]
                if (matches.length > 2 && matches[2]) {
                    themeNum = Number(matches[2])
                }
                args.splice(typeFlagIndex, 2)
            } else {
                args.splice(typeFlagIndex, 1)
            }
        }

        const seriesTitle = args.join(' ')
        console.log(`title: ${seriesTitle}`)
        console.log(`type = ${type}, number = ${themeNum}`)

        // The query variables.
        const animeThemesUrl = `https://staging.animethemes.moe/api/search?q=${seriesTitle}&limit=1&fields[search]=anime&fields[anime]=themes`
        const queryOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        }

        // Fetch the theme from the site and send it to the channel as a reply.
        console.log(`Querying url: ${animeThemesUrl}`)
        fetch(animeThemesUrl, queryOptions)
            .then(response => response.json())
            .then(json => {
                // Filter the JSON response and look for the correct OP/ED.
                const themeList = json.search.anime[0].themes.filter(theme => theme.type === type.toUpperCase())
                const theme = themeList.length === 1 ? themeList[0] : themeList.filter(theme => theme.sequence == themeNum)[0]
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
