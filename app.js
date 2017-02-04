require('./config.js')();
require('./connectorSetup.js')();
require('./dialogs/sample.js')();

var intents = new builder.IntentDialog();
bot.dialog('/', intents);

bot.endConversationAction('goodbye', 'Goodbye :)', { matches: /^bye/i }); 
bot.beginDialogAction('home', '/start', { matches: /^home/i });
bot.beginDialogAction('help', '/help', { matches: /^help/i }); 

// Entry point of the bot
intents.onDefault(
    function (session) {
        session.replaceDialog('/start');
    }
);

bot.dialog('/start', [
    function (session) {
        var choices = ["Help me find a charity to support", "Let me donate to a charity that I already know"]
        var helloString = "Hi! I'm a Bot and my aim is to help you find a charity that you'd love to support because it's relevant to you in some way, either something you personally care about, or because it's local to you, or both. Start by selecting an option below.";
        builder.Prompts.choice(session, helloString, choices, { listStyle: builder.ListStyle.button });
    },
    function (session, results) {
        if (results.response) {
            var selection = results.response.entity;
            // route to corresponding dialogs
            switch (selection) {
                case "Help me find a charity to support":
                    session.replaceDialog('/sample');
                    break;
                case "Let me donate to a charity that I already know":
                    session.replaceDialog('/sample');
                    break;
                default:
                    session.reset('/');
                    break;
            }
        }
    }
]);

bot.dialog('/help', function (session) {
    session.endDialog("\n* 'home' to start again; \n* 'result' to show previous results; \n* 'search' to start a new search; \n* 'bye' to end conversation");
});

