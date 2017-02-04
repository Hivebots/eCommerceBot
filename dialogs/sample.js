module.exports = function () {
    bot.dialog('/sample', [
        function (session) {
            builder.Prompts.confirm(session, "Are you interested in supporting a charity that's local to you or in a particular part of the UK?", { listStyle: builder.ListStyle.button });
        },

        function (session, result) {
            if (result.response) {
                session.userData.locationResult = "yes";
                builder.Prompts.text(session, "Please tell me which city in the UK you'd like me to focus my search on.");            
            } else {
                session.userData.locationResult = "no";
                session.replaceDialog('/');
            }
        },

        function (session, result) {
            var location = result.response;
            console.log('We saved the following location: ' + location);
            session.userData.location = location;
            session.replaceDialog('/');
        }
    ]);
}

