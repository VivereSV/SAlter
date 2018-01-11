// Load up the discord.js library
const Discord = require("discord.js");

//Google spreadsheet stuff
var Spreadsheet = require('edit-google-spreadsheet');

//Workaround for VLV's stupidity
var craftMap = {
    Havencraft: 0,
    Runecraft: 1,
    Shadowcraft: 2,
    Forestcraft: 3,
    Swordcraft: 4,
    Dragoncraft: 5,
    Bloodcraft: 6,
    Portalcraft: 7
};

var mappedItems = {

}

var paragons = {
    Havencraft: "204741410442706944",
    Runecraft: "261610099699744769",
    Shadowcaft: "232040363957813248",
    Forestcraft: "289789718638362625",
    Swordcraft: "100482322888933376",
    Dragoncraft: "323638452262535169",
    Bloodcraft: "206304635672068098",
    Portalcraft: "194297171829325825"
}

var secondaries = {
    Havencraft: "142898856999387136",
    Runecraft: "261678719511429120",
    Shadowcaft: "360227821999882240",
    Forestcraft: "355373307979366403",
    Swordcraft: "173427691595366402",
    Dragoncraft: "TBD",
    Bloodcraft: "176455413003190272",
    Portalcraft: "262329399901159426"
}

var titleRows = {
    Paragon: 22,
    Secondary: 51,
    Guest: 81,
    Tournament: 111
}

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

//REMEMBER TO READ FROM SALTER CACHE ON STARTUP

// Here we load the config.json file that contains our token and our prefix values. 
//const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

client.on("ready", () => {
    // This event will run if the bot starts, and logs in, successfully.
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
    // Example of changing the bot's playing game to something useful. `client.user` is what the
    // docs refer to as the "ClientUser".
    client.user.setGame(`Saltverse`);
});

