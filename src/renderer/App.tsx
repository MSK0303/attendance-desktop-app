import React,{useState,useEffect} from 'react'
import './App.css'
import { hot } from 'react-hot-loader/root'
import { remote } from 'electron'

//react
import {Grid} from '@material-ui/core';

const App: React.FC = () => {


  return (
    <div className="main-view">
      <Grid container className="grid-top">
        <Grid item xs={6} className="grid-calender">
          Calender
        </Grid>
        <Grid item xs={6} className="grid-contents">
          <Grid container className="grid-buttons">
            Buttons
          </Grid>
          <Grid container className="grid-note">
            Pre
          </Grid>
        </Grid>
      </Grid>
    </div>
  )
}

export default hot(App)
