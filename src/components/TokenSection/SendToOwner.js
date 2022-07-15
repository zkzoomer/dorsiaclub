import React, { useState, useEffect } from 'react';
import { DropdownButton } from 'react-bootstrap';
import { ethers } from 'ethers';
import styled from 'styled-components';
import { Spinner } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import './dropdown.css'
import { 
    chainId,
    sCardAddress,
    sCardAbi,
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

const SendText = styled.div`
    font-size: 1.25rem;
    font-family: 'Royal-Script', serif;
    margin-bottom: 15px;
    text-align: center;
    color: var(--main-text);
`

const BurnText = styled.div`
    font-size: 1.25rem;
    font-family: 'Royal-Script', serif;
    padding-top: 20px;
    text-align: center;
    color: var(--main-text);
`

const InputWrapper = styled.div`
    padding-top: 0px;
    padding-bottom: 15px;
    margin-left: 0%;
    height: 90px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`

const SendButton = styled.button`
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
    width: 100%;
    filter: drop-shadow(10px 10px 5px rgba(0,0,0,0.5));

    &:hover {
        transition: all 0.3s ease-in-out;
        color: var(--highlighted-text);
        box-shadow:  0 0 0 2px var(--highlighted-text);
    }
`

const BurnButton = styled.button`
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
    width: 100%;
    filter: drop-shadow(10px 10px 5px rgba(0,0,0,0.5));

    &:hover {
        transition: all 0.3s ease-in-out;
        color: var(--highlighted-text);
        box-shadow:  0 0 0 2px var(--highlighted-text);
    }
`

const DisabledSendButton = styled.button`
    width: 100%;
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

const DividerWrapper = styled.div`
    padding-top: 10px;
    padding-bottom: 10px;
    background-color: var(--light-background);
    height: 1px;
    width: 400px;
`

const DividerLine = styled.hr`
    color: var(--divider);
    height: 1px;
`

const StyledDropdownButton = styled(DropdownButton)`
    width: 72%; 
    display: flex;
    justify-content: center;
    align-items: center;
    text-overflow: ellipsis;

    @media screen and (max-width: 768px) {
        width: 100%;
    };
`

const ButtonWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 15px;
    width: 50%;

    @media screen and (max-width: 768px) {
        width: 69%;
    };
`

const SpinnerContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`

const SendToOwnerSection = (props) => {
    const [sendButtonEnabled, setSendButtonEnabled] = useState(false);
    const [awaitingTx, setAwaitingTx] = useState(false);
    const [value, setValue] = useState('Your Business Cards');
    const [isLoading, setIsLoading] = useState(false);
    const [ownedCards, setOwnedCards] = useState([]);
    const [receivers, setReceivers] = useState(null);

    const addressRegex = /^0x[a-fA-F0-9]{40}$/
    const bCardContract = new ethers.Contract(bCardAddress, bCardAbi, props.provider);
    const sCardContract = new ethers.Contract(sCardAddress, sCardAbi, props.provider);

    const handleSelect = (item) => {
        setValue(item)
    }

    // Gets the cardId as an integer from the selected card
    const fetchCardId = (selectedCard) => {
        return parseInt(selectedCard.slice(1,5))
    }

    const stylizedTokenNumber = (num) => {
        num = '' + num
        while (num.length < 4) num = "0" + num;
        return '#' + num
    } 

    const handleSendClick = async () => {
        let cardId = fetchCardId(value)
        setAwaitingTx(true);

        try {
            


        } catch (err) {

        } finally {
            setAwaitingTx(false);
        }


    }

    const handleBurnClick = async () => {

    }

    useEffect(() => {
        async function fetchData() {
            // Only sets the list of receivers once
            if (!receivers)  {
                console.log("Props.id: ", props.id)
                const _receivers = await sCardContract.soulboundCardReceivers(props.id)
                setReceivers(_receivers)
            }

            // Only sets the dropdown menu once
            if(!ownedCards.length) {
                try {
                    setIsLoading(true);
                    // Need to get the total balance first
                    let _accountBalance = await bCardContract.balanceOf(props.account)
                    // Then iterate to get each index
                    _accountBalance = parseInt(_accountBalance)
                    const _userCards = []
                    for (let i=0; i < _accountBalance; i++) {
                        let _cardId = await bCardContract.tokenOfOwnerByIndex(props.account, i);
                        if (parseInt(_cardId) === props.id) { continue }; // Skip the token on this page
                        let _cardStats = await bCardContract.tokenStats(_cardId);
                        let _cardName = _cardStats['name']
                        _userCards.push(stylizedTokenNumber(parseInt(_cardId)) + ': ' + _cardName)
                    }
                    setOwnedCards(_userCards.reverse())
                    setIsLoading(false);
                } catch (err) {

                }
            }

            if(
                props.account &&
                props.chainId === chainId &&
                value !== "Your Business Cards"
            ) {
                setSendButtonEnabled(true);
            } else {
                setSendButtonEnabled(false);
            }
        }
        fetchData()
    // eslint-disable-next-line
    }, [props.account, props.chainId, value]) 

    const ownedCardsItems = ownedCards.map((item, index) => {
        return(
            <Dropdown.Item key={index} eventKey={item} variant='dark'>{item}</Dropdown.Item>
        )
    })

    const buttonComponent = sendButtonEnabled ? 
        <SendButton type="button" disabled={false} onClick={handleSendClick}>
            <div>
                {(awaitingTx) ? <Spinner animation="border" size="sm" /> : "Send Soulbound Card"}
            </div>
        </SendButton>
    :
        <DisabledSendButton type="button" disabled={true}>
            Send Soulbound Card
        </DisabledSendButton>

    const burnComponent = !receivers ? 
        <div />   
    :
        receivers.includes(ethers.utils.getAddress(props.account)) ?
        <>
            <DividerWrapper>
                <DividerLine />
            </DividerWrapper>
            <BurnText>
                You received this as a Soulbound Card
            </BurnText>
            <ButtonWrapper>
                <BurnButton type="button" disabled={false} onClick={handleBurnClick}>
                    Burn received card
                </BurnButton>
            </ButtonWrapper>
        </>
        :
            <div />

    return(
        <Wrapper>
            <SendText>
                Send a Soulbound Card to the owner:
            </SendText>
            <StyledDropdownButton 
                title={value} 
                onSelect={handleSelect}
                style={{width: '400px !important' }}
                variant='dark'
            >
                {isLoading ? 
                    <SpinnerContainer><Spinner animation="border"/></SpinnerContainer> : 
                    ownedCardsItems
                }
            </StyledDropdownButton>
            <ButtonWrapper>
                {buttonComponent}
            </ButtonWrapper>
            {burnComponent}
        </Wrapper>
    )
}

export default SendToOwnerSection;