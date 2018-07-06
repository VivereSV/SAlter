// Load up the discord.js library
const Discord = require("discord.js");

//Google spreadsheet stuff
var Spreadsheet = require('edit-google-spreadsheet');

//Too lazy to implement my own, this seems kind of sketchy but looks like it works lmao
var MarkovChain = require('markovchain-generate');

//My job would be so much easier if it wasn't a Google Spreadsheet 
var fs = require("fs");
//var seraphThesis = fs.readFileSync("./seraph.txt", {"encoding": "utf-8"});

//Jesus Christ why did I choose javascript
const Twitch = require("twitch.tv-api");
const twitch = new Twitch({
  id: process.env.twitch_id,
  secret: process.env.twitch_secret
});

var lastChecked;
var wasUp;
var scrims = new Array();

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
    client.user.setActivity(`Saltverse`);
    var da = new Date();
    lastChecked = da.getTime();
    wasUp = false;
    Spreadsheet.load({
        debug: true,
        spreadsheetName: 'Dawnbreakers Deck Data Log',
        worksheetName: 'SAlter Cache',
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
                //console.log(rows);
                //console.log(Object.keys(rows));
                for (var i = 1; i <= Object.keys(rows).length; i++) {
                    var obj = rows[i];
                    //console.log(obj);
                    mappedItems[obj['1']] = obj['2'];

                }
                //console.log(mapped);
            });
        });
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
    while (name !== checkHelper(name)) {
        name = checkHelper(name);
    }
    return name;
}

