module.exports = function () {
     bot.beginDialogAction('Payment', '/payment', { matches: /^Payment/i });

    bot.dialog('/showResults', [
        function (session, args) {
            var msg = new builder.Message(session).attachmentLayout(builder.AttachmentLayout.carousel);
                args.result['value'].forEach(function (product, i) {
                    msg.addAttachment(
                        new builder.HeroCard(session)
                            .title(product.Name)
                            .subtitle("Product No.: " + product.ProductNumber)
                            .text("Color: " + product.Color + " | " + "Size: " + product.Size + " | " + "Price: $" + product.StandardCost )
                            .buttons([
                                builder.CardAction.openURL(session, "need URL HERE", "Buy Now via Paypal")
                            ])
                    );
                 })
                session.endDialog(msg);
        }
    ])
}