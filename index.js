// Load up the discord.js library
const Discord = require("discord.js");

// This is your client. Some people call it `bot`, some people call it `self`,
// some might call it `cootchie`. Either way, when you see `client.something`,
// or `bot.something`, this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix
// values.
const config = require("./config.json");
// config.token contains the bot's token config.prefix contains the message
// prefix.

client.on("ready", () => {
    // This event will run if the bot starts, and logs in, successfully.
    console.log(
        `Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`
    );
    // Example of changing the bot's playing game to something useful. `client.user`
    // is what the docs refer to as the "ClientUser".
    client
        .user
        .setActivity(`/<command>`);
});

client.on("guildCreate", guild => {
    // This event triggers when the bot joins a guild.
    console.log(
        `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`
    );
    client
        .user
        .setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
    // this event triggers when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    client
        .user
        .setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("message", async message => {
    // This event will run on every single message received, from any channel or DM.
    // It's good practice to ignore other bots. This also makes your bot ignore
    // itself and not get into a spam loop (we call that "botception").
    if (message.author.bot) 
        return;
    
    // Also good practice to ignore any message that does not start with our prefix,
    // which is set in the configuration file.
    if (message.content.indexOf(config.prefix) !== 0) 
        return;
    
    // Here we separate our "command" name, and our "arguments" for the command.
    // e.g. if we have the message "+say Is this the real life?" , we'll get the
    // following: command = say args = ["Is", "this", "the", "real", "life?"]
    const args = message
        .content
        .slice(config.prefix.length)
        .trim()
        .split(/ +/g);
    const command = args
        .shift()
        .toLowerCase();

    // Let's go with a few common example commands! Feel free to delete or change
    // those.

    if (command === "ping") {
        // Calculates ping between sending a message and editing it, giving a nice
        // round-trip latency. The second ping is an average latency between the bot and
        // the websocket server (one-way, not round-trip)
        const m = await message
            .channel
            .send("Ping?");
        m.edit(
            `Pong! Latency is **${m.createdTimestamp - message.createdTimestamp}ms**.`
        );
    }

    if (command === "say") {
        // makes the bot say something and delete the message. As an example, it's open
        // to anyone to use. To get the "message" itself we join the `args` back into a
        // string with spaces:
        const sayMessage = args.join(" ");
        // Then we delete the command message (sneaky, right?). The catch just ignores
        // the error with a cute smiley thing.
        message
            .delete()
            .catch(O_o => {});
        // And we get the bot to say the thing:
        message
            .channel
            .send(sayMessage);
    }

    
    if (command === "kick") {
        // This command must be limited to mods and admins. In this example we just
        // hardcode the role names. Please read on Array.some() to understand this bit:
        // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
        if (!message.member.roles.some(r => ["Administrator", "Moderator"].includes(r.name))) 
            return message.reply("Sorry, you don't have permissions to use this!");
        
        // Let's first check if we have a member and if we can kick them!
        // message.mentions.members is a collection of people that have been mentioned,
        // as GuildMembers. We can also support getting the member by ID, which would be
        // args[0]
        let member = message
            .mentions
            .members
            .first() || message
            .guild
            .members
            .get(args[0]);
        if (!member) 
            return message.reply("Please mention a valid member of this server");
        if (!member.kickable) 
            return message.reply(
                "I cannot kick this user! Do they have a higher role? Do I have kick permission" +
                "s?"
            );
        else if (command === "") {
        message.reply('Please enter a **Valid** command!!')
    }
        // slice(1) removes the first part, which here should be the user mention or ID
        // join(' ') takes all the various parts to make it a single string.
        let reason = args
            .slice(1)
            .join(' ');
        if (!reason) 
            reason = "No reason provided";
        
        // Now, time for a swift kick in the nuts!
        await member
            .kick(reason)
            .catch(
                error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`)
            );
        message.reply(
            `${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`
        );

    }
    if (message.content.startsWith(`${prefix}help`)) {
        message.reply('**Ask an owner for help**')
    }

    if (command === "ban") {
        // Most of this command is identical to kick, except that here we'll only let
        // admins do it. In the real world mods could ban too, but this is just an
        // example, right? ;)
        if (!message.member.roles.some(r => ["Administrator"].includes(r.name))) 
            return message.reply("Sorry, you don't have permissions to use this!");
        
        let member = message
            .mentions
            .members
            .first();
        if (!member) 
            return message.reply("Please mention a valid member of this server");
        if (!member.bannable) 
            return message.reply(
                "I cannot ban this user! Do they have a higher role? Do I have ban permissions?"
            );
        
        let reason = args
            .slice(1)
            .join(' ');
        if (!reason) 
            reason = "No reason provided";
        
        await member
            .ban(reason)
            .catch(
                error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`)
            );
        message.reply(
            `${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`
        );
    }

    if (command === "purge") {
        // This command removes all messages from all users in the channel, up to 100.
        // get the delete count, as an actual number.
        const deleteCount = parseInt(args[0], 10);

        // Ooooh nice, combined conditions. <3
        if (!deleteCount || deleteCount < 2 || deleteCount > 100) 
            return message.reply(
                "Please provide a number between 2 and 100 for the number of messages to delete"
            );
        
        // So we get our messages, and delete them. Simple enough, right?
        const fetched = await message
            .channel
            .fetchMessages({limit: deleteCount});
        message
            .channel
            .bulkDelete(fetched)
            .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
    }
});

const {prefix, token} = require("./config.json");
const ytdl = require("ytdl-core");

const queue = new Map();

client.once("ready", () => {
    console.log("Ready!");
});

client.once("reconnecting", () => {
    console.log("Reconnecting!");
});

client.once("disconnect", () => {
    console.log("Disconnect!");
});

client.on("message", async message => {
    if (message.author.bot) 
        return;
    if (!message.content.startsWith(prefix)) 
        return;
    
    const serverQueue = queue.get(message.guild.id);

    if (message.content.startsWith(`${prefix}play`)) {
        execute(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}skip`)) {
        skip(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${prefix}stop`)) {
        stop(message, serverQueue);
        return;
    }

});

async function execute(message, serverQueue) {
    const args = message
        .content
        .split(" ");

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) 
        return message
            .channel
            .send("You need to be in a voice channel to play music!");
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message
            .channel
            .send("I need the permissions to join and speak in your voice channel!");
    }

    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
        title: songInfo.title,
        url: songInfo.video_url
    };

    if (!serverQueue) {
        const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };

        queue.set(message.guild.id, queueContruct);

        queueContruct
            .songs
            .push(song);

        try {
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            play(message.guild, queueContruct.songs[0]);
        } catch (err) {
            console.log(err);
            queue.delete(message.guild.id);
            return message
                .channel
                .send(err);
        }
    } else {
        serverQueue
            .songs
            .push(song);
        return message
            .channel
            .send(`${song.title} has been added to the queue!`);
    }
}

function skip(message, serverQueue) {
    if (!message.member.voice.channel) 
        return message
            .channel
            .send("You have to be in a voice channel to stop the music!");
    if (!serverQueue) 
        return message
            .channel
            .send("There is no song that I could skip!");
    serverQueue
        .connection
        .dispatcher
        .end();
}

function stop(message, serverQueue) {
    if (!message.member.voice.channel) 
        return message
            .channel
            .send("You have to be in a voice channel to stop the music!");
    serverQueue.songs = [];
    serverQueue
        .connection
        .dispatcher
        .end();
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue
            .voiceChannel
            .leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue
        .connection
        .play(ytdl(song.url))
        .on("finish", () => {
            serverQueue
                .songs
                .shift();
            play(guild, serverQueue.songs[0]);
        })
        .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue
        .textChannel
        .send(`Start playing: **${song.title}**`);
}

client.login(token);