import React, {useState} from 'react';
import QRCode from "react-qr-code";
import './App.css';
import axios from 'axios';

const App = () => {

  const [fileName, SetFileName] = useState<string>('');
  const [fileData, SetFileData] = useState<File | null>(null);
  const [fileDownloadUrl, SetFileDownloadUrl] = useState<string>('');

  const UploadFileToServer = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const formData = new FormData();
    formData.append('file', fileData as File); 
    try {
      const res = await axios.post(`${process.env.REACT_APP_SERVER}/post`, formData);
      SetFileDownloadUrl(res.data.downloadLink);
      setTimeout(async () => {
        await axios.delete(`${process.env.REACT_APP_SERVER}/delete/${res.data.fileId}`);
      }, 300000);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }
  
  const HandleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(event.target.files || []);
    SetFileName(files[0].name);
    SetFileData(files[0]);
  } 

  return (
    <div className="App">
      <h1>Files Fly Too</h1>
        <input
          type = 'file'
          onChange = {HandleChange}
        />
      <button onClick={UploadFileToServer}>Upload</button>
      {fileName !== '' && <h3>{fileName}</h3>}
      {
        fileDownloadUrl !== '' && 
        <div>
          <h4>Download File From this URL or scan QR code (file can be downloaded within 10 minutes Only) :</h4>
          <span>{fileDownloadUrl}</span>
          <br /> <br />
          <div>
            <QRCode value={fileDownloadUrl} />
          </div>
        </div>
      }

    </div>
  );
}

export default App;
