const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Query = require('../data/query');
const { QueryTypes } = require('../data/query-type');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staff')
        .setDescription('Search anilist for a member of staff')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the person to search for')
                .setRequired(true)),

    async execute(interaction) {
        const name = interaction.options.getString('name');
        const variables = {
            name: name,
        };

        // Query anilist with the name of the staff.
        const query = new Query(QueryTypes.Staff, variables);
        const response = await query.performQuery();
        const json = await response.json();
        console.log(JSON.stringify(json, null, 3));

        // If any staff members were retrieved, generate an embed with the anime information.
        const staff = json.data.Staff;
        if (!staff) {
            interaction.reply('Couldn\'t find any staff members with that name :(');
            return;
        }

        let desc = staff.description;
        const characters = staff.characters.edges;

        const embed = new MessageEmbed()
            .setTitle(`${staff.name.full} ( ${staff.name.native} )`)
            .setURL(staff.siteUrl)
            .setThumbnail(staff.image.large);

        // Limit the description to 2048 characters if there's a description.
        if (desc) {
            if (desc.length > 2048) {
                desc = desc.slice(0, 2045) + '...';
            }
            embed.setDescription(desc.replace(/(<([^>]+)>)/g, ''));
        }

        // If the staff has played any character roles, add those to the embed.
        if (characters.length) {
            const roles = characters.slice(0, 5)
                .flatMap(edge => `[${edge.node.name.full}](${edge.node.siteUrl}) | [${edge.node.media.nodes[0].title.romaji}](${edge.node.media.nodes[0].siteUrl})`)
                .join('\n');

            embed.addField('Roles', roles, true);
        }

        // Send the embed to the channel.
        await interaction.reply({ embeds: [embed] });
    },
};
