import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import ScrollToTop from './components/ScrollToTop';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MintPage from './pages/mintpage';
import GalleryPage from './pages/gallery';
import OfficePage from './pages/office';
import TokenPage from './pages/tokenpage';
import NotFoundPage from './pages/notfoundpage';
import { Modal } from './components/Modal'

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(0);
  // Array having main message, and submessage -- prompts error to user if set to anything
  const [errorMessage, setErrorMessage] = useState([]); 

  const toggle = () => {
      setIsOpen(!isOpen)
  }

  const numberTokens = 1000;
  const tokenList = Array.from({length: numberTokens}, (_, index) => index + 1);

  // Will then feed the account and chainId to pages that need it: mint, gallery, token
  return (
    <Router>
      <ScrollToTop />
      <Modal 
        showModal={errorMessage.length !== 0 ? true : false} 
        setShowModal={setErrorMessage} 
        modalText={errorMessage}
      />
      <Sidebar 
        isOpen = {isOpen} 
        toggle = {toggle} 
        setIsOpen = {setIsOpen} 
      />
      <Navbar 
        toggle = {toggle} 
        account = {account}
        setAccount = {setAccount}
        chainId = {chainId}
        setChainId = {setChainId}
      />
      <Routes>
        <Route path="/" element={<Home />} exact="true"/>
        <Route path="/gallery" element={<GalleryPage account={account} chainId={chainId} setErrorMessage={setErrorMessage}/>} exact="true"/>
        <Route path="/mint" element={<MintPage account={account} chainId={chainId} setErrorMessage={setErrorMessage}/>} exact="true"/> 
        <Route path="/office" element={<OfficePage />} exact="true"/>
        {
          // Total of a thousand tokens
          tokenList.map(
            (e, i) => 
            <Route 
              key = {i}
              path = {"/card/" + i} 
              element = {<TokenPage key={i} id={i} account={account} chainId={chainId} setErrorMessage={setErrorMessage}/>} 
              account = {account}
              chainId = {chainId}
              exactly 
            />
          )
        }
        <Route path='*' element={<NotFoundPage />} exactly />
      </Routes>
    </Router>
  );
}

export default App;

// https://github.com/dmalvia/React_Responsive_Navbar_Tutorial/blob/master/src/components/Navbar/Navbar.js
// https://medium.com/@mariokandut/style-active-state-of-links-in-styled-components-f747dcf2cc2c