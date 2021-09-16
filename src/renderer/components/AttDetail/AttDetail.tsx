/**
 * @file AttDetail.tsx
 * @brief 出退勤の詳細処理
 * @author Kazuya Yoshihara
 * @date 2021/09/10
 */

import React,{useState,useEffect} from 'react'
import {Grid,Table,TableBody,TableCell,TableContainer,TableRow,Paper} from '@material-ui/core';
import {ATT_DETAIL_PARAM} from '../../../types';
import './AttDetail.css';

/**
 * AttDetail
 * @breif 出退勤の詳細を記述するComponent
 * @param props 詳細情報
 * @returns JSX
 */
const AttDetail = (props:ATT_DETAIL_PARAM) => {
    return (
        <div className="att-detail-top">
            <h2 className="att-detail-date">{props.date}</h2>
            <Grid container justify="center" alignItems="center">
                <Grid item xs={7}>
                    <TableContainer  className="att-detail-table-top">
                        <TableBody>
                            <TableRow>
                                <TableCell align="left" className="att-detail-table-title">出勤時間</TableCell>
                                <TableCell align="right" className="att-detail-table-item">{props.commuting_time!=undefined ? props.commuting_time : ""}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" className="att-detail-table-title">退勤時間</TableCell>
                                <TableCell align="right" className="att-detail-table-item">{props.leave_work_time!=undefined ? props.leave_work_time : ""}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" className="att-detail-table-title">休憩時間(合計)</TableCell>
                                <TableCell align="right" className="att-detail-table-item">{props.rest_time!=undefined ? props.rest_time+"h" : ""}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left" className="att-detail-table-title">外出時間(合計)</TableCell>
                                <TableCell align="right" className="att-detail-table-item">{props.go_out_time!=undefined ? props.go_out_time+"h" : ""}</TableCell>
                            </TableRow>
                        </TableBody>
                    </TableContainer>
                </Grid>
                <Grid item xs={1}></Grid>
                <Grid item xs={3}>
                    <p className="att-detail-total-work-time-title">勤務時間(合計)</p>
                    <p className="att-detail-total-work-time">{props.total_work_time!=undefined?props.total_work_time+"h":"0h"}</p>
                </Grid>
            </Grid>
        </div>
    )
}

export default AttDetail
