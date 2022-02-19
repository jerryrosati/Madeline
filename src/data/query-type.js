/*
    Types of queries that may be performed.
 */
const constants = require('../constants')

class AnilistQueryType {
    static endpoint = constants.ANILIST_ENDPOINT

    constructor(query, variables) {
        this.query = query
        this.variables = variables
    }

    get options() {
        return {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({
                query: this.query,
                variables: this.variables
            })
        }
    }
}

module.exports = {
    QueryTypes: {
        Anime: {
            options: function(variables) {
                return new AnilistQueryType(constants.ANILIST_ANIME_QUERY, variables).options
            },
            endpoint: AnilistQueryType.endpoint
        },

        Manga: {
            options: function(variables) {
                return new AnilistQueryType(constants.ANILIST_MANGA_QUERY, variables).options
            },
            endpoint: AnilistQueryType.endpoint
        },

        Staff: {
            options: function(variables) {
                return new AnilistQueryType(constants.ANILIST_STAFF_QUERY, variables).options
            },
            endpoint: AnilistQueryType.endpoint
        }
    }
}
