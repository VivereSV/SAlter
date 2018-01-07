// Load up the discord.js library
const Discord = require("discord.js");

//Google spreadsheet stuff
var Spreadsheet = require('edit-google-spreadsheet');

//Globals
var updated = false;
var paragonInfo = [0, 0, 0, 0, 0, 0, 0, 0];
var secondaryInfo = [0, 0, 0, 0, 0, 0, 0, 0];
var guestInfo = [0, 0, 0, 0, 0, 0, 0, 0];
var tournamentInfo = [0, 0, 0, 0, 0, 0, 0, 0];

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

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

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


client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.

  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if (message.author.bot) return;

  //bot_and_salt only
  if (message.channel.name != "bot_and_salt") return;

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

  function update() {
    Spreadsheet.load({
      debug: true,
      spreadsheetName: 'Dawnbreakers Deck Data Log',
      worksheetName: 'SAlter',
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
          for (var r = 1; r <= 4; r++) {
              for (var c = 1; c <= 8; c++) {
                 if (r === 1) {
                    paragonInfo[c - 1] = rows[[r]][[c]];
                 }
                 else if (r === 2) {
                    secondaryInfo[c - 1] = rows[[r]][[c]];
                 }
                 else if (r === 3) {
                    guestInfo[c - 1] = rows[[r]][[c]];
                 }
                 else {
                    tournamentInfo[c - 1] = rows[[r]][[c]];
                 }
              }
          }
          updated = true;
          message.channel.send("Finished updating!");
        });
      });
  }

  // Let's go with a few common example commands! Feel free to delete or change those.

  if (command === "help") {
    const helpful = "+format: get the required format for a log\n+update: update the valid cells. Please note that you must update before logging\n+log: log a match in the database. Please provide proper parameters\n+search: search the database for a deck matchup. Currently under construction";
    /*message.channel.send("+format: get the required format for a log");
    message.channel.send("+update: update the valid cells. Please note that you must update before logging");
    message.channel.send("+log: log a match in the database. Please provide proper parameters");
    message.channel.send("+search: search the database for a deck matchup. Currently under construction");*/
    message.channel.send(helpful);
    return;
  }

  if (command === "update") {
    //console.log(message.author.id);
    update();
    return;
  }
  
  if(command === "fuck") {
    message.channel.send("No");
    return;
  }

  if (command === "search") {
    message.channel.send("I said it was under construction...");
    return;
  }

  if (command === "format") {
    const sayMessage = "+log|<class>|<role>|<format>|<date>|<deck title>|<link to decklist>^<deck name>|<opponent deck>|<Win/Loss>|<First/Second>|<Justification>|<Changes made from previous decks>|<Insight/Reflection>|<Link to video (if any)>\nexample: +log|Portalcraft|Paragon|Rotation|10/5/15|Artifact|sv.bagoum/idontknow^MRPortal|Shitty Ginger Rune|Win|Second|Ginger Rune sucks lmao|None|Skillverse|N/A";
    //const example = "example: +log|Portalcraft|Paragon|Rotation|10/5/15|Artifact|sv.bagoum/idontknow^Wallet Haven|Shitty Ginger Rune|Win|Second|Ginger Rune sucks lmao|None|Skillverse|N/A";
    message.channel.send(sayMessage);
    //message.channel.send(example);
    return;
  }

  if (command === "log") {
    //Make sure it's updated
    if (!updated) {
      message.channel.send("Please call +update first.");
      return;
    }
    //Make sure they gave 13 arguments cause they can't count
    if (args.length != 13) {
      message.channel.send("ERROR! Expected 13 arguments, got: " + args.length);
      return;
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
    //Member permissions
    if(role === "Paragon") {
      if(message.author.id !== paragons[craft]) {
        message.channel.send("ERROR! You are not the " + craft + " Paragon! Care will ban you!");
        return;
      }
    }
    else if(role === "Secondary") {
      if(message.author.id !== secondaries[craft]) {
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
        //Find the column SOMEHOW
        var col = -1;
        //console.log(col);
        var titleRow = 0; //Row for deck title

        //Wow I'm good at coding.
        if (role === "Paragon") {
          titleRow = 22;
          col = paragonInfo[craftMap[craft]];
        }
        else if (role === "Secondary") {
          titleRow = 51;
          col = secondaryInfo[craftMap[craft]];
        }
        else if (role === "Guest") {
          titleRow = 81;
          col = guestInfo[craftMap[craft]];
        }
        else {
          titleRow = 111;
          col = tournamentInfo[craftMap[craft]];
        }
        /*console.log(col);
        console.log(titleRow);*/
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
          //message.channel.send("Row: " + titleRow + " Col: " + col);
          message.channel.send("Logged!");
        });
      })
    updated = false;
  }
});

client.login(process.env.BOT_TOKEN);
