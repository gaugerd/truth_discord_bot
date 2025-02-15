require('../discord_messages/createMonth')

const AWS = require('aws-sdk');
const Discord = require('discord.js')

require('dotenv').config();

AWS.config.update({
    region: "us-east-2",
    accessKeyId: process.env.db_key_id,
    secretAccessKey: process.env.db_secret_access_key,
})

module.exports = (client) => {
    client.displayMonths = async () => {

        const guild_id_list = client.guilds.cache.map(guild => guild.id)

        const docClient = new AWS.DynamoDB.DocumentClient();


        guild_id_list.forEach((guildId) => {
            var params = {
                TableName: 'truth-discord-info',
                Key: {
                    id: guildId
                }
            }

            docClient.get(params, async function(err, data) {
                if (err) {
                    console.log(err)
                } else {
                    if (data.Item === undefined) {
                        const channel_list = client.guilds.cache.get(guildId).channels.cache.map(channel => channel.id)
                        let channel_id = channel_list[0]
                        let channel = client.channels.cache.get(channel_id)
                        channel.send("You missed out on the automatic national month display! Use /setchannel to designated a channel for those messages!")
                        
                    } else {
                        let channel_id = data.Item.channelId
                        let channel = client.channels.cache.get(channel_id)

                        let embed = await client.createMonth()
                        channel.send({embeds: [embed]})
                    }
                }
            })
        });
    }
}