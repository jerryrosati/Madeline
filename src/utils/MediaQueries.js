/**
 * Contains queries used in media commands.
 */
const fetch = require('node-fetch')
const constants = require('../constants.js')

module.exports = class MediaQueries {
    static async performAnimeQuery(variables) {
        return this.performAnilistQuery(constants.ANILIST_ANIME_QUERY, variables)
    }

    static async performMangaQuery(variables) {
        return this.performAnilistQuery(constants.ANILIST_MANGA_QUERY, variables)
    }

    static async performStaffQuery(variables) {
        return this.performAnilistQuery(constants.ANILIST_STAFF_QUERY, variables)
    }

    static async performAnilistQuery(query, variables) {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({ query, variables })
        }

        return fetch(constants.ANILIST_ENDPOINT, options)
    }
}
