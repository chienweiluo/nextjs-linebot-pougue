import React, { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import axios from 'axios'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { chunk } from 'lodash-es';
import dayjs from 'dayjs';

// needed: due to app script CORS
axios.defaults.headers.post['Content-Type'] = "text/plain";


const ScheduleCard = ({
  rowNumber,
  KOLName,
  vendorName,
  startDate,
  endDate,
  onSettle
}) => (
  <React.Fragment>
    <CardContent>
      <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
      {rowNumber}
      </Typography>
      <Typography variant="h6" component="div">
        {KOLName}'s {vendorName}
      </Typography>
      <Typography sx={{ color: 'text.secondary'}} variant="body2">{startDate} ~ {endDate}</Typography>
    </CardContent>
    <CardActions>
      <Button size="small" onClick={onSettle}>Settle</Button>
    </CardActions>
  </React.Fragment>
);


export default function SettlementPage() {
  const currentMonth = dayjs().format('YYYY-MM')
  const [term, setTerm] = useState('')
  const [scheduleList, setScheduleList] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = React.useState(false);
  const [settlementInfo, setSettlementInfo] = React.useState(null);
  const handleClickOpen = ({rowNumber, KOLName, vendorName, startDate}) => {
    setSettlementInfo({rowNumber, KOLName, vendorName, startDate})
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const closeLiff = () => {
    const liff = window.liff;
    liff.closeWindow();
  }

  const setSettlementToScheduleRow = async ({rowNumber, KOLName, vendorName, startDate, settlementNum}) => {
    const payload = {
      type: 'setSettlementToScheduleRow',
      rowNumber,
      startDate,
      KOLName,
      vendorName,
      settlementNum
    }
    
    try {
      const res= await axios.post('https://script.google.com/macros/s/AKfycbxSokQ9woEqX550VBvUt4qS6vW4-1kKJtHPGmFdbCApJ_uX4tR5D3hajKNkN7OSp5Jp/exec', payload);
      console.log(res)
    } catch (e) {
      console.log(e)
    }
  }


  useEffect(() => {
    
    const getScheduleListByMonth = async (month) => {
      setTerm('')
      setLoading(true)
      const payload = {
        type: 'getScheduleListByMonth',
        month // 預期格式為 'YYYY-MM'
      }
      
      try {
        const res = await axios.post('https://script.google.com/macros/s/AKfycbxSokQ9woEqX550VBvUt4qS6vW4-1kKJtHPGmFdbCApJ_uX4tR5D3hajKNkN7OSp5Jp/exec', payload);
        const {scheduleList} = res?.data || {}
        console.log(scheduleList)  
        if (scheduleList) {
          setScheduleList(scheduleList)
          // setSettlementToScheduleRow({
          //   ...scheduleList[0],
          //   settlementNum: 1000
          // })
        }
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    }
    getScheduleListByMonth(selectedMonth)
  }, [selectedMonth]);

  const monthList = Array.from({length: 3}, (_, i) => dayjs().subtract(i, 'month').format('YYYY-MM'))
  const filteredScheduleList = scheduleList.filter(({KOLName, vendorName}) => {
    const lowerCaseTerm = term.toLowerCase()
    return KOLName.toLowerCase().includes(lowerCaseTerm) || vendorName.toLowerCase().includes(lowerCaseTerm)
  })
  const chunkedScheduleList = chunk(filteredScheduleList, Math.floor(filteredScheduleList.length / 2))
  
  return (
  <Box className="root-center-box">
    <Box sx={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{
        height: "200px"
      }}>
        <Box sx={{m: 1, textAlign: 'center'}}>
          <img className="logo" src="/settlement_logo.webp" alt="logo" />
        </Box>
        <Box sx={{mx: 1, display: 'flex'}}>
          <TextField disabled={loading} sx={{
            flexGrow: 1,
            mr: 1 
          }} label="Term" value={term} placeholder="Search KOL or Vendor" onChange={(e) => setTerm(e.target.value)} />
          <Select disabled={loading} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {monthList.map((month) => <MenuItem value={month}>{month}</MenuItem>)}
          </Select>
        </Box>
        </Box>
        <Box sx={{ height: 'calc(100% - 200px)', overflow: 'auto', gap: 1, display: 'flex', m: 1 }}>
            {loading ? <CircularProgress /> : chunkedScheduleList.map((chunked) => {
              return <Box>
                {chunked.map(({rowNumber, KOLName, vendorName, startDate, endDate}) =>
                  <Card variant="outlined" sx={{mb: 1}}>{ ScheduleCard({ rowNumber, KOLName, vendorName, startDate, endDate, onSettle: () => handleClickOpen({
                    rowNumber,
                    KOLName,
                    vendorName,
                    startDate,
                    endDate
                  }) }) }
                  </Card>
                )}
              </Box>
            })}
        </Box>
    </Box>
    <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const settlementNum = formJson.settlementNum;
            console.log(settlementNum);
            const {rowNumber, KOLName, vendorName, startDate} = settlementInfo
            await setSettlementToScheduleRow({rowNumber, KOLName, vendorName, startDate, settlementNum})
            handleClose();
          },
        }}
      >
        <DialogTitle>Settlement for {settlementInfo?.KOLName} ({settlementInfo?.startDate})</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the settlement number for 
            <br/>
            {settlementInfo?.KOLName}'s {settlementInfo?.vendorName}. 
            <br/>
            <Typography sx={{ color: 'text.secondary'}} variant="body2">R:{settlementInfo?.rowNumber}</Typography>
            
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="settlementNum"
            name="settlementNum"
            label="Settlement Number"
            type="number"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Settle</Button>
        </DialogActions>
      </Dialog>
</Box>
  );
}
