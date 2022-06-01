import React from 'react'
import TokenPageElements from '../components/TokenSection';

const TokenPage = (props) => {
    return (
        <>
            <TokenPageElements id={props.id} account={props.account} chainId={props.chainId} setErrorMessage={props.setErrorMessage}/>
        </>
    );
};

export default TokenPage;
