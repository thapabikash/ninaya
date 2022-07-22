const hourlyPipeConverter = (hour = null) => {
    let hr = hour;
    if (hour === 0 || hour === 00) {
        hr = "12 PM (UTC)";
    } else {
        hr = hour >= 12 ? `${hour} PM (UTC)` : `${hour} AM (UTC)`;
    }

    return hr;
};

module.exports = {hourlyPipeConverter};
