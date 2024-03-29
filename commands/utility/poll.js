const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const db = require("../../db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Displays the progress of the ongoing poll.'),
    async execute(interaction) {
        const { EmbedBuilder } = require('discord.js');
        let pollData = await db.findDocuments("polls", { active: true });
        // Define your poll question and options
        const pollQuestion = pollData[0].question
        const pollOptions = pollData[0].options

        let pollResults = pollData[0].results

        const totalVotes = Object.values(pollResults).reduce((a, b) => a + b, 0);
        const progressLength = totalVotes;

        let embed = new EmbedBuilder()
            .setTitle("Poll Progress")
            .setColor("Random")
            .setDescription(pollQuestion)
            .setTimestamp()
            .setFooter({ text: 'Powered By The Brightest Candle', iconURL: 'https://cdn.discordapp.com/avatars/1001006578478104626/48fa923380f4d0a622be317b1cecaf2b.webp?size=300' });

        const fields = [];
        pollOptions.forEach((option, index) => {
            const votes = pollResults[option] || 0;
            const percentage = totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);
            const progressBar = createProgressBar(percentage, votes, progressLength);
            fields.push({ name: option, value: progressBar, inline: true });
        });

        embed.addFields(fields);

        await interaction.reply({ embeds: [embed] });
    },
};

function createProgressBar(percentage, votes, progressLength) {
    const progressFilled = Math.round((votes / progressLength) * progressLength); // Adjust progress to fit progressLength
    const progressBar = '▰'.repeat(progressFilled) + '▱'.repeat(progressLength - progressFilled);
    return `[${progressBar}] ${percentage}% (${votes} votes)`;
}
