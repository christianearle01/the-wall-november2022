const Mysql = require('mysql');

const { passwordEncryption, passwordIsValid } = require('../helpers/index.helper');

const DatabaseModel = require('./database.model');

class UsersModel extends DatabaseModel {

    constructor(){
        super();
    }

    /* Function to login a users */
    loginUser = async (params) =>{
        let response_data = { status: false, result: {}, error: null };

        try{
            let { result: [user_data] } = await this.fetchUserByEmail(params.email_address, "id, first_name, CONCAT(first_name, ' ', last_name) AS name, email_address, password, created_at") 
            response_data.message = user_data ? passwordIsValid(params.password, user_data.password) : "User does not exist in our database!";

            if(!response_data.message ){
                delete user_data.password;

                response_data.status = true;
                response_data.result = user_data;
                response_data.session = {
                    id: user_data.id,
                    first_name: user_data.first_name,
                    name: user_data.name,
                    date_time: user_data.created_at.toString()
                }
            }
        }
        catch(error){
            response_data.error = error;
            response_data.message = "Failed to login.";
        }

        return response_data;
    }

    /* Function to register a user */
    registerUser = async (params) =>{
        let response_data = { status: false, result: {}, error: null };

        try{
            delete params.confirm_password;
            params.password = passwordEncryption(params.password);

            let register_query = Mysql.format(
                'INSERT INTO users (first_name, last_name, email_address, password, created_at, updated_at) VALUES(?, NOW(), NOW())', 
                [Object.values(params)]
            );

            response_data = await this.executeQuery(register_query);
        }
        catch(error){
            response_data.error = error;
            response_data.message = "Failed to register.";
        }

        return response_data;
    }

    /* Function to fetch user by email */
    fetchUserByEmail = async (email_address, selected_fields = '*') => {
        let response_data = { status: false, result: {}, error: null };

        try{
            let fetch_user_query = Mysql.format(
                `SELECT ${selected_fields} 
                FROM users
                WHERE email_address = ?`,
                [email_address]
            );

            response_data = await this.executeQuery(fetch_user_query);
        }
        catch(error){
            response_data.error = error;
            response_data.message = "Failed to fetch user by email.";
        }

        return response_data;
    }

}

module.exports = UsersModel;