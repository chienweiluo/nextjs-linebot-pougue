import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import SendIcon from '@mui/icons-material/Send';
import Snackbar from '@mui/material/Snackbar';
import axios from 'axios'
import { useState } from "react";

export default function BriefMakerPage() {
  const [KOLName, setKOLName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [productName, setProductName] = useState("");
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false);


  const handleClose = () => {
    setOpenSnackbar(false);
  };

  const onSubmit = async () => {
    setLoading(true)
    const payload = {
      type: 'write_brief',
      KOLName,
      brandName,
      productName
    }
    try {
      const res = await axios.post('https://pougue-linebot-web.onrender.com/api/write_brief', payload);
      setBrief(res.data)
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className="root-center-box">
     <Box>
        <img className="logo" src="/briefmaker_logo.webp" alt="logo" />
      </Box>
      {brief ? <Box sx={{ p: 2 }} onClick={() => {
        navigator.clipboard.writeText(brief)
        setOpenSnackbar(true);
        }}>{brief}</Box> :  
        <Box
        component="form"
        sx={{ m: 1, '& .MuiTextField-root': { m: 1, width: '30ch' } }}
        noValidate
        autoComplete="off"
        textAlign="center"
      >
        <TextField placeholder="KOL Name" value={KOLName} onChange={(e) => setKOLName(e.target.value)} />
        <TextField placeholder="品牌名" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
        <TextField placeholder="產品名" value={productName} onChange={(e) => setProductName(e.target.value)} />
      </Box>}
      <LoadingButton
        size="large"
        onClick={onSubmit}
        endIcon={<SendIcon />}
        loading={loading}
        loadingPosition="end"
        variant="contained"
        disabled={!!brief || !KOLName || !brandName || !productName}
      >
        生成Brief
      </LoadingButton>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleClose}
        message="已複製到剪貼簿"
      />
    </Box>
  )
}
