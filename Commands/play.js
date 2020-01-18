let ytdl = require('ytdl-core'),
    Discord = require('discord.js'),
    ytsr = require('ytsr');

exports.run = async (client, msg, args, options) => {

    let error1 = new Discord.RichEmbed()
        .setDescription("You need to be in a voice channel!")
        .setColor(16711681)
        .setTimestamp(Date.now())
        .setAuthor(`Error!`, msg.author.displayAvatarURL);

    let error2 = new Discord.RichEmbed()
        .setDescription("You need to specify a Video URL or Search String!")
        .setColor(16711681)
        .setTimestamp(Date.now())
        .setAuthor(`Error!`, msg.author.displayAvatarURL);

    let error3 = new Discord.RichEmbed()
        .setDescription(`Can't find any video with "${args[0]}" search string!`)
        .setColor(16711681)
        .setTimestamp(Date.now())
        .setAuthor(`Error!`, msg.author.displayAvatarURL);

    let error4 = new Discord.RichEmbed()
        .setDescription(`Sorry! But i can't join that voice channel!`)
        .setColor(16711681)
        .setTimestamp(Date.now())
        .setAuthor(`Error!`, msg.author.displayAvatarURL);

    if (!msg.member.voiceChannel && !msg.guild.me.voiceChannel) return msg.channel.send(error1);

    if (!msg.member.voiceChannel.joinable) return msg.channel.send(error4);

    if (!args[0]) return msg.channel.send(error2);

    let data = {
        videoData: {},
        message: msg,
        channel: msg.channel,
        voiceChannel: msg.member.voiceChannel,
        voiceConnection: {},
        dispatcher: {}
    };

    if (ytdl.validateURL(args[0])) {
        data.videoData = await ytdl.getBasicInfo(args[0]);
    } else if (ytdl.validateID(args[0])) {
        data.videoData = await ytdl.getBasicInfo(args[0]);
    } else {
        let searchResult = await ytsr(args.join(" "));
        if (!searchResult) return await msg.channel.send(error3);
        data.videoData = await ytdl.getBasicInfo(searchResult.items[0].link);
    }

    if (msg.guild.me.voiceChannel) {
        data.voiceConnection = msg.guild.me.voiceChannel.connection;
    }
    else {
        data.voiceConnection = await msg.member.voiceChannel.join();
    }

    if (!msg.guild.me.deaf) await msg.guild.me.setDeaf(true);

    let success1 = new Discord.RichEmbed()
        .setColor(16711681)
        .setTimestamp(Date.now())
        .setAuthor(`Added Music To Queue!`, msg.author.avatarURL)
        .setThumbnail(data.videoData.player_response.videoDetails.thumbnail.thumbnails[0].url)
        .addField("Music Name", data.videoData.title, true)
        .addField("Author", data.videoData.author.name, true)
        .addField("Duration", options.functions.fancyTimeFormat(data.videoData.player_response.videoDetails.lengthSeconds), true);


    if (!options.queue.get(msg.guild.id)) {
        options.queue.set(msg.guild.id, [data]);
        options.functions.playMusic(msg.guild);
    } else {
        msg.channel.send(success1);
        await options.queue.get(msg.guild.id).push(data);
    }
};

exports.config = {
    category: "music",
    powerLevel: 0
};