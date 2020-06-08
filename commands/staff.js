const Discord = require('discord.js');
const utils = require('./../utils.js');

module.exports = {
    name: 'staff',
    description: 'Search for staff',
    args: true,
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
                characters(sort: SEARCH_MATCH) {
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
                const staff = data.data.staff;
                            
                const exampleEmbed = new Discord.MessageEmbed()
                    .setTitle(staff.name.full)
                    .setAuthor(staff.name.native)
                    .setURL(`https://anilist.co/staff/${staff.id}`)
                    //description is the same
                    .setDescription(staff.description.replace(/(<([^>]+)>)/g, "")) // Remove html tags from the description.
                    //this might also be picture
                    .setThumbnail(staff.image.large)
                    .addFields(
                        //birthplace ?
                        //birthday ?
                        //maybe several roles 
                        {name: 'Roles', value: staff.characters.name.full, inline: true},
                        //{name: 'Social Media', value: series.//socialMedia}              
                    );
                message.channel.send(exampleEmbed);
            }).catch(error => console.error(error));
    },
};
