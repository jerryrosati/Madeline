/**
 * Contains a list of constants that are used throughout the application.
 */

module.exports = {
    ANILIST_QUERY_URL: 'https://graphql.anilist.co',

    // Queries
    ANIME_QUERY: `query ($id: Int, $page: Int, $perPage: Int, $search: String) {
        Page (page: $page, perPage: $perPage) {
            pageInfo {
                total
                currentPage
                lastPage
                hasNextPage
                perPage
            }
            media (id: $id, search: $search, type: ANIME) {
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
    }`
}
