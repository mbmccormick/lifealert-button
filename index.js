var twilio = require("twilio");

exports.handler = function (event, context, callback) {
    var config = require("./config.json");
    var client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    console.log("Received " + event.clickType + " click event from " + event.serialNumber + ".");

    var profile = null;

    for (var i = 0; i < config.length; i++) {
        var data = config[i];

        if (data.deviceSerialNumber == event.serialNumber) {
            profile = data;
            break;
        }
    }

    if (profile != null) {
        console.log("Found configuration profile for " + profile.senderName + ".");

        for (var i = 0; i < profile.contactPhoneNumbers.length; i++) {
            var contact = profile.contactPhoneNumbers[i];

            console.log("Sending text message to " + contact + ".");

            // send the text message
            client.messages.create({
                to: contact,
                from: process.env.TWILIO_PHONE_NUMBER,
                body: profile.senderName + " has pressed their emergency alert button! Please call them at " + profile.senderPhoneNumber + ". If there is no answer, call 911. " + profile.senderName + "'s address is " + profile.senderAddress + ".",
            }, function (err, message) {
                if (err) {
                    console.log("Text message failure: " + err);
                }
                else {
                    console.log("Text message sent successfully.");
                }
            });

            console.log("Placing outgoing call to " + contact + ".");

            var twiml =
                "<Response>\n" +
                "<Say loop='2'>Attention! " + profile.senderName + " has pressed their emergency alert button! A text message has been sent to your phone with their contact information. Please call them immediately. If there is no answer, call 9 1 1." + "</Say>\n" +
                "</Response>";

            // place the outgoing call
            client.calls.create({
                url: "http://twimlets.com/echo?Twiml=" + encodeURI(twiml),
                to: contact,
                from: process.env.TWILIO_PHONE_NUMBER
            }, function (err, message) {
                if (err) {
                    console.log("Outgoing call failure: " + err);
                }
                else {
                    console.log("Outgoing call placed successfully.");
                }
            });
        }
    }
    else {
        console.log("Could not find configuration profile for this button.");
    }
};
