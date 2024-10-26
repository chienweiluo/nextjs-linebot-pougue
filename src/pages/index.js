import { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import dayjs from 'dayjs';
const format = 'YYYY/MM/DD'
// needed: due to app script CORS
axios.defaults.headers.post['Content-Type'] = "text/plain";
const sleep = ms => new Promise(r => setTimeout(r, ms));

export default function Home() {
  const [displayName, setDisplayName] = useState("");
  const [startDate, setStartDate] = useState(dayjs)
  const [durationFromStartDate, setDurationFromStartDate] = useState(7)
  const [KOLName, setKOLName] = useState("")
  const [vendorName, setVendorName] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const closeLiff = () => {
    const liff = window.liff;
    liff.closeWindow();
  }

  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
  };

  const insertRow = async () => {
    const payload =  {
      type: 'insertSchedule',
      startDate: startDate.format(format),
      endDate: startDate.add(durationFromStartDate, 'days').format(format),
      KOLName,
      vendorName
    }
    await axios.post('https://script.google.com/macros/s/AKfycbxSokQ9woEqX550VBvUt4qS6vW4-1kKJtHPGmFdbCApJ_uX4tR5D3hajKNkN7OSp5Jp/exec', payload);
  }

  const onSubmit = async () => {
    try {
      setLoading(true)
      // TODO: success notification
      // await sleep(3000);
      await insertRow()
      setShowSuccess(true)
      closeLiff()
    } catch (e) {
      // TODO: fail
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 初始化 LIFF 應用
    // liff.init({ liffId: '2006500949-YMqZ2gbp' })
    //   .then(() => {
    //     if (!liff.isLoggedIn()) {
    //       liff.login(); // 如果用戶未登入，則進行登入
    //     } else {
    //       getUserProfile(); // 如果已登入，獲取用戶資料
    //     }
    //   })
    //   .catch(err => {
    //     console.error('LIFF 初始化失敗:', err);
    //   });

    // // 獲取用戶資料
    // function getUserProfile() {
    //   liff.getProfile()
    //     .then(profile => {
    //       setDisplayName(profile.displayName);
    //     })
    //     .catch(err => {
    //       console.error('無法獲取用戶資料:', err);
    //     });
    // }
  }, []);
  // 先寫api, 接到數據後, 往excel 插入資料
  // 然後這裡call 那個endpoint
  // 1. 我要開團 2. webhook收到後發一個line 消息 3.點擊liff連結 4. 輸入表單 5. 送出, 關閉liff
  // TODO: 
  // 1. 成功通知, 失敗通知
  // 2. 把url 跟密鑰藏起來
  // 3. 更新欄位檢測 行數跟名稱是否正確才勾選

  return (
    <Box
      component="form"
      sx={{ m: 1, '& .MuiTextField-root': { m: 1, width: '30ch' } }}
      noValidate
      autoComplete="off"
      textAlign="center"
    >
      <div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="檔期開始"
            value={startDate}
            onChange={handleStartDateChange}
            renderInput={(params) => <TextField disabled={loading} {...params} />}
          />
        </LocalizationProvider>
        <TextField
          label="檔期天數"
          type="number"
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          value={durationFromStartDate}
          onChange={e => {
            setDurationFromStartDate(e.target.value)
          }}
        />
        <TextField value={KOLName}
          onChange={e => {
            setKOLName(e.target.value)
          }}
          disabled={loading}
          label="KOL"
          sx={{ width: '100%' }}
        />
        <TextField value={vendorName}
          onChange={e => {
            setVendorName(e.target.value)
          }}
          disabled={loading}
          label="廠商"
          sx={{ width: '100%' }}
        />
      </div>
      {showSuccess ? <Button sx={{
        transition: 'all .5s linear'
      }} size="small">🎉 🎉 🎉</Button> :
        <LoadingButton
          size="small"
          onClick={onSubmit}
          endIcon={<SendIcon />}
          loading={loading}
          loadingPosition="end"
          variant="contained"
        >
          Submit
        </LoadingButton>}
    </Box>

  );
}
