import { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import AssignmentIcon from '@mui/icons-material/Assignment';
import axios from 'axios'

// needed: due to app script CORS
axios.defaults.headers.post['Content-Type'] = "text/plain";

export default function Home() {
  const [displayName, setDisplayName] = useState("");
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [KOLName, setKOLName] = useState("")
  const [vendorName, setVendorName] = useState("")

  const closeLiff = () => {
    const liff = window.liff;
    liff.closeWindow();
  }

  const insertRow = async () => {
    await axios.post('https://script.google.com/macros/s/AKfycbxSokQ9woEqX550VBvUt4qS6vW4-1kKJtHPGmFdbCApJ_uX4tR5D3hajKNkN7OSp5Jp/exec', {
      type: 'insertSchedule',
      startDate,
      endDate,
      KOLName,
      vendorName
    });
  }

  const onSubmit = async () => {
    try {
      // TODO: success notification
      await insertRow()
      closeLiff()
    } catch (e) {
      // TODO: fail
      console.log(e)
    }
  }

  useEffect(() => {
    // 初始化 LIFF 應用
    liff.init({ liffId: '2006500949-YMqZ2gbp' })
      .then(() => {
        if (!liff.isLoggedIn()) {
          liff.login(); // 如果用戶未登入，則進行登入
        } else {
          getUserProfile(); // 如果已登入，獲取用戶資料
        }
      })
      .catch(err => {
        console.error('LIFF 初始化失敗:', err);
      });

    // 獲取用戶資料
    function getUserProfile() {
      liff.getProfile()
        .then(profile => {
          setDisplayName(profile.displayName);
        })
        .catch(err => {
          console.error('無法獲取用戶資料:', err);
        });
    }
  }, []);
  // 先寫api, 接到數據後, 往excel 插入資料
  // 然後這裡call 那個endpoint
  // 1. 我要開團 2. webhook收到後發一個line 消息 3.點擊liff連結 4. 輸入表單 5. 送出, 關閉liff
  return (
    <Box
      component="form"
      sx={{ m:1, '& .MuiTextField-root': { m: 1, width: '30ch' } }}
      noValidate
      autoComplete="off"
      textAlign="center"
    >
      {/* <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <AssignmentIcon />
        </Avatar>
      </Box> */}
      <div>
        <TextField value={startDate}
          onChange={e => {
            setStartDate(e.target.value)
          }}
          label="檔期開始"
          sx={{ width: '100%' }}
        />
        <TextField value={endDate}
          onChange={e => {
            setEndDate(e.target.value)
          }}
          label="檔期結束"
          sx={{ width: '100%' }}
        />
        <TextField value={KOLName}
        onChange={e => {
          setKOLName(e.target.value)
        }}
          label="KOL"
          sx={{ width: '100%' }}
        />
        <TextField value={vendorName}
        onChange={e => {
          setVendorName(e.target.value)
        }}
          label="廠商"
          sx={{ width: '100%' }}
        />
      </div>
      <Button variant="contained" onClick={onSubmit}>{displayName || 'Abby'} Submit</Button>
    </Box>

  );
}
