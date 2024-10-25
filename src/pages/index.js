import { useEffect, useState } from "react";

export default function Home() {
  const [displayName, setDisplayName] = useState("");

  const closeLiff = () => {
    const liff = window.liff;
    liff.closeWindow();
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
  return (
    <div>
      <h1>{displayName}</h1>
      <button onClick={closeLiff}>關閉</button>
    </div>
  );
}
