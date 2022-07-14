import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import { Spinner } from 'react-bootstrap';
import { 
    chainId,
    mPlaceAddress,
    mPlaceAbi,
} from '../../web3config';


const Wrapper = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

const CancelText = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding-bottom: 20px;
    font-size: 1.25rem;
    color: var(--main-text);
`

const ButtonWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`

const CancelButton = styled.button`

    display: flex;
    justify-content: center;
    align-items: center;    
    border-radius: 50px;
    background: var(--error);
    white-space: nowrap;
    padding: 14px;
    font-size: 1.25rem;
    color: var(--dark-background);
    font-size: 16px;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    width: 200px;
    filter: drop-shadow(10px 10px 5px rgba(0,0,0,0.5));

    &:hover {
        transition: all 0.3s ease-in-out;
        color: var(--main-text);
        box-shadow:  0 0 0 2px var(--main-text);
    }
`

const DisabledButton = styled.button`

    display: flex;
    justify-content: center;
    align-items: center;    
    border-radius: 50px;
    background: var(--error-alt);
    white-space: nowrap;
    padding: 14px;
    font-size: 1.25rem;
    color: var(--dark-background);
    font-size: 16px;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    width: 200px;
    filter: drop-shadow(10px 10px 5px rgba(0,0,0,0.5));
`

const CancelListingSection = (props) => {
    const [buttonEnabled, setButtonEnabled] = useState(false);
    const [awaitingTx, setAwaitingTx] = useState(false);

    useEffect(() => {
        if(
            props.account &&
            props.chainId === chainId 
        ) {
            setButtonEnabled(true);
        } else {
            setButtonEnabled(false);
        }
    }, [props.account, props.chainId])

    const handleClick = async () => {
        setAwaitingTx(true);

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();    

            const _contract = new ethers.Contract(mPlaceAddress, mPlaceAbi, provider)
            const mPlace = await _contract.connect(signer)

            await mPlace.cancelMarketItem(props.metadata['listing_id'])
            setAwaitingTx(false);
        } catch (err) {
            setAwaitingTx(false);
        }
    }

    const buttonComponent = buttonEnabled ?
            <CancelButton type="button" disabled={false} onClick={handleClick}>
                <div>
                    {(awaitingTx) ? <Spinner animation="border" size="sm" /> : "Cancel Listing"}
                </div>
            </CancelButton>
        :
            <DisabledButton type="button" disabled={true}>
                Cancel Listing
            </DisabledButton>


    return(
        <Wrapper>
            <CancelText>
                You listed this Business Card for: <br />
                {props.metadata['listing_price']} MATIC
            </CancelText>
            <ButtonWrapper>
                {buttonComponent}
            </ButtonWrapper>
        </Wrapper>
    )
}

export default CancelListingSection;