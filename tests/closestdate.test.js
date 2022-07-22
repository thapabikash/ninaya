const moment = require("moment");
//find nearest date

function main() {
    let publisherAccounts = [
        {
            to_date: "2022-06-03",
        },
        {
            to_date: "2022-06-05",
        },
        {
            to_date: "2022-06-07",
        },
        {
            to_date: "2022-06-11",
        },
        // {
        //     to_date: null,
        // },
    ];
    let publisherAccountsData = replaceNullWithCurrentDate(publisherAccounts);
    let rowDate = "2022-06-05";
    let nearestdate = findNearestDate(rowDate, publisherAccountsData);
    console.log(publisherAccountsData, rowDate, nearestdate);
    accounts = findActualAccount(nearestdate, publisherAccountsData);
    console.log(accounts);
}

function replaceNullWithCurrentDate(data) {
    let convertedAccounts = [];

    for (let date of data) {
        if (date.to_date) {
            convertedAccounts.push({
                convertdate: moment(date.to_date).format("YYYY-MM-DD"),
                ...date,
            });
        } else {
            convertedAccounts.push({
                convertdate: moment().format("YYYY-MM-DD"),
                ...date,
            });
        }
    }

    return convertedAccounts;
}

function findNearestDate(date, dates) {
    let nearestDate = dates[0].convertdate;
    let nearestDateDiff = moment(date).diff(moment(nearestDate));
    for (let i = 1; i < dates.length; i++) {
        let diff = moment(date).diff(moment(dates[i].convertdate));
        if (diff < 0 && nearestDateDiff < 0) {
            if (diff > nearestDateDiff) {
                nearestDate = dates[i].convertdate;
                nearestDateDiff = diff;
            }
        } else {
            if (diff === 0 || diff < nearestDateDiff) {
                nearestDate = dates[i].convertdate;
                nearestDateDiff = diff;
            }
        }
    }
    return nearestDate;
}

function findActualAccount(nearestDate, dates) {
    for (let i = 0; i < dates.length; i++) {
        if (dates[i].convertdate === nearestDate) {
            return dates[i];
        }
    }
    return dates[0];
}

main();
