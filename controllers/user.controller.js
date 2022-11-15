
const { validateFields, emailValidation } = require('../helpers/index.helper');

const UsersModel = require('../models/users.model');

class UserController {
    #req;
    #res;

    constructor(req, res){
        this.#req = req;
        this.#res = res;
    }

    /* Function to visit and load the homepage */
    homepage = () => {
        if(this.#req.session?.users?.id){
            this.#res.redirect('/wall')
        }
        else{
            this.#res.render('layouts/homepage');
        }
    }

    /* Function to login as a user */
    loginUser = async () => {
        let response_data = { status: false, result: {}, error: null };

        try{
            let validate_fields = validateFields(this.#req.body, ['email_address', 'password']);
            response_data = validate_fields;

            if(validate_fields.status){
                response_data.message = emailValidation(validate_fields.result.sanitized_fields.email_address);
                
                if(!response_data.message){
                    let usersModel = new UsersModel();
                    response_data = await usersModel.loginUser(validate_fields.result.sanitized_fields);

                    this.#req.session.users = response_data.status ? { ...response_data.session} : {};
                }
                else{
                    response_data.status = false;
                }
            }
        }
        catch(error){
            response_data.error = error;
            response_data.message = "Encountered an error upon login."
        }

        this.#res.json(response_data);
    }

    /* Function to register a user */
    registerUser = async () => {
        let response_data = { status: false, result: {}, error: null };

        try{
            let validate_fields = validateFields(this.#req.body, ['first_name', 'last_name', 'email_address', 'password', 'confirm_password']);
            response_data = validate_fields;

            if(validate_fields.status){
                let email_address = validate_fields.result.sanitized_fields.email_address;
                response_data.message = emailValidation(email_address);

                if(!response_data.message){
                    let usersModel = new UsersModel();
                    let {result: [existing_email]} = await usersModel.fetchUserByEmail(email_address, "id, email_address");
                    response_data.message = existing_email?.email_address ? "Email address already taken!" : "";

                    if(!response_data.message){
                        response_data = await usersModel.registerUser(validate_fields.result.sanitized_fields);
                    }
                }
                else{
                    response_data.status = false;
                }
            }
        }
        catch(error){
            response_data.error = error;
            response_data.message = "Encountered an error upon register."
        }

        this.#res.json(response_data);
    }

    logoutUser = () => {
        this.#req.session.destroy();
        this.#res.redirect("/");
    }
}

module.exports = UserController;