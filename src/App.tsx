import React, {useState} from 'react';
import QRCode from "react-qr-code";
import './App.css';
import axios from 'axios';
import './Input.css'
import { FaCopy, FaDownload } from 'react-icons/fa';
import Loader from './components/Loader'

const App = () => {

  const [fileName, SetFileName] = useState<string>('Click to upload upto 200 MB');
  const [fileData, SetFileData] = useState<File | null>(null);
  const [fileDownloadUrl, SetFileDownloadUrl] = useState<string>('');
  const [fetchedFileName , SetFetchedFileName] = useState<string>('');
  const [showQR, SetShowQR] = useState<boolean>(false);
  const [btnText, SetBtnText] = useState<string>('Show');
  const [showLoader, SetShowLoader] = useState<boolean>(false);
  const [serverMsg, SetServerMsg] = useState<string | null>(null);
  const [fileSize, SetFileSize] = useState<number>(0);

  const UploadFileToServer = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const formData = new FormData();
    formData.append('file', fileData as File); 
    try {
      SetFileData(null);
      SetShowLoader(true);
      const res = await axios.post(`${process.env.REACT_APP_SERVER_DEVELOPMENT}/post`, formData);
      SetShowLoader(false);
      SetFileDownloadUrl(res.data.downloadLink);
      SetFetchedFileName(fileName);
      SetFileName('Click to upload upto 200 MB');
      SetShowQR(false);
      
      setTimeout(async () => {
        SetFileDownloadUrl('');
        await axios.delete(`${process.env.REACT_APP_SERVER_DEVELOPMENT}/delete/${res.data.fileId}`);
      }, 200000);
    } catch (error) {
      SetServerMsg('Server is overloaded, try again in some time, refreshing in 10 seconds ...');
      console.error('Error uploading file:', error);
      setTimeout(() => {
        window.location.reload();
      }, 10000);

    }
  }
  
  const HandleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(event.target.files || []);
    // Check if files array is not empty
    if (files.length > 0) {
      SetFileName(files[0].name);
      SetFileData(files[0]);
      if (files[0].size <= 215000000) {
        SetFileSize(files[0].size);
      } else {
        SetFileSize(0);
      }
    } else {
      // If no file is selected, reset the state
      SetFileName('Click to upload upto 200 MB');
      SetFileData(null);
      SetShowQR(false);
    }
  } 

  const HandleShowQR = () => {
    if(showQR === false) {
      SetBtnText('Hide');
      SetShowQR(true);
    } else if(showQR === true) {
      SetBtnText('Show');
      SetShowQR(false);
    }
  }

  return (
    <div className="App">
      <h1 className="bold-heading">Files Fly</h1>
      <div className="custom-input-container">
        <label className="custum-file-upload" htmlFor="file">
        <div className="icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="" viewBox="0 0 24 24"><g strokeWidth="0" id="SVGRepo_bgCarrier"></g><g strokeLinejoin="round" strokeLinecap="round" id="SVGRepo_tracerCarrier"></g><g id="SVGRepo_iconCarrier"> <path fill="" d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z" clipRule="evenodd" fillRule="evenodd"></path> </g></svg>
        </div>
        <div className="text">
          <span>{fileName}</span>
          </div>
          <input 
            type="file" 
            id="file" 
            onChange={HandleChange}
            className = 'custom-input'
          />
        </label>
      </div>
      {
        fileData !== null && showLoader === false && fileSize > 0 &&
        <button className="custom-button" onClick={UploadFileToServer}>Upload</button>
      }
      {
        fileData !== null && fileSize === 0 && 
        <div>
          <h2>Upload Limit exceeded 200 MB</h2>
          <h2>Select any other file</h2>
        </div>
      }
      {
        fileDownloadUrl !== '' && fileData === null && showLoader === false &&
        <div>
          <p>Download <strong>{fetchedFileName}</strong> File From given URL or scan QR code to download the file</p>
          <p>file can be downloaded within <strong>3 minutes</strong> of upload Only</p>
          <a href={fileDownloadUrl} className="download-link" download>
          <FaDownload /> Download File
          </a>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <button className="copy-button" onClick={() => navigator.clipboard.writeText(fileDownloadUrl)}>
            <FaCopy /> Copy URL
          </button>
          <br /> <br />
          <button className="custom-button" onClick={HandleShowQR}>{btnText} QR</button>
          {
            showQR &&
            <div>
            <QRCode value={fileDownloadUrl} />
            </div>
          }
        </div>
      }
      {
        showLoader && serverMsg === null &&
        <Loader />
      }
      {
        serverMsg !== null && 
        <h2 className='text-red-500'>{serverMsg}</h2>
      }
    </div>
  );
}

export default App;
