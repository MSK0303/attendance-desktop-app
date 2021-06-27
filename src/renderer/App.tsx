import React,{useState,useEffect} from 'react'
import './App.css'
import { hot } from 'react-hot-loader/root'
import { remote } from 'electron'
import {ACTION_STATE, BUTTONS_PARAM, HISTORY_BUFFER, HISTORY_OBJECT} from '../types';
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
  const [datastore,setDataStore] = useState(db);

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
    //console.log(history_buff);

    //test
    const docs = [
      {
          "date": "2021/06/24",
          "commuting" : "9:00",
          "leave_work" : "18:00",
          "rest_times" : [
              {
                  "start":"12:00",
                  "end":"13:00"
              }
          ],
          "go_out_times": [
          ]
      },
      {
          "date": "2021/06/25",
          "commuting" : "9:00",
          "leave_work" : "21:00",
          "rest_times" : [
              {
                  "start":"10:00",
                  "end":"10:30"
              },
              {
                  "start":"12:00",
                  "end":"13:00"
              }
          ],
          "go_out_times": [
              {
                  "start":"14:10",
                  "end":"14:30"
              },
              {
                  "start":"18:00",
                  "end":"19:00"
              }
          ]
      }
  ];

  db.find({},(err:Error|null,doc:any[]) => {
    console.log("db.find"+doc.length);
    console.log(doc);
    
    if(!doc.length)
    {
      console.log("db.insert");
      db.insert(docs);
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
