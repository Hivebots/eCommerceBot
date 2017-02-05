module.exports = function () {
    bot.dialog('/productSearch', [
        
        function (session) {
            //Prompt for string input
            builder.Prompts.text(session, "Type in the name of the product you are searching for:");
        },
        function (session, results, next) {
            //Sets name equal to resulting input
            var name = results.response;

            var queryString = searchQueryStringBuilder('search=' + name + '~1', "product");
            performSearchQuery(queryString, function (err, result) {
                if (err) {
                    console.log("Error when searching for product: " + err);
                } else if (result && result['value'] && result['value'][0]) {
                    //If we have results send them to the showResults dialog (acts like a decoupled view)
                    session.replaceDialog('/showResults', { result });
                } else {
                    session.endDialog("No products by the name \'" + name + "\' found");
                    builder.Prompts.confirm(session, "Would you like to search again?", { listStyle: builder.ListStyle.button });
                    next();

                }
            })
        },
        function (session, results) {
        if (results.response) {
            var selection = results.response.entity;
            // route to corresponding dialogs
            switch (selection) {
                case "Yes":
                    session.replaceDialog('/productSearch');
                    break;
                case "No":
                    session.send("Taking you back to home");
                    session.replaceDialog('/promptButtons');
                    break;
                default:
                    session.reset('/');
                    break;
            }
        }
    }

]);
}
