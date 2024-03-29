const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const db = require("./db");
const poll = require("./commands/utility/poll");

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    console.log(`Running command ${command.data.name}`);
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  try {
    const pollData = await db.findDocuments("polls", { active: true });
    if (!pollData.length) {
      return await interaction.reply({
        content: "No active poll found.",
        ephemeral: true,
      });
    }

    const userId = interaction.user.id;
    const hasVoted = pollData[0].voted.some((vote) => vote.id === userId);
    if (hasVoted) {
      return await interaction.reply({
        content: "You have already voted in this poll.",
        ephemeral: true,
      });
    }

    if (interaction.customId === "yes") {
      // Update poll data for "Yes" vote
      pollData[0].voted.push({
        username: interaction.user.username,
        id: interaction.user.id,
        vote: "Yes",
      });
      pollData[0].results.Yes++; // Increment "Yes" count
    } else if (interaction.customId === "no") {
      // Update poll data for "No" vote
      pollData[0].voted.push({
        username: interaction.user.username,
        id: interaction.user.id,
        vote: "No",
      });
      pollData[0].results.No++; // Increment "No" count
    }

    // Update the poll document in the database
    await db.updateDocument("polls", { active: true }, pollData[0]);

    await interaction.reply({
      content: `You have voted ${
        interaction.customId === "yes" ? "yes" : "no"
      }`,
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error handling button interaction:", error);
    await interaction.reply({
      content: "An error occurred while processing your vote.",
      ephemeral: true,
    });
  }
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
