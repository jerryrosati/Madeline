/**
 * Command for fetching mangadex chapters.
 */
const fetch = require('node-fetch')
const Discord = require('discord.js')
const { URL, URLSearchParams } = require('url')
const { Command } = require('discord.js-commando')

module.exports = class MangaDexCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'mangadex',
            group: 'media',
            memberName: 'mangadex',
            description: 'Read a manga chapter on mangadex.',
            args: [
                {
                    key: 'chapterNum',
                    prompt: 'What chapter do you want to read?',
                    type: 'string'
                },
                {
                    key: 'title',
                    prompt: 'What series do you want to read?',
                    type: 'string'
                }
            ]
        })
    }

    async run(message, { chapterNum, title }) {
        const reactEmoji = ['⏮', '⏭']

        const mangaVariables = {
            title: title,
            limit: 1
        }

        const mangaEndpoint = new URL('https://api.mangadex.org/manga')
        mangaEndpoint.search = new URLSearchParams(mangaVariables).toString()

        const mangaFeedVariables = {
            chapter: chapterNum,
            manga: ''
        }

        const qualityMode = 'data'
        let chapterHash
        let imageNames
        let imageIndex = 0

        console.log(`Title = ${mangaVariables.title}`)
        console.log(`Chapter = ${mangaFeedVariables.chapter}`)

        fetch(mangaEndpoint)
            .then(response => response.json())
            .then(json => {
                console.log(JSON.stringify(json, null, 3))
                console.log(`MangaEndpoint = ${mangaEndpoint}`)
                return json.results[0].data.id
            })
            .then(mangaId => {
                const mangaFeedEndpoint = new URL(`https://api.mangadex.org/manga/${mangaId}/feed`)
                mangaVariables.manga = mangaId
                const searchParams = new URLSearchParams()
                searchParams.append('locales[]', 'en')
                searchParams.append('order[chapter]', 'asc')
                mangaFeedEndpoint.search = searchParams.toString()
                console.log(`MangaFeedEndpoint = ${mangaFeedEndpoint}`)
                return fetch(mangaFeedEndpoint)
            })
            .then(response => response.json())
            .then(json => {
                console.log(JSON.stringify(json, null, 3))
                const chapter = json.results.filter(result => result.data.attributes.chapter === mangaFeedVariables.chapter)[0]
                const chapterId = chapter.data.id
                imageNames = chapter.data.attributes.data
                chapterHash = chapter.data.attributes.hash
                const mangaAtHomeEndPoint = new URL(`https://api.mangadex.org/at-home/server/${chapterId}`)
                console.log(`M@H Endpoint = ${mangaAtHomeEndPoint}`)
                return fetch(mangaAtHomeEndPoint)
            })
            .then(response => response.json())
            .then(json => {
                console.log('MD@Home JSON')
                console.log(JSON.stringify(json, null, 3))
                const baseUrl = json.baseUrl
                let fullUrl = `${baseUrl}/${qualityMode}/${chapterHash}/${imageNames[imageIndex]}`
                console.log(fullUrl)
                const embed = new Discord.MessageEmbed()
                    .setImage(fullUrl)
                message.channel.send(embed)
                    .then(embedMessage => {
                        reactEmoji.forEach(emoji => embedMessage.react(emoji))

                        const collector = embedMessage.createReactionCollector((reaction, user) => {
                            return reactEmoji.includes(reaction.emoji.name) && (user.id === message.author.id)
                        })

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

                            if (reaction.emoji.name === reactEmoji[0] && imageIndex > 0) {
                                imageIndex -= 1
                                fullUrl = `${baseUrl}/${qualityMode}/${chapterHash}/${imageNames[imageIndex]}`
                                console.log(`Full url = ${fullUrl}`)
                                const embed = new Discord.MessageEmbed()
                                    .setImage(fullUrl)
                                reaction.users.remove(user)
                                embedMessage.edit(embed)
                            } else if (reaction.emoji.name === reactEmoji[1] && imageIndex < imageNames.length) {
                                imageIndex += 1
                                fullUrl = `${baseUrl}/${qualityMode}/${chapterHash}/${imageNames[imageIndex]}`
                                console.log(`Full url = ${fullUrl}`)
                                const embed = new Discord.MessageEmbed()
                                    .setImage(fullUrl)
                                reaction.users.remove(user)
                                embedMessage.edit(embed)
                            } else {
                                reaction.users.remove(user)
                            }
                        })
                    })
            })
            .catch(error => {
                console.error(error)
                message.reply('Error when performing query.')
            })
    }
}
