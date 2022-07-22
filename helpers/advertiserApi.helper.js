/**
 * @param {*} obj -
 * @returns String
 */
const apiUrlGenarator = obj => {
    let customURL = ``;
    try {
        customURL = `${obj?.url}?${obj?.params?.token}=${obj?.token}&${obj?.params?.from_date}=${obj?.from_date}&${obj?.params?.to_date}=${obj?.to_date}&${obj?.params?.format}=json&pubid=30104`;
        return customURL;
    } catch (error) {
        console.log("====" + error + "====");
        throw new Error(error.message || error);
    }
};

module.exports = {apiUrlGenarator};
