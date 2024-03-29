const { SlashCommandBuilder, EmbedBuilder  } = require('discord.js');

const db = require("../../db");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timer')
		.setDescription('Informs the user how long until the event occurs'),
	async execute(interaction) {
        let pollData = await db.findDocuments("polls", { active: true });
        const EMBED = new EmbedBuilder()
        .setColor("Random")
        .setTitle(pollData[0].question)
        .setDescription(`⏳ The event should start in ${formatDurationFromUnix(1720069200)}`)
        .setTimestamp()
        .setFooter({ text: 'Powered By The Brightest Candle', iconURL: 'https://cdn.discordapp.com/avatars/1001006578478104626/48fa923380f4d0a622be317b1cecaf2b.webp?size=300' });


        function formatDurationFromUnix(unixTimestamp) {
            const currentTime = Math.floor(Date.now() / 1000); // Convert current time to seconds
            const difference = unixTimestamp - currentTime;
        
            if (difference <= 0) return "Invalid input"; // Change the condition to handle future timestamps
        
            const days = Math.floor(difference / (3600 * 24));
            const hours = Math.floor((difference % (3600 * 24)) / 3600);
            const minutes = Math.floor((difference % 3600) / 60);
            const remainingSeconds = difference % 60;
        
            const parts = [];
        
            if (days > 0) {
                parts.push(days + " day" + (days > 1 ? "s" : ""));
            }
            if (hours > 0) {
                parts.push(hours + " hour" + (hours > 1 ? "s" : ""));
            }
            if (minutes > 0) {
                parts.push(minutes + " minute" + (minutes > 1 ? "s" : ""));
            }
            if (remainingSeconds > 0) {
                parts.push(remainingSeconds + " second" + (remainingSeconds > 1 ? "s" : ""));
            }
        
            if (parts.length === 0) {
                return "0 seconds";
            }
        
            return parts.join(", ");
        }
        

		await interaction.reply({ embeds: [EMBED] });
	},
};