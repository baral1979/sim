var path = require('path');
var express = require('express');
var app = express();
var port = 7799;
var multer = require('multer');
var upload = multer();

// Require the module
var Random = require('rng')
// Instantiate a new Mersenne Twister with a seed
var mt = new Random.MT();
var bal = 0.00001097;
var initial_bal = bal,
    wins = 0,
    losses = 0;

//return":{"success":"true","username":"Baral1979","id":"13491508030","type":"dice","devise":"btc","ts":1502222007,"time":"19:53:27","amount":"0.00000001","roll_number":77.02,"condition":"<","game":49.5,"payout":2,"winning_chance":49.5,"amount_return":"-0.000000010000","new_balance":"0.00000786","event":false,"notifications":[]}}

app.post('/api/bet', upload.array(), function(req, res) {
    var roll_number = mt.uniform() * 100;

    var amount = parseFloat(req.body.amount);


    var status = 'loss';
    if (amount > bal) {
        res.send({
            status: "out of money",
            balance: bal.toFixed(8),
            bet: amount.toFixed(8)
        });
        return;
    }

    if (req.body.condition === '<' && roll_number < req.body.game) {
        status = 'win';
        bal += amount * 2;
        wins++;
    } else {
        bal -= amount;
        losses++;
    }

    // if (roll_number < req.body.game) {
    //     bal -= req.body.amount;
    //     amount = -amount;
    //     status =
    // } else {
    //     bal += req.body.amount * 2;
    //     amount = amount *2;
    // }

    res.send({
        "return": {
            roll_number: roll_number,
            balance: bal.toFixed(8),
            amount: amount,
            status: status
        },
        "stats": {
            wins: wins,
            loss: losses,
            profit: bal - initial_bal,
            bets: wins + losses,
            pct: wins / (wins + losses),
        }
    });

    res.end();
});

app.listen(port, function() {
    console.log('App running at http://localhost:' + port);
});
