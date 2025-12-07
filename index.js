const { BoostGPT } = require("boostgpt")
const dotenv  = require('dotenv')
dotenv.config()
const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [
    Partials.Channel,
    Partials.Message
  ]
})

const boostgpt = new BoostGPT({
    key: process.env.BOOSTGPT_API_KEY,
    project_id: process.env.BOOSTGPT_PROJECT_ID
});

client.login(process.env.DISCORD_TOKEN);

client.once('ready', () => {
  console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {

    if (message.content && message.author) {

        let channel = message.channel? message.channel : message.author;

        if (message.author.id != process.env.DISCORD_BOT_ID) {
            startTypingIndicator(channel);
        }

        let payload = {
            bot_id: process.env.BOOSTGPT_BOT_ID,//The collection to chat
            provider_key: process.env.OPENAI_API_KEY,
            model: process.env.BOOSTGPT_BOT_MODEL, //The model to use for the chat response. Defaults to the bot model.
            message: message.content, //The chat message
            //source_ids: process.env.BOOSTGPT_BOT_SOURCE_IDS, //The training source id's you want the AI's knowledge to be limited to.
            //tags: process.env.BOOSTGPT_BOT_TAGS, //Use tags to get the segment of the training data you want the AI's knowledge to be limited to.
            //top: process.env.BOOSTGPT_BOT_TOP, //Optional. The weight of training data used to form a context. Defaults to 10. Recommended settings between : 10 - 15 give better response from the AI.
            chat_id: message.author.id != process.env.DISCORD_BOT_ID? 'discord-'+message.author.id : null
        }

        let error_message = `Hi ${message.author.username}! ${process.env.ERROR_MESSAGE}`;

        let chatbot = await boostgpt.chat(payload);

        if (chatbot.err) {
           //Handle boostgpt errors here.
            if (message.author.id != process.env.DISCORD_BOT_ID) {
                message.author.send(error_message).catch(error => {
                    message.channel.send(error_message)
                }) 
            }
        }else{
            if (chatbot.response.chat) {
                if (message.mentions.has(client.user)) {
                    message.reply(chatbot.response.chat.reply);
                }else{
                    if (message.author.id != process.env.DISCORD_BOT_ID) {
                        message.author.send(chatbot.response.chat.reply).catch(error => {
                            message.channel.send(error_message)
                        }) 
                    }
                }
            }
        }
    }

});


const startTypingIndicator = (channel) => {
  //Start typing indicator
  channel.sendTyping();
}

