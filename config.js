module.exports = function () {
    //process.env variables defined in Azure if deployed to a web app. For testing, place IDs and Keys inline
    global.searchName = process.env.AZURE_SEARCH_NAME ? process.env.AZURE_SEARCH_NAME :  "tr24search";
    global.productIndexName = process.env.INDEX_NAME ? process.env.INDEX_NAME : "product-index";
    global.categoryIndexName = process.env.INDEX_NAME ? process.env.INDEX_NAME : "category-index";
    global.searchKey = process.env.AZURE_SEARCH_KEY ? process.env.AZURE_SEARCH_KEY :  "688DEBBFDE0A233D23CCD9D319EA2809";
    
    global.queryStringProduct = 'https://' + searchName + '.search.windows.net/indexes/' + productIndexName + '/docs?api-version=2016-09-01&';
    global.queryStringCategory = 'https://' + searchName + '.search.windows.net/indexes/' + categoryIndexName + '/docs?api-version=2016-09-01&';

    global.PAYPAL_CLIENT_MODE = "sandbox";
    global.PAYPAL_CLIENT_ID = "AbV9nsEFgXG1Ue3s3BKnp_IByMSUx2cHuj9J-1FwoVJBcrAHulwmOr7nBIum4B8C-CXArQpzQT7jM_Gs";
    global.PAYPAL_CLIENT_SECRET = "ECKkx6c1Iq7sqlFRs27KnIlO4oMSIYRW6N-0mRXOD4QsYlfovkEv3PO78Q7IOXYnZtBeeGC2eveBrmlc";

    global.HOST = process.env.HOST || 'localhost';
    global.PORT = process.env.PORT || process.env.port || 3979;
}

