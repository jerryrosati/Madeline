module.exports = {
	name: 'ids',
    description: 'Information about the arguments provided.',
    args: false,
	execute(message, args) {
        var members = "";
        message.guild.members.forEach(member => members += `${member.user.username} : ${member.user.id}`);
        message.channel.send(members);
	},
};