//lmao fuck the users
function checkHelper(name) {
    var mapKeys = Object.keys(mappedItems);
    var trueName = name;
    if (mapKeys.indexOf(name) !== -1) {
        trueName = mappedItems[name];
    }
    return trueName;
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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
        deckCraft = "Swordcraft";
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
  
    var d = new Date();
    var t = d.getTime();
    //console.log("Last checked: " + lastChecked);
    //console.log("Now: " + t);
    if(t >= lastChecked + 30000) {
        //console.log("wasUp Start: " + wasUp);
        var sTitle = "";
        twitch.getUser("teamdawnbreakers")
            .then(data => {
                if(data.stream === null) {
                  //console.log("NULL");
                    if(wasUp) {
                      wasUp = false;
                    }
                }
                else {
                    sTitle = data.stream.channel.status;
                    console.log("UP");
                    if(!wasUp) {
                      wasUp = true;
                      message.guild.channels.find("name", "streams_and_articles").send("@here I-it's not like I w-want you to go watch " + sTitle + " at https://www.twitch.tv/teamdawnbreakers anyways you b-baka <:feelslizaman:396859362410364942>");
                    }
                }
            })
        .catch(error => {
            console.error(error);
        });
    }
    
    if(message.channel.type == "dm") {
        if(message.content.toLowerCase().startsWith("set")) {
            const cmd = message.content.split(/ /g);
            console.log(cmd);
            var opt = ["1", "2", "3"];
            if(opt.indexOf(cmd[1]) === -1) {
                message.author.send("Is it really that hard to send something in the correct format of: set [1/2/3] [decklink]?");
                return;
            }
            var col = Number(cmd[1]);
            var link = cmd[2];
            if(link.indexOf(".com") === -1) {
                message.author.send("That doesn't look like a deck link to me. If it is, message VLV with a screenshot of this unpleasant interaction.");
                return;
            }
            Spreadsheet.load({
                debug: true,
                spreadsheetName: 'SAlter',
                worksheetName: 'Lineup',
                oauth2: {
                    client_id: process.env.client_id,
                    client_secret: process.env.client_secret,
                    refresh_token: process.env.refresh_token
                }
            },
                function sheetReady(err, spreadsheet) {
                    if (err) throw err;
                    spreadsheet.receive({getValues: true}, function (err, rows, info) {
                        if (err) throw err;
                        var loc = -1;
                        numRows = Object.keys(rows).length;
                        for(var i = 1; i <= numRows; i++) {
                            if(rows[i][1] == message.author.id) {
                                loc = i;
                            }
                        }
                        if(loc === -1) {
                            spreadsheet.add({ [numRows + 1]: { 1: message.author.id } });
                            loc = numRows + 1;
                        }
                        spreadsheet.add({ [loc]: { [col + 1]: link } });
                        if (err) throw err;


                        spreadsheet.send({ autoSize: true }, function (err) {
                            if (err) throw err;
                            message.channel.send("Deck " + col + " has been updated to " + link + ". Now can you stop bothering me?");
                        });
                    });
            });
            return;
        }
        Spreadsheet.load({
            debug: true,
            spreadsheetName: 'Clash of the Crusaders Deck Database',
            worksheetName: 'Invitational 1',
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
                    
                    if(message.content.indexOf(".com") === -1) {
                        message.channel.send("That doesn't look like a deck link to me. If it is, please message a moderator to submit your decks.");
                        return;
                    }
                    
                    var person = message.author.username;
                    var col = 2;
                    var found = false;
                    var numRows = Object.keys(rows).length;
                    var HLStart = "=HYPERLINK(\"";
                    var HLMid = "\", \"Deck ";
                    var HLEnd = "\")";
                    for(var i = 2; i <= numRows; i++) {
                        console.log(rows[i][1]);
                        if(rows[i][1] == person) {
                            found = true;
                            col = Object.keys(rows[i]).length + 1;
                            if(col > 4) {
                                message.channel.send("You have already submitted 3 decks. If an error occurred or you would like to edit one, please message a moderator.");
                            }
                            else {
                                var dList = HLStart + message.content + HLMid + (col - 1) + HLEnd;
                                spreadsheet.add({ [i]: { [col]: dList } });
                            }
                        }
                    }
                    if(!found) {
                        spreadsheet.add({ [numRows + 1]: { [1]: person } });
                        var dList = HLStart + message.content + HLMid + (col - 1) + HLEnd;
                        spreadsheet.add({ [numRows + 1]: { [2]: dList } });
                    }
                    
                    

                    if (err) throw err;


                    spreadsheet.send({ autoSize: true }, function (err) {
                        if (err) throw err;
                        if(col <= 4) {
                            message.channel.send("Deck " + (col - 1) + " has been submitted!");
                        }
                        if(col === 4) {
                            message.channel.send("All 3 decks have been submitted! If you would like to make any changes or an error occurred, please message a moderator.");
                        }
                    });
                });
            });
    }

    // Also good practice to ignore any message that does not start with our prefix, 
    // which is set in the configuration file.
    if (message.content.indexOf(process.env.prefix) !== 0) return;

    //bot_and_salt only
    if (message.channel.name != "salt_and_salter" && message.channel.name != "team_chat" && message.channel.name != "general" && message.channel.name != "granblue_discussion" && message.channel.name != "public_scrim" && message.channel.name != "internal_scrim") return;

    // Here we separate our "command" name, and our "arguments" for the command. 
    // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
    // command = say
    // args = ["Is", "this", "the", "real", "life?"]
    const args = message.content.slice(process.env.prefix.length).trim().split(/\;/g);
    const command = args.shift().toLowerCase();
    console.log(command);
    console.log(args);

    // Let's go with a few common example commands! Feel free to delete or change those.
  
    if (command === "helpme") {
      const hm = "Please type /help for further instructions on how to use the multiserver scrim bot. Thanks!";
      message.channel.send(hm);
    }

    if (command === "fiteme") {
      const hm = "Please type /help for further instructions on how to use the multiserver scrim bot. Thanks!";
      message.channel.send(hm);
      /*if(scrims.indexOf(message.author) !== -1) {
        message.channel.send("Ugh, stop bothering me. You're already on the list.");
        return;
      }
      scrims.push(message.author);
      message.channel.send(message.author.username + " is currently looking for a scrim!");*/
    }
  
    if (command === "lfs") {
      const hm = "Please type /help for further instructions on how to use the multiserver scrim bot. Thanks!";
      message.channel.send(hm);
      /*for(var i = scrims.length - 1; i >= 0; i--) {
        if(scrims[i].presence.status === "offline") {
          scrims.splice(i, 1); 
        }
      }
      var sm = "These people are currently looking for a scrim: ";
      if(scrims.length === 0) {
        message.channel.send("Sorry, nobody is looking for a scrim right now... I'd fight you but I wouldn't want to destroy your ego.");
        return;
      }
      else {
        for(var i = 0; i < scrims.length - 1; i++) {
          sm += scrims[i].username + ", "; 
        }
        sm += scrims[scrims.length - 1].username + ".";
        message.channel.send(sm + " Go bother one of them.");
      }*/
    }
  
    if (command === "run") {
      const hm = "Please type /help for further instructions on how to use the multiserver scrim bot. Thanks!";
      message.channel.send(hm);
      /*if(scrims.indexOf(message.author) === -1) {
        message.channel.send("It's not like you were even looking for a scrim...");
        return;
      }
      else {
        scrims.splice(scrims.indexOf(message.author), 1);
        message.channel.send("Let me know when you're ready to scrim again.");
        return;
      }*/
    }
  
    if (command === "advice") {
        if (args.length !== 1) {
            message.channel.send("Please provide the craft name. Example usage: +advice;Runecraft");
            return;
        }
        if(args[0].toLowerCase() === "relationships") {
            message.channel.send("https://www.gotinder.com/");
            return;
        }
        args[0] = checkMap(args[0]);
        var craftList = new Array("Havencraft", "Runecraft", "Shadowcraft", "Forestcraft", "Swordcraft", "Dragoncraft", "Bloodcraft", "Portalcraft");
        if (craftList.indexOf(args[0]) === -1) {
            message.channel.send("Please provide a valid craft. " + args[0] + " is not a valid craft.");
            return;
        }
        Spreadsheet.load({
            debug: true,
            spreadsheetName: 'Dawnbreakers Deck Data Log',
            worksheetName: args[0],
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
                    var chain = new MarkovChain();
                    var bigchunker = "";
                    var pjust = rows[titleRows.Paragon + 5];
                    var sjust = rows[titleRows.Secondary + 5];
                    var gjust = rows[titleRows.Guest + 5];
                    var tjust = rows[titleRows.Tournament + 5];
                    for (var c = 2; c <= Object.keys(pjust).length; c++) {
                        var tempj = pjust[c];
                        /*var append = " ";
                        if(!tempj.endsWith("\.")) {
                            append = "\. ";
                        }
                        bigchunker += tempj + append;*/
                        if(tempj != "undefined") {
                            bigchunker += tempj + " ";
                        }
                    }
                    for (var c = 2; c <= Object.keys(sjust).length; c++) {
                        var tempj = sjust[c];
                        /*var append = " ";
                        if(!tempj.endsWith("\.")) {
                            append = "\. ";
                        }
                        bigchunker += tempj + append;*/
                        if(tempj != "undefined") {
                            bigchunker += tempj + " ";
                        }
                    }
                    for (var c = 2; c <= Object.keys(gjust).length; c++) {
                        var tempj = gjust[c];
                        /*var append = " ";
                        if(!tempj.endsWith("\.")) {
                            append = "\. ";
                        }
                        bigchunker += tempj + append;*/
                        if(tempj != "undefined") {
                            bigchunker += tempj + " ";
                        }
                    }
                    for (var c = 2; c <= Object.keys(tjust).length; c++) {
                        var tempj = tjust[c];
                        /*var append = " ";
                        if(!tempj.endsWith("\.")) {
                            append = "\. ";
                        }
                        bigchunker += tempj + append;*/
                        if(tempj != "undefined") {
                            bigchunker += tempj + " ";
                        }
                    }
                    chain.generateChain(bigchunker);
                    var test = chain.generateString();
                    message.channel.send(test);
                    
                });
            });
        return;
    }
    
    if (command === "seraph") {
        /*var seraphChain = new MarkovChain();
        var seraphOutput = seraphChain.generateString();*/
        message.channel.send("xnine broke it");
        return;
    }
    
    if (command === "avatar") {
        let am = message.mentions.members.first().user;
        var ava = am.avatarURL;
        if(am.id === "261610099699744769") {
            message.channel.send("", {files: ["https://www.theexpositor.tv/wp-content/uploads/Rated-R-for-18-and-over.png"]});
            return;
        }
        message.channel.send("", {files: [ava.substring(0, ava.indexOf("?"))]});
        return;
    }
    if (command === "gbf") {
        var wikiLink = "https://gbf.wiki/";
        if(args.length !== 1) {
            message.channel.send("Waifu not found!");
            return;
        }
        message.channel.send(wikiLink + args[0].replace(/ /g, "_"));
        return;
    }

    if (message.channel.name === "general" || message.channel.name === "granblue_discussion" || message.channel.name === "public_scrim") return;

    if (command === "help") {
        const helpful = "+format: get the required format for a log\n" +
            "+log: log a match in the database. Please provide proper parameters\n" +
            "+search: search the database for a deck matchup. Type +search for more info\n" +
            "+map;mapFrom;mapTo: map mapFrom to mapTo. SAlter will treat them as the same deck\n" +
            "+unmap;mapFrom;mapTo: unmap mapFrom and mapTo. SAlter will no longer treat them as the same deck.\n" +
            "+hi: greet SAlter";
        message.channel.send(helpful);
        return;
    }
  
    if (command === "svo") {
        var cont = message.content.replace(/@!/g, "@");
        var firstAt = cont.indexOf("@");
        var firstClose = cont.indexOf(">");
        var lastAt = cont.lastIndexOf("@");
        var lastClose = cont.lastIndexOf(">");
        console.log(cont);
        if(firstAt === lastAt) {
            message.channel.send("The correct format is +svo; @A @B. Don't waste my time with your mistakes.");
            return;
        }
        var firstID = cont.substring(firstAt + 1, firstClose);
        var secondID = cont.substring(lastAt + 1, lastClose);
        if(firstID === secondID) {
            message.channel.send("Are you so pathetic that you have to play with yourself?");
            return;
        }
        
        var firstUser = message.guild.members.get(firstID).user;
        var secondUser = message.guild.members.get(secondID).user;

        var firstLine = false;
        var secondLine = false;

        var firstDecks = new Array();
        var secondDecks = new Array();

        Spreadsheet.load({
            debug: true,
            spreadsheetName: 'SAlter',
            worksheetName: 'Lineup',
            oauth2: {
                client_id: process.env.client_id,
                client_secret: process.env.client_secret,
                refresh_token: process.env.refresh_token
            }
        },
            function sheetReady(err, spreadsheet) {
                if (err) throw err;
                spreadsheet.receive({getValues: true}, function (err, rows, info) {
                    if (err) throw err;
                    var numRows = Object.keys(rows).length;
                    for(var i = 1; i <= numRows; i++) {
                        if(rows[i][1] === firstUser.id) {
                            firstLine = true;
                            firstDecks.push(rows[i][2]);
                            firstDecks.push(rows[i][3]);
                            firstDecks.push(rows[i][4]);
                        }
                        if(rows[i][2] === secondUser.id) {
                            secondLine = true;
                            secondDecks.push(rows[i][2]);
                            secondDecks.push(rows[i][3]);
                            secondDecks.push(rows[i][4]);
                        }
                    }
                });
        });
        var eMessage = "";
        if(!firstLine) {
            eMessage += "Not sure why " + firstUser + " doesn't have a lineup.\n";
        }
        if(!secondLine) {
            eMessage += "Not sure why " + secondUser + " doesn't have a lineup.";
        }
        if(!firstLine || !secondLine) {
            message.channel.send(eMessage);
            return;
        }
        message.channel.send("Awaiting ban from " + firstUser);

        firstUser.createDM().then((dm1) => {
            dm1.send("Deck 1: " + secondDecks[0] + "\nDeck 2: " + secondDecks[1] + "\nDeck 3: " + secondDecks[2]);
            dm1.send("Please enter 1, 2, or 3 depending on which deck you wish to ban");
            dm1.awaitMessages(msg => {
                return msg.content === "1" || msg.content === "2" || msg.content === "3";
            }, {maxMatches: 1}).then((ban1) => {
                var b1 = ban1.map(msg => msg.content);
                message.channel.send(firstUser + " has sent in their ban! Now awaiting ban from " + secondUser);
                secondUser.createDM().then((dm2) => {
                    dm2.send("Deck 1: " + firstDecks[0] + "\nDeck 2: " + firstDecks[1] + "\nDeck 3: " + firstDecks[2]);
                    dm2.send("Please enter 1, 2, or 3 depending on which deck you wish to ban");
                    dm2.awaitMessages(msg => {
                        return msg.content === "1" || msg.content === "2" || msg.content === "3";
                    }, {maxMatches: 1}).then((ban2) => {
                        var b2 = ban2.map(msg => msg.content);
                        var b1t = Number(b1) - 1;
                        var b2t = Number(b2) - 1;
                        message.channel.send(firstUser + " chickened out and banned deck " + b1 + ": " + secondDecks[b1t] + "\n" + secondUser + " is a wuss and banned deck " + b2 + ": " + firstDecks[b2t]);
                    })
                })
            })
        })
        return;
    }
  
    if (command === "scrim") {
        var cont = message.content.replace(/@!/g, "@");
        var firstAt = cont.indexOf("@");
        var firstClose = cont.indexOf(">");
        var lastAt = cont.lastIndexOf("@");
        var lastClose = cont.lastIndexOf(">");
        console.log(cont);
        if(firstAt === lastAt) {
            message.channel.send("The correct format is +scrim; @A @B. Don't waste my time with your mistakes.");
            return;
        }
        var firstID = cont.substring(firstAt + 1, firstClose);
        var secondID = cont.substring(lastAt + 1, lastClose);
        if(firstID === secondID) {
            message.channel.send("Are you so pathetic that you have to play with yourself?");
            return;
        }
        
        var firstUser = message.guild.members.get(firstID).user;
        var secondUser = message.guild.members.get(secondID).user;
        var ban1 = "";
        var ban2 = "";

        message.channel.send("Awaiting ban from " + firstUser.username);

        firstUser.createDM().then((dm1) => {
            dm1.send("Please enter 1, 2, or 3 depending on which deck you wish to ban");
            dm1.awaitMessages(msg => {
                return msg.content === "1" || msg.content === "2" || msg.content === "3";
            }, {maxMatches: 1}).then((ban1) => {
                var b1 = ban1.map(msg => msg.content);
                message.channel.send(firstUser.username + " has sent in their ban! Now awaiting ban from " + secondUser.username);
                secondUser.createDM().then((dm2) => {
                    dm2.send("Please enter 1, 2, or 3 depending on which deck you wish to ban");
                    dm2.awaitMessages(msg => {
                        return msg.content === "1" || msg.content === "2" || msg.content === "3";
                    }, {maxMatches: 1}).then((ban2) => {
                        var b2 = ban2.map(msg => msg.content);
                        message.channel.send(firstUser + " chickened out and banned deck " + b1 + "\n" + secondUser + " is a wuss and banned deck " + b2);
                    })
                })
            })
        })
        return;
    }
    
    if (command === "stream") {
      if(args.length === 1) {
        twitch.getUser(args[0])
            .then(data => {
                if(data.stream === null) {
                    message.channel.send(args[0] + " Stream down");
                }
                else {
                    message.channel.send(args[0] + " Stream up");
                }
            })
             .catch(error => {
                console.error(error);
            });
        return;
      }
        twitch.getUser("teamdawnbreakers")
            .then(data => {
                if(data.stream === null) {
                    message.channel.send("DB Stream down");
                }
                else {
                    message.channel.send("DB Stream up");
                }
            })
             .catch(error => {
                console.error(error);
            });
      return;
    }
    
    if (command === "m") {
        if(args.length !== 3) {
            message.channel.send("Error! Format is +m;Win/Loss;Your deck;Opponent deck");
            return;
        }
        var result = checkMap(args[0]);
        var your = checkMap(args[1]).toLowerCase();
        var oppo = checkMap(args[2]).toLowerCase();

        /*var deckNames = new Array("mid sword", "temple haven", "aegis haven", "holy lion haven", "spellboost rune", "ginger rune",
                                    "burn rune", "artifact portal", "puppet portal", "ramp dragon", "lindworm", "pdk", "reanimate", 
                                "mid shadow", "hybrid shadow", "neutral forest", "aggro forest", "control forest", "otk forest",
                            "vengeance", "bat aggro", "neutral blood", "aggro sword");*/
        var deckNames = new Array();

        
        if(result.toLowerCase() !== "win" && result.toLowerCase() !== "loss") {
            message.channel.send("Error! Result must be win or loss!");
            return;
        }
        
        Spreadsheet.load({
            debug: true,
            spreadsheetName: 'DBNE Match Tracker',
            worksheetName: 'Log GBF',
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

                    var numDecks = Object.keys(rows[28]).length;
                    console.log("Number of decks: " + numDecks);
                    for(var i = 2; i <= numDecks + 1; i++) {
                        deckNames.push(rows[28][i].toLowerCase());
                    }

                    var r = 0;
                    var c = 0;
                    if(result === "Win") {
                        r = deckNames.indexOf(your) + 29;
                        c = deckNames.indexOf(oppo) + 2;
                    }
                    else {
                        r = deckNames.indexOf(oppo) + 29;
                        c = deckNames.indexOf(your) + 2;
                    }

                    if(deckNames.indexOf(your) === -1) {
                        message.channel.send("Error! " + your + " is not a valid deck name!");
                        return;
                    }
                    else if(deckNames.indexOf(oppo) === -1) {
                        message.channel.send("Error! " + oppo + " is not a valid deck name!");
                        return;
                    }


                    var val = 0;
                    console.log("R: " + r);
                    console.log("C: " + c);
                    console.log("Rows: " + rows[r][c]);
                    console.log("Type: " + typeof(rows[r][c]));
                    if(rows[r][c] > 0) {
                        console.log("Value: " + rows[r][c]);
                        val = rows[r][c];
                    }
                    val++;
                    console.log("Row: " + r);
                    console.log("Col: " + c);
                    console.log("Logged: " + val);
                    spreadsheet.add({ [r]: { [c]: val } });
                    

                    if (err) throw err;


                    spreadsheet.send({ autoSize: true }, function (err) {
                        if (err) throw err;
                        message.channel.send("Logged!");
                    });
                });
            });

    }
    
    else if (command === "assign") {
        //Read the google spreadsheet and assign every player there a role.
        Spreadsheet.load({
            debug: true,
            spreadsheetName: 'Clash of the Crusaders Deck Database',
            worksheetName: 'Invitational 1',
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
                    
                    var numRows = Object.keys(rows).length;
                    var usernames = new Array();
                    for(var i = 2; i <= numRows; i++) {
                        usernames.push(rows[i][1]);
                    }

                    let a = message.guild.roles.find("name", "Aspirant");
                    let allMembers = message.guild.members.array();

                    for(var j = 0; j < allMembers.length; j++) {
                        if(usernames.indexOf(allMembers[j].user.username) != -1) {
                            allMembers[j].addRole(a);
                        }
                    }

                    if (err) throw err;
                    
                    message.channel.send("All participants have been assigned the Aspirant role!");
                   
                });
            });
    }

    else if (command === "monika") {
        message.edit("test").catch(console.error);
        return;
    }

    else if (command === "pat") {
        message.channel.send("T-thanks... it's not like I wanted a head pat...", { files: ["https://i.imgur.com/5I4rndN.png"] });
        return;
    }

    else if (command === "kiss") {
        message.channel.send("B-baka, it's not like I wanted to kiss you", { files: ["https://i.imgur.com/Gd1dCmj.jpg"] });
        return;
    }
    
    else if (command === "comfort") {
        message.channel.send("I hope you're feeling better <:cute:398343907710205972>", {files: ["https://i.imgur.com/7bUGOqe.jpg"]});
        return;
    }

    else if (command === "lewd") {
        var lm = "P-p-pervert!";
        var ll = "http://i.imgur.com/8mdLKaH.gif";
        if (message.author.id === 232040363957813248) {
            lm = "Sorry, this command is restricted to users above the age of 18";
            ll = "https://www.theexpositor.tv/wp-content/uploads/Rated-R-for-18-and-over.png";
        }
        message.channel.send(lm, { files: [ll] });
    }

    else if (command === "dance") {
        if(message.author.id === 178598393822576642) {
            message.channel.send("", {files: ["https://cdn.psychologytoday.com/sites/default/files/styles/article-inline-half/public/blogs/44242/2012/10/106847-105978.png"]});
            return;
        }
        message.channel.send("", {files: ["http://i.imgur.com/XHefT4t.gif"]});
        return;
    }

    else if (command === "fuck") {
        message.channel.send("<:pepos:369998914755100672>");
        return;
    }

    else if (command === "kick") {
        let r = message.guild.roles.find("name", "Citizen");
        let member = message.mentions.members.first();
        let cMessage = "The Citizen role has been removed from " + message.mentions.members.first().nickname;
        message.channel.send(cMessage);
        member.removeRole(r).catch(console.error);
        return
    }

    else if (command === "hi") {
        message.channel.send("<:yayumi:370005010668453890>");
        return;
    }

    else if (command === "unmap") {
        //If valid unmap
        //Remove mapping from object
        //Write object to SAlter cache + 1 extra blank
        //No need to read!
        if (args.length !== 2) {
            message.channel.send("ERROR! Expected 2 arguments, got " + args.length);
            return;
        }
        var p = args[0];
        var v = args[1];
        var mapKeys = Object.keys(mappedItems);
        if (mapKeys.indexOf(p) === -1) {
            message.channel.send("ERROR! " + p + " is not mapped to anything");
            return;
        }
        else {
            if (mappedItems[[p]] !== v) {
                message.channel.send("ERROR! " + p + " does not map to " + v);
                return;
            }
            delete mappedItems[p];

            //I really should make a function for this but I'd have to actually learn how the module works so fuck that
            Spreadsheet.load({
                debug: true,
                spreadsheetName: 'Dawnbreakers Deck Data Log',
                worksheetName: 'SAlter Cache',
                oauth2: {
                    client_id: process.env.client_id,
                    client_secret: process.env.client_secret,
                    refresh_token: process.env.refresh_token
                }
            }, function sheetReady(err, spreadsheet) {
                if (err) throw err;
                //Add everything in mappedItems to SAlter cache to avoid reading the cache lmao
                mapKeys = Object.keys(mappedItems); //Update cause removed a mapping
                for (var i = 0; i < mapKeys.length; i++) {
                    var nextRow = i + 1;
                    spreadsheet.add({ [nextRow]: { 1: [mapKeys[i]] } });
                    spreadsheet.add({ [nextRow]: { 2: [mappedItems[mapKeys[i]]] } });
                }
                spreadsheet.add({ [mapKeys.length + 1]: { 1: "" } });
                spreadsheet.add({ [mapKeys.length + 1]: { 2: "" } });

                spreadsheet.send(function (err) {
                    if (err) throw err;
                });
                var succMessage = p + " has been unmapped from " + v;
                message.channel.send(succMessage);
            })
        }
    }

    else if (command === "map") {
        //REMEMBER TO WRITE TO SALTER CACHE AFTER MAPPING
        if (args.length !== 2) {
            message.channel.send("ERROR! Expected 2 args, got " + args.length);
            return;
        }
        var mapFrom = args[0];
        var mapTo = args[1];
        var mapKeys = Object.keys(mappedItems);
        var nextRow = mapKeys.length + 1;
        var succMessage = mapFrom + " has been mapped to " + mapTo;
        if (mapKeys.indexOf(mapFrom) !== -1) {
            message.channel.send("ERROR! " + mapFrom + " is already mapped to " + mappedItems[mapFrom]);
            return;
        }
        if (mapKeys.indexOf(mapTo) !== -1) {
            if (mappedItems[mapTo] === mapFrom) {
                message.channel.send("ERROR! " + mapTo + " already maps to " + mapFrom);
                return;
            }
            else {
                var trueMapTo = checkMap(mapTo);
                succMessage = (mapTo + " was already mapped to " + trueMapTo + ". " + mapFrom + " has been mapped to " + trueMapTo);
                mapTo = trueMapTo;
            }
        }
        mappedItems[mapFrom] = mapTo;
        Spreadsheet.load({
            debug: true,
            spreadsheetName: 'Dawnbreakers Deck Data Log',
            worksheetName: 'SAlter Cache',
            oauth2: {
                client_id: process.env.client_id,
                client_secret: process.env.client_secret,
                refresh_token: process.env.refresh_token
            }
        }, function sheetReady(err, spreadsheet) {
            if (err) throw err;

            spreadsheet.add({ [nextRow]: { 1: [mapFrom] } });
            spreadsheet.add({ [nextRow]: { 2: [mapTo] } });

            spreadsheet.send(function (err) {
                if (err) throw err;
            });
            message.channel.send(succMessage);
        })
    }

    else if (command === "add") {
        let r = message.guild.roles.find("name", "Aspirant");
        let member = message.mentions.members.first();
        let cMessage = message.mentions.members.first().nickname + " has been assigned the Aspirant role!";
        message.channel.send(cMessage);
        member.addRole(r).catch(console.error);
    }

    else if (command === "check") {
        let member = message.mentions.members.first();
        let rs = member.roles.array();
        message.channel.send(rs);
    }

    else if (command === "plz") {

        let r = message.guild.roles.find("name", "Aspirant");
        let am = message.guild.members.array();
        var bMessage = "The following did not receive the role: ";
        for (var i = 0; i < args.length; i++) {
            if (args[i].indexOf("#") >= 0) {
                args[i] = args[i].substring(0, args[i].indexOf("#"));
            }
        }
        let rm = args.slice(); //still refer to same object tho
        for (var i = 0; i < am.length; i++) {
            let nick = am[i].nickname;
            let un = am[i].user.username;
            if (args.indexOf(nick) >= 0 || args.indexOf(un) >= 0) {
                am[i].addRole(r).catch(console.error);
                var ind = rm.indexOf(nick);
                if (ind === -1) {
                    ind = rm.indexOf(un);
                }
                rm.splice(ind, 1);
            }
        }
        for (var i = 0; i < rm.length; i++) {
            bMessage += rm[i] + ";";
        }
        message.channel.send(bMessage);
    }

    else if (command === "remove") {
        let r = message.guild.roles.find("name", "Aspirant");
        let member = message.mentions.members.first();
        let cMessage = "The Aspirant role has been removed from " + message.mentions.members.first().nickname;
        message.channel.send(cMessage);
        member.removeRole(r).catch(console.error);
    }

    else if (command === "nuke") {
        let r = message.guild.roles.find("name", "Aspirant");
        let am = message.guild.members.array();
        for (var i = 0; i < am.length; i++) {
            am[i].removeRole(r).catch(console.error);
        }
        message.channel.send("Nuked all weebs.");
    }

    else if (command === "search") {
        //message.channel.send("I said it was under construction...");
        /*Format
            +search/<deck>: lists all the matchups of that deck
            +search/<deck>/<opponent deck>: lists W/L ratio going first and second, justification, insight/reflection
            +search/<deck>/<opponent deck>/<result>: result can be win or loss, will only show justification and insight/reflection for that result
            */

        const argsMessage = "ERROR! Expected 1-3 args, got: " + args.length;
        const usageMessage = "Usage\n" + "+search;<deck>: lists all the matchups of that deck\n"
            + "+search;<deck>;<opponent deck>: lists W;L ratio going first and second, justification, insight;reflection\n"
            + "+search;<deck>;<opponent deck>;<result>: result can be win or loss, will only show justification and insight;reflection for that result";
        if (args.length < 1) {
            message.channel.send(usageMessage);
            return;
        }
        else if (args.length > 3) {
            message.channel.send(usageMessage);
            return;
        }
        var userDeck = checkMap(args[0]);
        var oppDeck;
        if (args.length >= 2) {
            oppDeck = checkMap(args[1]);
        }
        var craftSheet = findCraft(userDeck);
        if (craftSheet === "ERROR") {
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
                    var paragonDecks = rows[titleRows.Paragon];
                    var secondaryDecks = rows[titleRows.Secondary];
                    var guestDecks = rows[titleRows.Guest];
                    var tournamentDecks = rows[titleRows.Tournament];
                    var paragonLength = Object.keys(paragonDecks).length;
                    var secondaryLength = Object.keys(secondaryDecks).length;
                    var guestLength = Object.keys(guestDecks).length;
                    var tournamentLength = Object.keys(tournamentDecks).length;
                    if (args.length === 1) {
                        //List all the matchups for that deck
                        var matchupList = [];
                        for (var c = 2; c <= paragonLength; c++) {
                            var currDeck = checkMap(rows[titleRows.Paragon + 2][[c]]);
                            if (checkMap(paragonDecks[[c]]) === userDeck && matchupList.indexOf(currDeck) === -1) {
                                matchupList.push(currDeck);
                            }
                        }
                        for (var c = 2; c <= secondaryLength; c++) {
                            var currDeck = checkMap(rows[titleRows.Secondary + 2][[c]]);
                            if (checkMap(secondaryDecks[[c]]) === userDeck && matchupList.indexOf(currDeck) === -1) {
                                matchupList.push(currDeck);
                            }
                        }
                        for (var c = 2; c <= guestLength; c++) {
                            var currDeck = checkMap(rows[titleRows.Guest + 2][[c]]);
                            if (checkMap(guestDecks[[c]]) === userDeck && matchupList.indexOf(currDeck) === -1) {
                                matchupList.push(currDeck);
                            }
                        }
                        for (var c = 2; c <= tournamentLength; c++) {
                            var currDeck = checkMap(rows[titleRows.Tournament + 2][[c]]);
                            if (checkMap(tournamentDecks[[c]]) === userDeck && matchupList.indexOf(currDeck) === -1) {
                                matchupList.push(currDeck);
                            }
                        }
                        var dMessage = "Here are the matchups I found for " + args[0] + ": ";
                        if (matchupList.length === 0) {
                            dMessage += "None";
                        }
                        for (var i = 0; i < matchupList.length; i++) {
                            dMessage += matchupList[i];
                            if (i != matchupList.length - 1) {
                                dMessage += ", ";
                            }
                        }
                        dMessage += ".";
                        message.channel.send(dMessage);
                    }
                    else if (args.length === 2) {
                        var comments = "";
                        var winFirst = 0;
                        var lossFirst = 0;
                        var winSecond = 0;
                        var lossSecond = 0;
                        for (var c = 2; c <= paragonLength; c++) {
                            var currDeck = checkMap(rows[titleRows.Paragon + 2][[c]]);
                            if (checkMap(paragonDecks[[c]]) === userDeck && currDeck === oppDeck) {
                                //Check which category the match is under
                                if (rows[titleRows.Paragon + 3][c] === "Win") {
                                    if (rows[titleRows.Paragon + 4][c] === "First") {
                                        winFirst++;
                                    }
                                    else {
                                        winSecond++;
                                    }
                                }
                                else {
                                    if (rows[titleRows.Paragon + 4][c] === "First") {
                                        lossFirst++;
                                    }
                                    else {
                                        lossSecond++;
                                    }
                                }
                            }
                        }
                        for (var c = 2; c <= secondaryLength; c++) {
                            var currDeck = checkMap(rows[titleRows.Secondary + 2][[c]]);
                            if (checkMap(secondaryDecks[[c]]) === userDeck && currDeck === oppDeck) {
                                //Check which category the match is under
                                if (rows[titleRows.Secondary + 3][c] === "Win") {
                                    if (rows[titleRows.Secondary + 4][c] === "First") {
                                        winFirst++;
                                    }
                                    else {
                                        winSecond++;
                                    }
                                }
                                else {
                                    if (rows[titleRows.Secondary + 4][c] === "First") {
                                        lossFirst++;
                                    }
                                    else {
                                        lossSecond++;
                                    }
                                }
                            }
                        }
                        for (var c = 2; c <= guestLength; c++) {
                            var currDeck = checkMap(rows[titleRows.Guest + 2][[c]]);
                            if (checkMap(guestDecks[[c]]) === userDeck && currDeck === oppDeck) {
                                //Check which category the match is under
                                if (rows[titleRows.Guest + 3][c] === "Win") {
                                    if (rows[titleRows.Guest + 4][c] === "First") {
                                        winFirst++;
                                    }
                                    else {
                                        winSecond++;
                                    }
                                }
                                else {
                                    if (rows[titleRows.Guest + 4][c] === "First") {
                                        lossFirst++;
                                    }
                                    else {
                                        lossSecond++;
                                    }
                                }
                            }
                        }
                        for (var c = 2; c <= tournamentLength; c++) {
                            var currDeck = checkMap(rows[titleRows.Tournament + 2][[c]]);
                            if (checkMap(tournamentDecks[[c]]) === userDeck && currDeck === oppDeck) {
                                //Check which category the match is under
                                if (rows[titleRows.Tournament + 3][c] === "Win") {
                                    if (rows[titleRows.Tournament + 4][c] === "First") {
                                        winFirst++;
                                    }
                                    else {
                                        winSecond++;
                                    }
                                }
                                else {
                                    if (rows[titleRows.Tournament + 4][c] === "First") {
                                        lossFirst++;
                                    }
                                    else {
                                        lossSecond++;
                                    }
                                }
                            }
                        }
                        var wlFirst;
                        var wlSecond;
                        if (winFirst + lossFirst === 0) {
                            wlFirst = "N/A";
                        }
                        else {
                            wlFirst = (100 * winFirst / (winFirst + lossFirst)).toFixed(2) + "%";
                        }
                        if (winSecond + lossSecond === 0) {
                            wlSecond = "N/A";
                        }
                        else {
                            wlSecond = (100 * winSecond / (winSecond + lossSecond)).toFixed(2) + "%";
                        }
                        var ret = "W/L Ratio going first: " + wlFirst + "\nW/L Ratio going second: " + wlSecond;
                        message.channel.send(ret);
                        return;

                    }
                    else if (args.length === 3) {
                        message.channel.send("Under construction");
                        return;
                    }
                });
            });
    }

    else if (command === "format") {
        var sayMessage = "Format: +log;<class>;<role>;<format>;<deck title>;<link to decklist>;<opponent deck>;<Win/Loss>;<First/Second>;<Justification>;<Changes made from previous decks>;<Insight/Reflection>;<Link to video (if any)>\nExample: +log;Portalcraft;Paragon;Rotation;Artifact;sv.bagoum/idontknow;Shitty Ginger Rune;Win;Second;Ginger Rune sucks lmao;None;Skillverse;N/A";
        //const example = "example: +log/Portalcraft/Paragon/Rotation/10/5/15/Artifact/sv.bagoum/idontknow/Shitty Ginger Rune/Win/Second/Ginger Rune sucks lmao/None/Skillverse/N/A";
        var shortVer = "+log;Rune;S;R;Miracle Rune;sv.bagoum.com/db/7ho;Ramp Dragon;W;2;I don't know how I won; ; ;";
        sayMessage += "\nShort version: " + shortVer;
        message.channel.send(sayMessage);
        //message.channel.send(example);
        return;
    }

    else if (command === "log") {
        //Make sure they gave enough arguments cause they can't count
        if (args.length != 12 && args.length != 11) {
            message.channel.send("ERROR! Expected 11-12 arguments, got: " + args.length);
            return;
        }
        for (var i = 0; i < args.length; i++) {
            args[i] = checkMap(args[i]);
        }
        var d = new Date();
        var day = d.getDate();
        var year = d.getFullYear();
        var month = d.getMonth() + 1;
        var craft = args[0];
        var role = args[1];
        var format = args[2];
        var date = month + "/" + day + "/" + year;
        var deckTitle = args[3];
        var deckLink = args[4];
        var opponentDeck = args[5];
        var result = args[6];
        var turn = args[7];
        var justification = args[8];
        var changes = args[9];
        var insight = args[10];
        var videoLink = "";
        if(args.length === 12) {
            videoLink = args[11];
        }
        //Check for valid craft
        var craftList = new Array("havencraft", "runecraft", "shadowcraft", "forestcraft", "swordcraft", "dragoncraft", "bloodcraft", "portalcraft");
        if (craftList.indexOf(craft.toLowerCase()) === -1) {
            message.channel.send("ERROR! Allowed crafts are Havencraft, Runecraft, Shadowcraft, Forestcraft, Swordcraft, Dragoncraft, Bloodcraft, and Portalcraft. You entered: " + craft);
            return;
        }
        //Check for valid role
        var roleList = new Array("paragon", "secondary", "guest", "tournament");
        if (roleList.indexOf(role.toLowerCase()) === -1) {
            message.channel.send("ERROR! Allowed roles are Paragon, Secondary, Guest, and Tournament. You entered: " + role);
            return;
        }
        //Check for valid format
        var formatList = new Array("rotation", "unlimited");
        if (formatList.indexOf(format.toLowerCase()) === -1) {
            message.channel.send("ERROR! Allowed formats are Rotation and Unlimited. You entered: " + format);
            return;
        }
        //Check for valid result
        var resultList = new Array("win", "loss");
        if (resultList.indexOf(result.toLowerCase()) === -1) {
            message.channel.send("ERROR! Allowed results are Win and Loss. You entered: " + result);
            return;
        }
        var turnList = new Array("first", "second");
        if (turnList.indexOf(turn.toLowerCase()) === -1) {
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
                    var deckName = deckTitle;
                    /*if (deckLink.indexOf("^") === -1) {
                        deckName = "Deck";
                    }
                    else {
                        deckName = deckLink.substring(deckLink.indexOf("^") + 1);
                        deckLink = deckLink.substring(0, deckLink.indexOf("^"));
                    }*/
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
                    if(role.toLowerCase() === "guest") {
                        spreadsheet.add({ [titleRow - 3]: { [col]: message.author.username}});
                    }

                    if (err) throw err;


                    spreadsheet.send({ autoSize: true }, function (err) {
                        if (err) throw err;
                        message.channel.send("Logged!");
                    });
                });
            });
    }

    else {
        return;
    }
});

client.login(process.env.BOT_TOKEN);
