/**
 * whatanime command. Used to search search Trace.moe for an anime using a picture.
 *
 * Usage: !whatanime (with image attached to discord message)
 */
const utils = require('../../utils/utils.js')
const MediaQueries = require('../../utils/MediaQueries.js')
const fetch = require('node-fetch')
const { Command } = require('discord.js-commando')

module.exports = class WhatAnimeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'whatanime',
            group: 'media',
            memberName: 'whatanime',
            description: 'Searches trace.moe for a picture to figure out what anime it is, and then searches retrieves info on that anime.',
        })
    }

    async run(message) {
        // Exit if message doesn't have any attachments.
        if (!message.attachments.array().length) {
            message.reply('Couldn\'t search :( Need an image attachment.')
            return
        }

        const attachedImageUrl = message.attachments.first().url
        console.log(attachedImageUrl)

        // Exit if attachment is a gif.
        if (attachedImageUrl.endsWith('.gif')) {
            message.reply('Right now I only handle still images :(')
            return
        }

        const traceMoeUrl = `https://trace.moe/api/search?url=${attachedImageUrl}`
        const traceMoeOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        }

        fetch(traceMoeUrl, traceMoeOptions)
            .then(response => response.json())
            .then(async json => {
                const animeTitle = json.docs[0].title_english

                // Round to 2 decimal places.
                const confidence = (json.docs[0].similarity * 100).toFixed(2)

                message.reply(`Anime is: **${animeTitle}** (${confidence}% confidence)`)

                // Anilist query variables
                const variables = {
                    search: animeTitle,
                    page: 1,
                    perPage: 3
                }

                // Search anilist for the anime.
                return MediaQueries.performAnimeQuery(variables)
            }).then(response => response.json().then(json => response.ok ? json : Promise.reject(json)))
            .then(json => {
                console.log(JSON.stringify(json, null, 3))
                const series = json.data.Page.media[0]
                message.embed(utils.generateAnimeSeriesEmbed(series))
            }).catch(error => {
                console.error(error)
                message.reply('Failed to get anime :(')
            })
    }
}
