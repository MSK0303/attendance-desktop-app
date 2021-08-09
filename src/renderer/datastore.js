import path from 'path';
import {remote} from 'electron';
import Datastore from 'nedb';

//const db_path = path.join(__dirname,'../data/sample.db');
//C:\Users\backn\Desktop\test
const db_path = path.join(remote.app.getPath('userData'),'/sample6.db');
console.log("db_path:"+db_path);
//DB初期化
export default new Datastore({
    autoload: true,
    filename: db_path,
});