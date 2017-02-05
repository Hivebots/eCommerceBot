module.exports = function () {
    bot.dialog('/attach', [
        function (session) {
            //Prompt for string input
            builder.Prompts.text(session, "Insert the url of your image:");
        },
        function sendInternetUrl(session, url, contentType, attachmentFileName) {
            var msg = new builder.Message(session)
                .addAttachment({
                    contentUrl: url,
                    contentType: contentType,
                    name: attachmentFileName
                });
    session.send(msg);
}
    ])
}