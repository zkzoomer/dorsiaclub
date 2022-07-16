import React from 'react';
import Footer from '../components/Footer';
import Office from '../components/OfficeSection/index';

const OfficePage = (props) => {
  return (
    <div>
        <Office account={props.account} chainId={props.chainId} provider={props.provider} setErrorMessage={props.setErrorMessage}/>
        <Footer />
    </div>
)};

export default OfficePage;
