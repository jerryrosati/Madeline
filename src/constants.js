/**
 * Contains a list of constants that are used throughout the application.
 */

module.exports = {
    // Endpoints
    ANILIST_ENDPOINT: 'https://graphql.anilist.co',

    // Anilist Query Strings
    ANILIST_ANIME_QUERY: `query ($id: Int, $page: Int, $perPage: Int, $search: String) {
        Page (page: $page, perPage: $perPage) {
            pageInfo {
                total
                currentPage
                lastPage
                hasNextPage
                perPage
            }
            media (id: $id, search: $search, type: ANIME, sort: SEARCH_MATCH) {
                id
                bannerImage
                description(asHtml: false)
                episodes
                status
                genres
                season
                seasonYear
                title { romaji }
                coverImage { extraLarge color }
                studios(isMain: true) {
                    nodes { name }
                }
            }
        }
    }`,

    ANILIST_MANGA_QUERY: `query ($id: Int, $page: Int, $perPage: Int, $search: String) {
        Page (page: $page, perPage: $perPage) {
            pageInfo {
                total
                currentPage
                lastPage
                hasNextPage
                perPage
            }
            media (id: $id, search: $search, type: MANGA, sort: SEARCH_MATCH) {
                id
                bannerImage
                description(asHtml: false)
                chapters
                volumes
                status
                siteUrl
                genres
                title { romaji }
                coverImage { extraLarge color }
                staff {
                    edges {
                        role
                        node {
                            name { full }
                            siteUrl
                        }
                    }
                }
            }
        }
    }`,

    ANILIST_STAFF_QUERY: `query ($name: String) {
        Staff(search:$name) {
            siteUrl
            description
            image { large }
            name { full native }
            characters(sort: FAVOURITES_DESC) {
                edges {
                    id
                    node {
                        id
                        siteUrl
                        name { full }
                        media(sort: POPULARITY_DESC) {
                            nodes {
                                title { romaji }
                                siteUrl
                            }
                        }
                    }
                }
            }
        }
    }`
}
