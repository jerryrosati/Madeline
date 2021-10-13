/**
 * Searches Anilist for a staff member.
 *
 * Usage: !staff NAME
 * Example: !staff Rie Takahashi
 */
const Discord = require('discord.js')
const { Command } = require('discord.js-commando')
const MediaQueries = require('../../utils/MediaQueries.js')

module.exports = class StaffCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'staff',
            group: 'media',
            memberName: 'staff',
            description: 'Searches anilist for a staff person and displays information about them.',
            args: [
                {
                    key: 'name',
                    prompt: 'What name do you want to search for?',
                    type: 'string'
                }
            ]
        })
    }

    async run(message, { name }) {
        const variables = {
            name: name
        }

        // Query anilist with the name of the staff.
        const response = await MediaQueries.performStaffQuery(variables)
        const json = await response.json()
        console.log(JSON.stringify(json, null, 3))

        // If any staff members were retrieved, generate an embed with the anime information.
        const staff = json.data.Staff
        if (!staff || !staff.length) {
            message.reply('Couldn\'t find any staff members with that name :(')
            return
        }

        let desc = staff.description
        const characters = staff.characters.edges

        const embed = new Discord.MessageEmbed()
            .setTitle(`${staff.name.full} ( ${staff.name.native} )`)
            .setURL(staff.siteUrl)
            .setThumbnail(staff.image.large)

        // Limit the description to 2048 characters if there's a description.
        if (desc) {
            if (desc.length > 2048) {
                desc = desc.slice(0, 2045) + '...'
            }
            embed.setDescription(desc.replace(/(<([^>]+)>)/g, ''))
        }

        // If the staff has played any character roles, add those to the embed.
        if (characters.length) {
            const roles = characters.slice(0, 5)
                .flatMap(edge => `[${edge.node.name.full}](${edge.node.siteUrl}) | [${edge.node.media.nodes[0].title.romaji}](${edge.node.media.nodes[0].siteUrl})`)
                .join('\n')

            embed.addFields(
                { name: 'Roles', value: roles, inline: true }
            )
        }

        return message.embed(embed)
    }
}
