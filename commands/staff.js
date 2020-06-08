const Discord = require('discord.js');
const utils = require('./../utils.js');

module.exports = {
    name: 'staff',
    description: 'Search for staff',
    args: true,
    argsOptional: false,
    usage: "<staff to search for>",

    execute(message, args) {
        // Anilist query
        var query = `
        query ($name: String) {
            Staff(search:$name) {
                name {
                    full
                    native
                }
                siteUrl
                description
                image {
                    large
                }
                characters(sort: FAVOURITES_DESC) {
                    edges {
                        id
                        node {
                            id
                            name {
                                full
                            }
                            siteUrl
                        }
                    }
                }
            }
        }
        `;

        // Anilist query variables
        var variables = {
            name: args.join(" "),
        };
        
        // Anilist query url
        var url = 'https://graphql.anilist.co',
            options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    variables: variables
                })
            };
        
        fetch(url, options)
            .then(response => response.json().then(json => response.ok ? json : Promise.reject(json)))
            .then(data => {
                console.log(JSON.stringify(data, null, 3));
                const staff = data.data.Staff;
                const character = staff.characters.edges[0].node.name.full;
                console.log(character);

                let desc = staff.description;
                if (desc.length > 2048) {
                    desc = desc.slice(0, 2045) + "...";
                }

                let roles = staff.characters.edges.slice(0, 5) 
                    .flatMap(edge => edge.node.name.full)
                    .join("\n");
                            
                const exampleEmbed = new Discord.MessageEmbed()
                    .setTitle(`${staff.name.full} ( ${staff.name.native} )`)
                    .setURL(staff.siteUrl)
                    .setDescription(desc.replace(/(<([^>]+)>)/g, ""))
                    .setThumbnail(staff.image.large)
                    .addFields(
                        {name: 'Roles', value: roles, inline: true},          
                    );
                message.channel.send(exampleEmbed);
            }).catch(error => console.error(error));
    },
};
