import React,{useState,useEffect} from 'react'
import './App.css'
import { hot } from 'react-hot-loader/root'
import { remote } from 'electron'
import {ACTION_STATE, BUTTONS_PARAM, HISTORY_BUFFER, HISTORY_OBJECT,DATABASE_FORMAT,START_END_TIMES} from '../types';
import History from "./components/History/History";
import Buttons from './components/Buttons/Buttons';
import AttCalendar from './components/AttCalendar/AttCalendar';
import AttDetail from './components/AttDetail/AttDetail';

//react
import {Grid,Button} from '@material-ui/core';

//import {getSampleData,setSampleData} from "../data/DatabaseManager";
import db from './datastore';
import Nedb from "nedb";

const App: React.FC = () => {
  const [currentDate,setCurrentDate] = useState("2021/6/11(金)");
  const [restBtnText,setRestBtnText] = useState("休憩開始");
  const [GoOutBtnText,setGoOutBtnText] = useState("外出開始");
  const [history_buff,setHistoryBuff] = useState<HISTORY_OBJECT[]>([]);
  const [att_db_data,setAttDbData] = useState<DATABASE_FORMAT>({date:"",rest_times:[{start:"",end:""}],go_out_times:[{start:"",end:""}],commuting:"",leave_work:""});
  //const [datastore,setDataStore] = useState(db); //もしかしたら必要になるかも

  //history関係
  useEffect(() => {
    //test
    const test_histories:HISTORY_OBJECT[] = [
      {
        date: new Date(2011,6,10,9,0,0),
        action_type: ACTION_STATE.COMMUTING
      },
      {
        date: new Date(2011,6,10,18,0,0),
        action_type: ACTION_STATE.LEAVE_WORK
      },
      {
        date: new Date(2011,6,11,9,0,0),
        action_type: ACTION_STATE.COMMUTING
      },
      {
        date: new Date(2011,6,11,18,0,0),
        action_type: ACTION_STATE.LEAVE_WORK
      }
    ];
    setHistoryBuff(test_histories);
  },[]);
  //出退勤データ関係
  useEffect(() => {
    const current_date = new Date();
    const str_current_date =  "2021/06/24";//current_date.getFullYear() + "/" + ('0'+current_date.getMonth()).slice(-2) + "/" + ('0'+current_date.getDate()).slice(-2);
    console.log("search "+str_current_date);
    db.find({date:str_current_date},(err:Error|null,doc:any[]) => {
      if(err)
      {
        console.log("db.find error occured");
      }
      else
      {
        const data:DATABASE_FORMAT = doc[0];
        //取得したデータベースを配列にセット
        console.log("db.find:"+doc.length);
        console.log(data);
        console.log("date : "+data.date);
        console.log("commuting : "+data.commuting);
        console.log("leave_work : "+data.leave_work);
        for (var item of data.rest_times){
          console.log("rest start:"+item.start+","+"rest end:"+item.end);
        }
        for (var item of data.go_out_times){
          console.log("go out start:"+item.start+","+"go out end:"+item.end);
        }
      }
    })
  },[]);

  const click_commuting_btn = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log("click_commuting_btn");
  }
  const click_leave_work_btn = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log("click_leave_work_btn");
  }
  const click_rest_btn = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log("click_rest_btn");
    if(restBtnText=="休憩開始")
    {
      setRestBtnText("休憩終了");
    }
    else
    {
      setRestBtnText("休憩開始");
    }
  }
  const click_go_out_btn = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log("click_go_out_btn");
    if(GoOutBtnText=="外出開始")
    {
      setGoOutBtnText("外出終了");
    }
    else
    {
      setGoOutBtnText("外出開始");
    }
  }

  return (
    <div className="main-view">
      <Grid container className="grid-top">
        {/*左側の画面 */}
        <Grid item xs={6} className="grid-calendar">
          {/*左上側　Calender表示  */}
          <Grid container className="grid-calendar-top">
            <AttCalendar />
          </Grid>
          {/*左下側　詳細画面表示  */}
          <Grid container className="grid-calendar-bottom">
            <AttDetail date="2021/06/21" commuting_time="9:00" leave_work_time="18:00" rest_time="1:30" go_out_time="2:15" total_work_time="0"/>
          </Grid>
        </Grid>
        {/*右側の画面　上にボタン　下に履歴を表示 */}
        <Grid item xs={6} className="grid-contents">
          {/*ボタンの上の編集しようとしている日付の表示*/}
          <Grid container className="grid-date-line" justify="center" alignItems="center">
            {currentDate}
          </Grid>
          {/*ボタンのレイアウト */}
            <Buttons rest_text={restBtnText} go_out_text={GoOutBtnText}
              commuting_cb={click_commuting_btn} leave_work_cb={click_leave_work_btn}
              rest_cb={click_rest_btn} go_out_cb={click_go_out_btn} />
          {/*履歴の上のヘッダ */}
          <Grid container className="grid-note-header" justify="center" alignItems="center">
            履歴
          </Grid>
          {/*履歴画面 */}
          <Grid container className="grid-note">
            <History buff={history_buff} />
          </Grid>
        </Grid>
      </Grid>
    </div>
  )
}

export default hot(App)
