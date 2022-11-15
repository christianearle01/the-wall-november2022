const fs = require('fs');
const yaml = require('js-yaml');

let constants = {};

try{
    let env_file = "env.development.yml";
    let file_contents = fs.readFileSync(__dirname+'/'+env_file, 'utf8');
    let contents = yaml.load(file_contents);

    for(let key in contents){
        constants[key] = contents[key];
    }
}
catch(error){
    process.exit(1);
    
}

module.exports = constants;