
const Mysql = require('mysql')

const { DATABASE } = require('../config/constants');

const DatabaseConnection = Mysql.createConnection(DATABASE);

class DatabaseModel {

    constructor() { }

    /* Function to commmunicate to database */
    executeQuery = (query) => {
        return new Promise((resolve, reject) => {
            DatabaseConnection.query(query, (error, result) => {
                let response_data = { status: false, result: {}, error: null };

                if(error){
                    response_data.error = error;
                }
                else{
                    response_data.status = true;
                    response_data.result = result;
                }

                resolve(response_data);
            });
        });
    }
}

module.exports = DatabaseModel;