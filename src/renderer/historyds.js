import path from 'path';
import {remote} from 'electron';
import Datastore from 'nedb';


const db_path = path.join(remote.app.getPath('userData'),'/sample2_history.db');
console.log("db_path:"+db_path);
//DBåæå
export default new Datastore({
    autoload: true,
    filename: db_path,
});