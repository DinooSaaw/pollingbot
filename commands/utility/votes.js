const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

const db = require("../../db");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('votes')
		.setDescription('displays the amount of votes'),
	async execute(interaction) {
		let pollData = await db.findDocuments("polls", { active: true });
        let votes = pollData[0].voted.length;
        await interaction.reply({content: `${votes}/${interaction.guild.memberCount} have voted in the active poll`, ephemeral: true});
	},
};