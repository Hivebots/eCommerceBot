module.exports = function () {
    bot.dialog('/productExplorer', [
        function (session) {
            //Syntax for faceting results by 'Era'
            var queryString = searchQueryStringBuilder('facet=ParentProductCategoryID', "category");
            performSearchQuery(queryString, function (err, result) {
                if (err) {
                    console.log("Error when faceting by era:" + err);
                } else if (result && result['@search.facets'] && result['@search.facets'].ParentProductCategoryID) {
                    categories = result['@search.facets'].ParentProductCategoryID;
                    var categoryNames = [];
                    //Pushes the name of each era into an array
                    categories.forEach(function (category, i) {
                        categoryNames.push(category['value'] + " (" + category.count + ")");
                    })    
                    //Prompts the user to select the era he/she is interested in
                    builder.Prompts.choice(session, "Which category are you interested in?", categoryNames);
                } else {
                    session.endDialog("I couldn't find any products to show you");
                }
            })
        },

        function (session, results) {
            //Chooses just the era name - parsing out the count
            var category = results.response.entity.split(' ')[0];;

            //Syntax for filtering results by 'era'. Note the $ in front of filter (OData syntax)
            var queryString = searchQueryStringBuilder('$filter=ParentProductCategoryID eq ' + category,  "category");

            performSearchQuery(queryString, function (err, result) {
                if (err) {
                    console.log("Error when faceting by era:" + err);
                } else if (result) {
                    categories = result['value'];
                    var categoryNames = [];
                    //Pushes the name of each era into an array
                    categories.forEach(function (category, i) {
                        categoryNames.push(category['Name']);
                    })  

                     session.userData.categories = categories;

                    //Prompts the user to select the era he/she is interested in
                    builder.Prompts.choice(session, "Which category are you interested in?", categoryNames);
                } else {
                    session.endDialog("I couldn't find any products to show you");
                }
            })
        },


        function (session, results) {
            //Chooses just the era name - parsing out the count
            var categories = session.userData.categories;
            var userChoice = results.response.entity;
            var categoryID = 0;
            categories.forEach(function (category, i) {
                if(category['Name'] == userChoice){
                    categoryID = category['ProductCategoryID'];
                }
            })  

            session.userData.categoryID = categoryID;

            //Syntax for filtering results by 'era'. Note the $ in front of filter (OData syntax)
            var queryString = searchQueryStringBuilder('$filter=ProductCategoryID eq ' + categoryID + '&facet=Color', "product");
                                                        
            performSearchQuery(queryString, function (err, result) {
                if (err) {
                    console.log("Error when faceting by era:" + err);
                } else if (result && result['@search.facets'] && result['@search.facets'].Color) {
                    categories = result['@search.facets'].Color;
                    var categoryNames = [];
                    //Pushes the name of each era into an array
                    categories.forEach(function (category, i) {
                        categoryNames.push(category['value']);
                    })    
                    //Prompts the user to select the era he/she is interested in
                    builder.Prompts.choice(session, "Which colour are you interested in?", categoryNames);
                } else {
                    session.endDialog("I couldn't find any products to show you");
                }
            })
        },

        function (session, results) {
            //Chooses just the era name - parsing out the count
            var categoryID = session.userData.categoryID;
            var colour = results.response.entity;

            //Syntax for filtering results by 'era'. Note the $ in front of filter (OData syntax)
            var queryString = searchQueryStringBuilder("$filter=ProductCategoryID eq " + categoryID + " and Color eq '" + colour + "'", "product");
                                                    
            performSearchQuery(queryString, function (err, result) {
                if (err) {
                    console.log("Error when filtering by genre: " + err);
                } else if (result) {
                    //If we have results send them to the showResults dialog (acts like a decoupled view)
                    session.replaceDialog('/showResults', { result });
                } else {
                    session.endDialog("I couldn't find any products");
                }
            })
        }
    ]);
}