client.on("guildCreate", guild => {
    // This event triggers when the bot joins a guild.
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setGame(`on ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
    // this event triggers when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    client.user.setGame(`on ${client.guilds.size} servers`);
});

function checkMap(name) {
    var mapKeys = Object.keys(mappedItems);
    var trueName = name;
    if(mapKeys.indexOf(name) !== -1) {
        trueName = mappedItems[name];
    }
    return trueName;
}

//lmao im drunk
function findCraft(lower) {
    lower = lower.toLowerCase();
    var deckCraft = "ERROR";
    if (lower.indexOf("haven") !== -1) {
        deckCraft = "Havencraft";
    }
    else if (lower.indexOf("shadow") !== -1) {
        deckCraft = "Shadowcraft";
    }
    else if (lower.indexOf("rune") !== -1) {
        deckCraft = "Runecraft";
    }
    else if (lower.indexOf("forest") !== -1) {
        deckCraft = "Forestcraft";
    }
    else if (lower.indexOf("sword") !== -1) {
        deckCraft = "swordcraft";
    }
    else if (lower.indexOf("dragon") !== -1) {
        deckCraft = "Dragoncraft";
    }
    else if (lower.indexOf("blood") !== -1) {
        deckCraft = "Bloodcraft";
    }
    else if (lower.indexOf("portal") !== -1) {
        deckCraft = "Portalcraft";
    }
    return deckCraft;
}

client.on("message", async message => {
    // This event will run on every single message received, from any channel or DM.

    // It's good practice to ignore other bots. This also makes your bot ignore itself
    // and not get into a spam loop (we call that "botception").
    if (message.author.bot) return;

    //bot_and_salt only
    if (message.channel.name != "salt_and_salter" && message.channel.name != "team_chat") return;

    // Also good practice to ignore any message that does not start with our prefix, 
    // which is set in the configuration file.
    if (message.content.indexOf(process.env.prefix) !== 0) return;

    // Here we separate our "command" name, and our "arguments" for the command. 
    // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
    // command = say
    // args = ["Is", "this", "the", "real", "life?"]
    const args = message.content.slice(process.env.prefix.length).trim().split(/\|/g);
    const command = args.shift().toLowerCase();
    console.log(command);
    console.log(args);

    // Let's go with a few common example commands! Feel free to delete or change those.

    if (command === "help") {
        const helpful = "+format: get the required format for a log\n" +
            "+log: log a match in the database. Please provide proper parameters\n" +
            "+search: search the database for a deck matchup. Currently under construction\n" +
            "+hi: greet SAlter";
        message.channel.send(helpful);
        return;
    }

    else if (command === "fuck") {
        message.channel.send("<:NotLikeCare:386714814543822859>");
        return;
    }

    else if(command === "kick") {
        message.channel.send("I don't know, I kind of like that guy...");
        return;
    }

    else if (command === "hi") {
        message.channel.send("<:yayumi:370005010668453890>");
        return;
    }

    else if(command === "map") {
        //REMEMBER TO WRITE TO SALTER CACHE AFTER MAPPING
        if(args.length !== 2) {
            message.channel.send("ERROR! Expected 2 args, got " + args.length);
            return;
        }
        var mapFrom = args[0];
        var mapTo = args[1];
        var mapKeys = Object.keys(mappedItems);
        if(mapKeys.indexOf(mapFrom) !== -1) {
            message.channel.send("ERROR! " + mapFrom + " is already mapped to " + mappedItems[mapFrom]);
            return;
        }
        if(mapKeys.indexOf(mapTo) !== -1) {
            if(mappedItems[mapTo] === mapFrom) {
                message.channel.send("ERROR! " + mapTo + " already maps to " + mapFrom);
                return;
            }
            else {
                var trueMapTo = checkMap(mapTo);
                mappedItems[mapFrom] = trueMapTo;
                message.channel.send(mapTo + " was already mapped to " + trueMapTo + ". " + mapFrom + " has been mapped to " + trueMapTo);
                return;
            }
        }
        mappedItems[mapFrom] = mapTo;
        message.channel.send(mapFrom + " has been mapped to " + mapTo);
        return;
    }

    else if (command === "search") {
        //message.channel.send("I said it was under construction...");
        /*Format
            +search|<deck>: lists all the matchups of that deck
            +search|<deck>|<opponent deck>: lists W/L ratio going first and second, justification, insight/reflection
            +search|<deck>|<opponent deck>|<result>: result can be win or loss, will only show justification and insight/reflection for that result
            */
        const argsMessage = "ERROR! Expected 1-3 args, got: " + args.length;
        const usageMessage = "Usage\n" + "+search|<deck>: lists all the matchups of that deck\n"
            + "+search|<deck>|<opponent deck>: lists W/L ratio going first and second, justification, insight/reflection\n"
            + "+search|<deck>|<opponent deck>|<result>: result can be win or loss, will only show justification and insight/reflection for that result";
        if (args.length < 1) {
            message.channel.send(usageMessage);
            return;
        }
        else if (args.length > 3) {
            message.channel.send(argsMessage);
            return;
        }
        var craftSheet = findCraft(checkMap(args[0]));
        if(craftSheet === "ERROR") {
            message.channel.send("IT'S NOT WORKING BITCH");
            return;
        }
        Spreadsheet.load({
            debug: true,
            spreadsheetName: 'Dawnbreakers Deck Data Log',
            worksheetName: craftSheet,
            oauth2: {
                client_id: process.env.client_id,
                client_secret: process.env.client_secret,
                refresh_token: process.env.refresh_token
            }
        },
            function sheetReady(err, spreadsheet) {
                if (err) throw err;
                spreadsheet.receive({ getValues: true }, function (err, rows, info) {
                    if (err) throw err;
                    if (args.length === 1) {
                        //List all the matchups for that deck
                        var matchupList = [];
                        var paragonDecks = rows[titleRows.Paragon];
                        var secondaryDecks = rows[titleRows.Secondary];
                        var guestDecks = rows[titleRows.Guest];
                        var tournamentDecks = rows[titleRows.Tournament];
                        var paragonLength = Object.keys(paragonDecks).length;
                        var secondaryLength = Object.keys(secondaryDecks).length;
                        var guestLength = Object.keys(guestDecks).length;
                        var tournamentLength = Object.keys(tournamentDecks).length;
                        for (var c = 2; c <= paragonLength; c++) {
                            var currDeck = checkMap(rows[titleRows.Paragon + 2][[c]]);
                            if (matchupList.indexOf(currDeck) === -1) {
                                matchupList.push(currDeck);
                            }
                        }
                        for (var c = 2; c <= secondaryLength; c++) {
                            var currDeck = checkMap(rows[titleRows.Secondary + 2][[c]]);
                            if (matchupList.indexOf(currDeck) === -1) {
                                matchupList.push(currDeck);
                            }
                        }
                        for (var c = 2; c <= guestLength; c++) {
                            var currDeck = checkMap(rows[titleRows.Guest + 2][[c]]);
                            if (matchupList.indexOf(currDeck) === -1) {
                                matchupList.push(currDeck);
                            }
                        }
                        for (var c = 2; c <= tournamentLength; c++) {
                            var currDeck = checkMap(rows[titleRows.Tournament + 2][[c]]);
                            if (matchupList.indexOf(currDeck) === -1) {
                                matchupList.push(currDeck);
                            }
                        }
                        var dMessage = "Here are the matchups I found for " + args[0] + ": ";
                        for (var i = 0; i < matchupList.length; i++) {
                            dMessage += matchupList[i];
                            if (i != matchupList.length - 1) {
                                dMessage += ", ";
                            }
                        }
                        dMessage += ".";
                        message.channel.send(dMessage);
                    }
                });
            });
    }

    else if (command === "format") {
        const sayMessage = "+log|<class>|<role>|<format>|<date>|<deck title>|<link to decklist>^<deck name>|<opponent deck>|<Win/Loss>|<First/Second>|<Justification>|<Changes made from previous decks>|<Insight/Reflection>|<Link to video (if any)>\nexample: +log|Portalcraft|Paragon|Rotation|10/5/15|Artifact|sv.bagoum/idontknow^MRPortal|Shitty Ginger Rune|Win|Second|Ginger Rune sucks lmao|None|Skillverse|N/A";
        //const example = "example: +log|Portalcraft|Paragon|Rotation|10/5/15|Artifact|sv.bagoum/idontknow^Wallet Haven|Shitty Ginger Rune|Win|Second|Ginger Rune sucks lmao|None|Skillverse|N/A";
        message.channel.send(sayMessage);
        //message.channel.send(example);
        return;
    }

    else if (command === "log") {
        //Make sure they gave 13 arguments cause they can't count
        if (args.length != 13) {
            message.channel.send("ERROR! Expected 13 arguments, got: " + args.length);
            return;
        }
        for(var i = 0; i < args.length; i++) {
            args[i] = checkMap(args[i]);
        }
        var craft = args[0];
        var role = args[1];
        var format = args[2];
        var date = args[3];
        var deckTitle = args[4];
        var deckLink = args[5];
        var opponentDeck = args[6];
        var result = args[7];
        var turn = args[8];
        var justification = args[9];
        var changes = args[10];
        var insight = args[11];
        var videoLink = args[12];
        //Check for valid craft
        var craftList = new Array("Havencraft", "Runecraft", "Shadowcraft", "Forestcraft", "Swordcraft", "Dragoncraft", "Bloodcraft", "Portalcraft");
        if (craftList.indexOf(craft) === -1) {
            message.channel.send("ERROR! Allowed crafts are Havencraft, Runecraft, Shadowcraft, Forestcraft, Swordcraft, Dragoncraft, Bloodcraft, and Portalcraft. You entered: " + craft);
            return;
        }
        //Check for valid role
        var roleList = new Array("Paragon", "Secondary", "Guest", "Tournament");
        if (roleList.indexOf(role) === -1) {
            message.channel.send("ERROR! Allowed roles are Paragon, Secondary, Guest, and Tournament. You entered: " + role);
            return;
        }
        //Check for valid format
        var formatList = new Array("Rotation", "Unlimited");
        if (formatList.indexOf(format) === -1) {
            message.channel.send("ERROR! Allowed formats are Rotation and Unlimited. You entered: " + format);
            return;
        }
        //Check for valid result
        var resultList = new Array("Win", "Loss");
        if (resultList.indexOf(result) === -1) {
            message.channel.send("ERROR! Allowed results are Win and Loss. You entered: " + result);
            return;
        }
        var turnList = new Array("First", "Second");
        if (turnList.indexOf(turn) === -1) {
            message.channel.send("ERROR! Allowed turns are First and Second. You entered: " + turn);
            return;
        }
        //Check that deck name includes craft name
        var hasCraft = false;
        for (var i = 0; i < craftList.length; i++) {
            //Chop off the craft
            var craftName = craftList[i].substring(0, craftList[i].length - 5);
            if (deckTitle.toLowerCase().indexOf(craftName.toLowerCase()) !== -1) {
                hasCraft = true;
            }
        }
        if (!hasCraft) {
            message.channel.send("ERROR! Deck title does not contain Haven, Shadow, Rune, Forest, Sword, Dragon, Blood, or Portal!");
            return;
        }
        //Check that opponent deck name includes craft name
        var oppCraft = false;
        for (var i = 0; i < craftList.length; i++) {
            //Chop off the craft
            var oppName = craftList[i].substring(0, craftList[i].length - 5);
            if (opponentDeck.toLowerCase().indexOf(oppName.toLowerCase()) !== -1) {
                oppCraft = true;
            }
        }
        if (!oppCraft) {
            message.channel.send("ERROR! Opponent deck does not contain Haven, Shadow, Rune, Forest, Sword, Dragon, Blood, or Portal!");
            return;
        }
        //Member permissions
        if (role === "Paragon") {
            if (message.author.id !== paragons[craft]) {
                message.channel.send("ERROR! You are not the " + craft + " Paragon! Care will ban you!");
                return;
            }
        }
        else if (role === "Secondary") {
            if (message.author.id !== secondaries[craft]) {
                message.channel.send("ERROR! You are not the " + craft + " Secondary! Care will ban you!")
                return;
            }
        }

        Spreadsheet.load({
            debug: true,
            spreadsheetName: 'Dawnbreakers Deck Data Log',
            worksheetName: craft,
            oauth2: {
                client_id: process.env.client_id,
                client_secret: process.env.client_secret,
                refresh_token: process.env.refresh_token
            }
        },
            function sheetReady(err, spreadsheet) {
                if (err) throw err;
                spreadsheet.receive({ getValues: true }, function (err, rows, info) {
                    if (err) throw err;
                    var col = -1;
                    var titleRow = 0; //Row for deck title

                    //Wow I'm good at coding.
                    if (role === "Paragon") {
                        titleRow = titleRows.Paragon;
                        col = Object.keys(rows[titleRows.Paragon]).length + 1;
                    }
                    else if (role === "Secondary") {
                        titleRow = titleRows.Secondary;
                        col = Object.keys(rows[titleRows.Secondary]).length + 1;
                    }
                    else if (role === "Guest") {
                        titleRow = titleRows.Guest;
                        col = Object.keys(rows[titleRows.Guest]).length + 1;
                    }
                    else {
                        titleRow = titleRows.Tournament;
                        col = Object.keys(rows[titleRows.Tournament]).length + 1;
                    }
                    var formatRow = titleRow - 2;
                    var dateRow = titleRow - 1;
                    var linkRow = titleRow + 1;
                    var opponentRow = titleRow + 2;
                    var resultRow = titleRow + 3;
                    var turnRow = titleRow + 4;
                    var justificationRow = titleRow + 5;
                    var changeRow = titleRow + 6;
                    var irRow = titleRow + 7;
                    var videoRow = titleRow + 8;
                    var deckName = "Deck";
                    if (deckLink.indexOf("^") === -1) {
                        deckName = "Deck";
                    }
                    else {
                        deckName = deckLink.substring(deckLink.indexOf("^") + 1);
                        deckLink = deckLink.substring(0, deckLink.indexOf("^"));
                    }
                    var hyperlink = "=HYPERLINK(\"" + deckLink + "\", \"" + deckName + "\")";
                    spreadsheet.add({ [formatRow]: { [col]: format } });
                    spreadsheet.add({ [dateRow]: { [col]: date } });
                    spreadsheet.add({ [titleRow]: { [col]: deckTitle } });
                    spreadsheet.add({ [linkRow]: { [col]: hyperlink } });
                    spreadsheet.add({ [opponentRow]: { [col]: opponentDeck } });
                    spreadsheet.add({ [resultRow]: { [col]: result } });
                    spreadsheet.add({ [turnRow]: { [col]: turn } });
                    spreadsheet.add({ [justificationRow]: { [col]: justification } });
                    spreadsheet.add({ [changeRow]: { [col]: changes } });
                    spreadsheet.add({ [irRow]: { [col]: insight } });
                    spreadsheet.add({ [videoRow]: { [col]: videoLink } });

                    if (err) throw err;


                    spreadsheet.send({ autoSize: true }, function (err) {
                        if (err) throw err;
                        message.channel.send("Logged!");
                    });
                });
            });
    }

    else {
        message.channel.send("I'm not a chat bot");
        return;
    }
});

client.login(process.env.BOT_TOKEN);
