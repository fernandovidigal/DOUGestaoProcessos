const path = require('path');
const fs = require('fs');

const configFileName = 'config.json';

const defaultServerConfig = {
  porta: 3000,
};

if(process.env.PRODUCTION === 'true'){
    exports.databasePath = path.join(path.dirname(process.execPath), '/data/processos.db');
} else {
    exports.databasePath = 'data/processos.db';
}

exports.checkDataDirectory = () => {
    let databasePath = 'data';
    if(process.env.PRODUCTION === 'true'){
        databasePath = path.join(path.dirname(process.execPath), '/data');
    }

    if(!fs.existsSync(databasePath)){
        fs.mkdirSync(databasePath);
    }
}
exports.readConfigFile = () => {
    const path = process.env.PRODUCTION ? path.join(path.dirname(process.execPath), configFileName) : configFileName;

    try {
        if (fs.existsSync(path)) {
            const configString = fs.readFileSync(configFileName);
            return JSON.parse(configString);
        } else {
            this.writeConfigFile();
            return defaultServerConfig;
        }
    } catch(error){
        return defaultServerConfig;
    }
}

exports.writeConfigFile = (jsonData = null) => {
    const jsonString =
      jsonData == null
        ? JSON.stringify(defaultServerConfig)
        : JSON.stringify(jsonData);
    const path = process.env.PRODUCTION === 'true'
      ? path.join(path.dirname(process.execPath), configFileName)
      : configFileName;

    try {
        fs.writeFileSync(path, jsonString);
        return true;
    } catch(error){
        return false;
    }
    
}