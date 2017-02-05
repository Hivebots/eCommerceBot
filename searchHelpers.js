module.exports = function () {
    global.request = require('request');

    global.searchQueryStringBuilder = function (query, searchIndex) {
        if(searchIndex == "product")
        {
            return queryStringProduct + query;
        }
        else if(searchIndex == "category")
        {
            return queryStringCategory + query;
        }       
    }

    global.performSearchQuery = function (queryString, callback) {
        var options = {
            url: queryString,
            headers: {
                'api-key': searchKey
            }
        };


        request(options, function (error, response, body) {
            if (!error && response && response.statusCode == 200) {
                var result = JSON.parse(body);
                callback(null, result);
            } else {
                callback(error, null);
            }
        })
    }
}