import React from 'react';
import Footer from '../components/Footer';
import Gallery from '../components/GallerySection';

const GalleryPage = (props) => {
  return (
    <div>
        <Gallery  account={props.account} chainId={props.chainId} setErrorMessage={props.setErrorMessage}/>
        <Footer />
    </div>
)};

export default GalleryPage;
