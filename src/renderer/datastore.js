import path from 'path';
import {remote} from 'electron';
import Datastore from 'nedb';

//const db_path = path.join(__dirname,'../data/sample.db');
//C:\Users\backn\Desktop\test
const db_path = path.join(remote.app.getPath('userData'),'/sample.db');
console.log("db_path:"+db_path);
//DBåæå
export default new Datastore({
    autoload: true,
    filename: db_path,
});