require('./config.js')();
require('./connectorSetup.js')();
require('./searchHelpers.js')();
require('./dialogs/productExplorer.js')();
require('./dialogs/productSearch.js')();
require('./dialogs/results.js')();


var intents = new builder.IntentDialog();
bot.dialog('/', intents);

bot.endConversationAction('goodbye', 'Goodbye :)', { matches: /^bye/i }); 
bot.beginDialogAction('home', '/promptButtons', { matches: /^home/i });
bot.beginDialogAction('help', '/help', { matches: /^help/i }); 

// Entry point of the bot
intents.onDefault(
    function (session) {
        session.replaceDialog('/promptButtons');
    }
);

bot.dialog('/promptButtons', [
    function (session) {
        var choices = ["Explorer", "Search"]
        builder.Prompts.choice(session, "How would you like to explore our shop?", choices);
    },
    function (session, results) {
        if (results.response) {
            var selection = results.response.entity;
            // route to corresponding dialogs
            switch (selection) {
                case "Explorer":
                    session.replaceDialog('/productExplorer');
                    break;
                case "Search":
                    session.replaceDialog('/productSearch');
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

