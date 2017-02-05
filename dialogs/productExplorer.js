module.exports = function () {
    bot.dialog('/productExplorer', [
        function (session) {
            //Syntax for faceting results by 'ParentProductCategoryID'
            var queryString = searchQueryStringBuilder('facet=ParentProductCategoryID', "category");
            performSearchQuery(queryString, function (err, result) {
                if (err) {
                    console.log("Error when faceting by Parent Product Category:" + err);
                } else if (result && result['@search.facets'] && result['@search.facets'].ParentProductCategoryID) {
                    categories = result['@search.facets'].ParentProductCategoryID;
                    var categoryNames = [];
                    //Pushes the name of each Parent Category into an array
                    categories.forEach(function (category, i) {
                        categoryNames.push(category['value'] + " (" + category.count + ")");
                    })    
                    //Prompts the user to select the Parent Category he/she is interested in
                    builder.Prompts.choice(session, "Which category are you interested in?", categoryNames);
                } else {
                    session.endDialog("I couldn't find anything in that category to show you");
                }
            })
        },

        function (session, results) {
            //Chooses just the Category name - parsing out the count
            var category = results.response.entity.split(' ')[0];;

            //Syntax for filtering results by 'Category'. Note the $ in front of filter (OData syntax)
            var queryString = searchQueryStringBuilder('$filter=ParentProductCategoryID eq ' + category + '&facet=Name', "category");

            performSearchQuery(queryString, function (err, result) {
                if (err) {
                    console.log("Error when faceting by Category to find Product Names:" + err);
                } else if (result && result['@search.facets'] && result['@search.facets'].Name) {
                    categories = result['@search.facets'].Name;
                    var categoryNames = [];
                    //Pushes the name of each product into an array
                    categories.forEach(function (category, i) {
                        categoryNames.push(category['value']);
                    })    
                    //Prompts the user to select the Product Category he/she is interested in
                    builder.Prompts.choice(session, "Which category are you interested in?", categoryNames);
                } else {
                    session.endDialog("I couldn't find any Categories to show you");
                }
            })
        },


        function (session, results) {
            //Chooses just the products with a certain colour via filter - parsing out the count
            var category = results.response.entity.split(' ')[0];;

            //Syntax for filtering results by 'colour'. Note the $ in front of filter (OData syntax)
            var queryString = searchQueryStringBuilder('$filter=ProductCategoryID eq ' + category + '&facet=Color', "product");

            performSearchQuery(queryString, function (err, result) {
                if (err) {
                    console.log("Error when faceting by Colour:" + err);
                } else if (result && result['@search.facets'] && result['@search.facets'].Color) {
                    categories = result['@search.facets'].Color;
                    var categoryNames = [];
                    //Pushes the name of each Product into an array
                    categories.forEach(function (category, i) {
                        categoryNames.push(category['value']);
                    })    
                    //Prompts the user to select the Product he/she is interested in
                    builder.Prompts.choice(session, "Which category are you interested in?", categoryNames);
                } else {
                    session.endDialog("I couldn't find any genres to show you");
                }
            })
        },

        function (session, results) {
            //Chooses just the actual product by name - parsing out the count
            var colour = results.response.entity.split(' ')[0];;

            //Syntax for filtering results by 'product with a colour within a category'. Note the $ in front of filter (OData syntax)
            var queryString = searchQueryStringBuilder('$filter=ProductCategoryID eq ' + category + '&Color=' + colour + "product");

            performSearchQuery(queryString, function (err, result) {
                if (err) {
                    console.log("Error when filtering by genre: " + err);
                } else if (result && result['value'] && result['value'][0]) {
                    //If we have results send them to the showResults dialog (acts like a decoupled view)
                    session.replaceDialog('/showResults', { result });
                } else {
                    session.endDialog("I couldn't find any musicians in that era :0");
                }
            })
        }
    ]);
}
