// HOMEPAGE
import React from 'react'
import MintElements from '../components/MintSection';

const MintPage = (props) => {
    return (
        <>
            <MintElements account={props.account} chainId={props.chainId} setErrorMessage={props.setErrorMessage}/>
        </>
    );
};

export default MintPage
