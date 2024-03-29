const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");

const db = require("../../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vote")
    .setDescription("participate in the active vote"),
  async execute(interaction) {
    let pollData = await db.findDocuments("polls", { active: true });
    const userId = interaction.user.id;
    const hasVoted = pollData[0].voted.some((vote) => vote.id === userId);
    if (hasVoted) {
      return await interaction.reply({
        content: "You have already voted in this poll.",
        ephemeral: true,
      });
    }
    const EMBED = new EmbedBuilder()
      .setColor("Random")
      .setTitle(pollData[0].question)
      .setTimestamp()
      .setFooter({
        text: "Powered By The Brightest Candle",
        iconURL:
          "https://cdn.discordapp.com/avatars/1001006578478104626/48fa923380f4d0a622be317b1cecaf2b.webp?size=300",
      });

    const YES = new ButtonBuilder()
      .setCustomId("yes")
      .setLabel("YES")
      .setStyle(ButtonStyle.Success);

    const NO = new ButtonBuilder()
      .setCustomId("no")
      .setLabel("NO")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(YES, NO);

    let msg = await interaction.member.send({
      embeds: [EMBED],
      components: [row],
    });
    setTimeout(() => {
      msg.delete();
    }, 10000);
    await interaction.reply({
      content: `Please check your DMs`,
      ephemeral: true,
    });
  },
};
