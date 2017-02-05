module.exports = function () {
    //process.env variables defined in Azure if deployed to a web app. For testing, place IDs and Keys inline
    global.searchName = process.env.AZURE_SEARCH_NAME ? process.env.AZURE_SEARCH_NAME :  "tr24search";
    global.productIndexName = process.env.INDEX_NAME ? process.env.INDEX_NAME : "product-index";
    global.categoryIndexName = process.env.INDEX_NAME ? process.env.INDEX_NAME : "category-index";
    global.searchKey = process.env.AZURE_SEARCH_KEY ? process.env.AZURE_SEARCH_KEY :  "688DEBBFDE0A233D23CCD9D319EA2809";
    
    global.queryStringProduct = 'https://' + searchName + '.search.windows.net/indexes/' + productIndexName + '/docs?api-version=2016-09-01&';
    global.queryStringCategory = 'https://' + searchName + '.search.windows.net/indexes/' + categoryIndexName + '/docs?api-version=2016-09-01&';
}

