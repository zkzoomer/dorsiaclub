import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import { Spinner } from 'react-bootstrap';
import { 
    chainId,
    mPlaceAddress,
    mPlaceAbi,
    _updatePrice,
    bCardAddress,
    bCardAbi,
} from '../../web3config';

const Wrapper = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

const Button = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;    
    border-radius: 50px;
    background: var(--button);
    white-space: nowrap;
    padding: 14px;
    font-size: 1.25rem;
    color: var(--dark-background);
    font-size: 16px;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    width: 250px;
    filter: drop-shadow(10px 10px 5px rgba(0,0,0,0.5));

    &:hover {
        transition: all 0.3s ease-in-out;
        color: var(--highlighted-text);
        box-shadow:  0 0 0 2px var(--highlighted-text);
    }
`

const DisabledButton = styled.button`
    width: 250px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50px;
    background: var(--disabled-button);
    white-space: nowrap;
    padding: 14px;
    color: var(--button-text);
    font-size: 16px;
    outline: none;
    border: none;
`

const ListingWrapper = styled.div`
    padding-bottom: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 1.25rem;
    color: var(--main-text);
`

const ListingText = styled.div`
    padding-bottom: 10px;
`

const InputWrapper = styled.div`

`

const Input = styled.input`
    width: 25%;
    margin: 8px 0;
    background: var(--light-background);
    color: var(--highlighted-text);
    text-align: center;
    box-sizing: border-box;
    border: transparent;
    border-bottom: 1px solid var(--main-text);
  
`

// TODO: no need to approve marketplace smart contract, can be interacted with by default
const CreateListingSection = (props) => {
    const [isApproved, setIsApproved] = useState(false);
    const [buttonEnabled, setButtonEnabled] = useState(false);
    const [awaitingTx, setAwaitingTx] = useState(false);
    const [listingPrice, setListingPrice] = useState("0.05");

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

    const handleApproveClick = async () => {
        setAwaitingTx(true)

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();    
            const _contract = new ethers.Contract(bCardAddress, bCardAbi, provider)
            const bCard = await _contract.connect(signer)
            await bCard.setApprovalForAll(mPlaceAddress, true)

            setIsApproved(true);
        } catch(err) {

        } finally {
            setAwaitingTx(false);
        }
    }

    const handleListingClick = async () => {
        setAwaitingTx(true);
        if(parseFloat(listingPrice) >= _updatePrice) { // Validate that price is above minimum
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();    
                const _contract = new ethers.Contract(mPlaceAddress, mPlaceAbi, provider)
                const mPlace = await _contract.connect(signer)
                await mPlace.createMarketItem(props.id, ethers.utils.parseUnits(listingPrice, "ether").toString())
            } catch(err) {

            } finally {
                setAwaitingTx(false);
            }
        } else {
            props.setErrorMessage(['Price is too low', 'Listing price must be at least 0.05 MATIC'])
            setAwaitingTx(false);
        }
    }

    const onChange = (e) => {
        const re = /^\d+\.?\d{0,2}$/
        if (e.target.value === "" || re.test(e.target.value)) {
            setListingPrice(e.target.value)
        }
    }

    const buttonComponent = props.isApproved || isApproved ? 
        buttonEnabled ?
            <Button type="button" disabled={awaitingTx ? true : false} onClick={handleListingClick}>
                <div>
                    {(awaitingTx) ? <Spinner animation="border" size="sm" /> : "Create Listing"}
                </div>
            </Button>
        :
            <DisabledButton type="button" disabled={true}>
                Create Listing
            </DisabledButton>
    :   
        buttonEnabled ?
            <Button type="button" disabled={false} onClick={handleApproveClick}>
                <div>
                    {(awaitingTx) ? <Spinner animation="border" size="sm" /> : "Approve Marketplace"}
                </div>
            </Button>
        :
            <DisabledButton type="button" disabled={true}>
                Approve Marketplace
            </DisabledButton>        

    // FIRST need to approve the mPlace smart contract
    return(
        <Wrapper>
            <ListingWrapper>
                <ListingText>
                List this Business Card for:
                </ListingText>
                <InputWrapper>
                    <Input value={listingPrice} onChange={onChange}>
                    </Input>
                    &nbsp; MATIC
                </InputWrapper>
            </ListingWrapper>
            {buttonComponent}
        </Wrapper>
    )
}

export default CreateListingSection;