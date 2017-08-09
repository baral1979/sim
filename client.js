var rp = require('request-promise'),
    starting_bet = 0.00000002,
    uri = "http://localhost:7799",
    balance = NaN,
    token = "",
    username = "Baral1979",
    last_amount = NaN,
    stop = 0,

    report = {
        max_bet: 0,
        nb_bet: 0,
        wins: 0,
        losses: 0,
        pct: 0,
        win_streak: 0,
        loss_streak: 0,
        long_win_streak: 0,
        long_loss_streak: 0,
        balance: 0,
        last_bet: 0
    };

bet = function(amount) {

    if (stop > 0 && stop <= report.nb_bet) {
        console.log('Stopped after %i spins', stop);
        console.log('\033[2J');
        console.log(report);
        return;
    }

    if (isNaN(balance) || balance > amount) {
        var req = rp.post(uri + "/api/bet");
        var form = req.form();
        form.append('amount', amount);
        form.append('condition', '<');
        form.append('game', 49.5);

        last_amount = amount;

        if (amount > report.max_bet)
            report.max_bet = amount;

        req.then(function(response) {
            var data = JSON.parse(response);

            if (data.return === undefined) {
                console.log('\033[2J');
                console.log(report);
                console.log(data);
                return;
            }

            data = data.return;


            report.nb_bet++;
            report.last_bet = last_amount;

            if (data.roll_number < 49.5) {
                report.wins++;
                report.win_streak++;
                if (report.loss_streak > report.long_loss_streak)
                    report.long_loss_streak = report.loss_streak;
                report.loss_streak = 0;


                bet(starting_bet);
            } else {
                report.losses++;
                report.loss_streak++;
                if (report.win_streak > report.long_win_streak)
                    report.long_win_streak = report.win_streak;
                report.win_streak = 0;
                bet(amount * 2);
            }
            report.balance = data.balance;
            if (report.nb_bet % 100 === 0) {
                console.log('\033[2J');
                console.log(report);
            }

        }).catch(function(err) {

            if (err.response && err.response.body)
                console.log(err.response.body);
            else if (err.response)
                console.log(err.response);
            else console.log(err);

        });

    } else {
        console.log("Done!");
        console.log("Balance:", balance);
        console.log("Amount:", amount);
    }
}


bet(starting_bet);
