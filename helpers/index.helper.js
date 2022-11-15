const Bcrypt = require('bcrypt');

let GlobalHelper = {};

/* Field Validations if the required fields are not empty */
GlobalHelper.validateFields = (field_data, required_fields) => {
    let response_data = { status: false, result: {}, error: null };

    let sanitized_fields = {};
    let missing_fields = [];

    for(let key of required_fields){
        if(field_data?.[key]){
            sanitized_fields[key] = field_data[key];
        }
        else{
            missing_fields.push(key);
        }
    }

    response_data.status = !missing_fields.length;
    response_data.result = response_data.status ? {sanitized_fields} : {missing_fields};
    response_data.message = response_data.status ? '' : `Missing Fields: ${missing_fields.join(', ')}`;

    if(required_fields.includes("confirm_password") && field_data.password !== field_data.confirm_password){
        response_data.status = false;
        response_data.message += "\nPassword and Confirm Password does not match!";
    }

    return response_data
}

/* Email validation for valid email address format */
GlobalHelper.emailValidation = (email_address) => {
    let email_format = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return !email_address.match(email_format) ? "Invalid email address format!" : "";
}

/* Use bcrypt to encrypt the user's password upon registration */
GlobalHelper.passwordEncryption = (password) => {
    return Bcrypt.hashSync(password, 2);
}

/* Use bcrypt to check if the credentials entered by user are valid/existing */
GlobalHelper.passwordIsValid = (password, hash_password) => {
    return !Bcrypt.compareSync(password, hash_password) ? "Wrong email and password combination" : "";
}

module.exports = GlobalHelper;