
module.exports = function () {

    bot.beginDialogAction('Payment', '/payment', { matches: /^Payment/i });

    bot.dialog('/showResults', [
        function (session, args) {
            var returnUrl = createUrl('approvalCompvare', session.message.address);
            var cancelUrl = createUrl('cancelPayment', session.message.address);
            var paymentJson = createPaymentJson(returnUrl, cancelUrl);

            paypal.payment.create(paymentJson, function (error, payment) {
                if (error) {
                    console.log(error);
                    throw error;
                } else {
                    for (var index = 0; index < payment.links.length; index++) {
                        if (payment.links[index].rel === 'approval_url') {
                            var msg = new builder.Message(session).attachmentLayout(builder.AttachmentLayout.carousel);
                            args.result['value'].forEach(function (product, i) {
                                msg.addAttachment(
                                    new builder.HeroCard(session)
                                        .title(product.Name)
                                        .subtitle("Product No.: " + product.ProductNumber)
                                        .text("Color: " + product.Color + " | " + "Size: " + product.Size + " | " + "Price: $" + product.StandardCost )
                                        .buttons([
                                            builder.CardAction.openUrl(session, payment.links[index].href, "Buy Now via Paypal")
                                        ])
                                );
                            })
                            session.endDialog(msg);
                        }
                    }
                }
            });
            
        }
    ]);



// Configure the paypal module with a client id and client secret that you
// generate from https://developer.paypal.com/
paypal.configure({
    'mode': PAYPAL_CLIENT_MODE,
    'client_id': PAYPAL_CLIENT_ID,
    'client_secret': PAYPAL_CLIENT_SECRET
});

// We're using restify here to set up an HTTP server, and create some callbacks that Paypal will hit.
var server = restify.createServer();
server.use(restify.queryParser());

var connector = new builder.ChatConnector({
    appId: undefined,
    appPassword: undefined
});

server.listen(PORT, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// This is a callback that Paypal hits when a user approves a transaction for compvarion.
server.get('approvalCompvare', function (req, res, next) {
    console.log('User approved transaction');
    executePayment(req.params);
    res.end('<html><body>Executing your transaction - you may close this browser tab.</body></html>');
});

// This is a callback that Paypal hits when a user cancels a transaction for compvarion.
server.get('cancelPayment', function (req, res, next) {
    console.log('User cancelled transaction');
    cancelledPayment(req.params);
    res.end('<html><body>Canceling your transaction - you may close this browser tab.</body></html>');
});

// Messages are posted to this endpoint. We ask the connector to listen at this endpoint
// for new messages.
server.post('/api/messages', connector.listen());

/**
 * This function creates and returns an object that is passed through to the PayPal Node SDK 
 * to create a payment that a user must manually approve.
 * 
 * See https://developer.paypal.com/docs/api/payments/#payment_create_request for a description of * the fields.
 */
function createPaymentJson (returnUrl, cancelUrl) {
    return {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": returnUrl,
            "cancel_url": cancelUrl
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Fine",
                    "sku": "ParkingFine",
                    "price": "1.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "1.00"
            },
            "description": "This is your fine. Please pay it :3"
        }]
    };
}

/**
 * This function creates and returns an object that is passed through to the PayPal Node SDK
 * to execute an authorized payment.
 * 
 * See https://developer.paypal.com/docs/api/payments/#payment_execute_request for a description of * the fields.
 */
function executePaymentJson (payerId) {
    return {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "1.00"
            }
        }]
    };
}

/**
 * Generates a URL that Paypal will redirect to on approval or cancellation 
 * of the payment by the user.
 */
function createUrl (path, address) {
    console.log('Creating URL for path: ' + path);

    // The address passed in is an Object that defines the context
    // of the conversation - the user, the channel, the http endpoint the bot
    // exists on, and so on. We encode this information into the return URL
    // to be parsed out by our approval compvarion endpoint.
    var addressEncoded = encodeURIComponent(JSON.stringify(address));

    // This object encodes the endpoint that PayPal redirects to when
    // a user approves the transaction.
    var urlObject = {
        protocol: 'http',
        hostname: HOST,
        port: PORT,
        pathname: path,
        query: { addressEncoded }
    }

    return url.format(urlObject);
}

/**
 * Creates a payment on paypal that a user must approve.
 */
function createAndSendPayment (session) {
    console.log('Creating Payment');

    var returnUrl = createUrl('approvalCompvare', session.message.address);
    var cancelUrl = createUrl('cancelPayment', session.message.address);
    var paymentJson = createPaymentJson(returnUrl, cancelUrl);

    paypal.payment.create(paymentJson, function (error, payment) {
        if (error) {
            console.log(error);
            throw error;
        } else {
            // The SDK returns a payment object when the payment is successfully created. 
            // This object has a few properties, described at length here: 
            // https://developer.paypal.com/docs/api/payments/#payment_create_response
            // We're looking for the 'approval_url' property, which the user must go to
            // to approve the transaction before we can actively execute the transaction.
            for (var index = 0; index < payment.links.length; index++) {
                if (payment.links[index].rel === 'approval_url') {
                    // Ask the user to select an item from a carousel.
                    var msg = new builder.Message(session)
                        .attachmentLayout(builder.AttachmentLayout.carousel)
                        .attachments([
                            new builder.HeroCard(session)
                                .title("Pay via PayPal")
                                .subtitle("Pay for your shopping cart by clicking the button below.")
                                .images([
                                    builder.CardImage.create(session, "https://upload.wikimedia.org/wikipedia/fr/4/46/Paypal_2014_(logo).png")
                                        .tap(builder.CardAction.openUrl(session, payment.links[index].href)),
                                ])
                                .buttons([
                                    builder.CardAction.openUrl(session, payment.links[index].href, "Pay via PayPal"),
                                ]),
                        ]);

                    builder.Prompts.choice(session, msg, "Pay by clicking the button.");
                    // session.send("Pay by clicking this link: " + payment.links[index].href);
                }
            }
        }
    });
};

/**
 * When a payment is approved by the user, we can go ahead and execute it.
 */
function executePayment (parameters) {
    console.log('Executing an Approved Payment');

    // Appended to the URL by PayPal during the approval step.
    var paymentId = parameters.paymentId;
    var payerId = parameters.PayerID;

    // Generate the sample payment execution JSON that paypal requires:
    var paymentJson = executePaymentJson(payerId);

    // Grab the encoded address object, URL decode it, and parse it back into a JSON object.
    var addressEncoded = decodeURIComponent(parameters.addressEncoded);
    var address = JSON.parse(addressEncoded);

    // Finally, execute the payment, and tell the user that we got their payment.
    paypal.payment.execute(paymentId, paymentJson, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log('Payment Executed Successfully');
            respondToUserSuccess(payment, address);
        }
    });
}

/**
 * This function compvares the payment dialog by creating a message, binding an address to it, 
 * and sending it.
 */
function respondToUserSuccess (payment, address) {
    var message = new builder.Message().address(address).text('Thanks for your payment!');

    bot.send(message.toMessage());
}

/**
 * If a user chooses to cancel the payment (on the PayPal approval dialog), we should
 * back via the bot.
 */
function cancelledPayment (parameters) {
    console.log('Cancelled a payment');

    var addressEncoded = decodeURIComponent(parameters.addressEncoded);
    var address = JSON.parse(addressEncoded);
    var message = new builder.Message().address(address).text('Cancelled your payment.');

    bot.send(message.toMessage());
}


}