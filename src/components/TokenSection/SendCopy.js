import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import { Spinner } from 'react-bootstrap';
import { 
    chainId,
    sCardAddress,
    sCardAbi,
} from '../../web3config';

const Wrapper = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

const SendToWrapper = styled.div`
    width: 100%;
    padding-bottom: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 1.25rem;
    color: var(--main-text);
`

const SendText = styled.div`
    padding-bottom: 10px;
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
    width: 250px;
    filter: drop-shadow(10px 10px 5px rgba(0,0,0,0.5));

    &:hover {
        transition: all 0.3s ease-in-out;
        color: var(--highlighted-text);
        box-shadow:  0 0 0 2px var(--highlighted-text);
    }
`

const DisabledSendButton = styled.button`
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

const DividerWrapper = styled.div`
    padding-top: 10px;
    padding-bottom: 10px;
    background-color: var(--light-background);
    height: 1px;
    width: 72%;
`

const DividerLine = styled.hr`
    color: var(--divider);
    height: 1px;
`

const SendCopySection = (props) => {
    const [sendButtonEnabled, setSendButtonEnabled] = useState(false);
    const [awaitingTx, setAwaitingTx] = useState(false);
    const [recipient, setRecipient] = useState("");
    const [recipientError, setRecipientError] = useState("");
    const [receivers, setReceivers] = useState("");

    const addressRegex = /^0x[a-fA-F0-9]{40}$/
    const sCardContract = new ethers.Contract(sCardAddress, sCardAbi, props.provider);

    useEffect(() => {
        if(
            props.chainId === chainId 
        ) {
            setSendButtonEnabled(true);
        } else {
            setSendButtonEnabled(false);
        }
    }, [props.chainId])

    useEffect(() => {
        async function fetchData() {
            const _receivers = await sCardContract.soulboundCardReceivers(props.id)
            setReceivers(_receivers)
        }
        fetchData()
    }, [])

    const handleRecipientChange = (e) => {
        if (e.target.value === "" || addressRegex.test(e.target.value)) {
            setRecipient(e.target.value)
            setRecipientError("")
        } else {
            setRecipient(e.target.value)
            setRecipientError("Not a valid address")
        }
    }

    const handleSendClick = async () => {
        setAwaitingTx(true);
        if(ethers.utils.getAddress(recipient) === ethers.utils.getAddress(props.account)) {
            props.setErrorMessage(['Invalid recipient', 'Cant send Soulbound Card to owner'])
            setAwaitingTx(false);
            setRecipient("")
            return
        }
        // First we check if recipient already received this card
        if(!receivers.includes(ethers.utils.getAddress(recipient))) { 
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();    
                const _contract = new ethers.Contract(sCardAddress, sCardAbi, provider)
                const sCard = await _contract.connect(signer)
                await sCard.sendSoulboundCard(props.account, recipient, props.id)
            } catch(err) {
                console.log(err)
            } finally {
                setAwaitingTx(false);
                setRecipient("")
            }
        } else {
            props.setErrorMessage(['Invalid recipient', 'Address was already sent this Soulbound Card'])
            setAwaitingTx(false);
            setRecipient("")
        }
    }

    const buttonComponent = (sendButtonEnabled && addressRegex.test(recipient)) ? 
        <SendButton type="button" disabled={false} onClick={handleSendClick}>
            <div>
                {(awaitingTx) ? <Spinner animation="border" size="sm" /> : "Send Soulbound Card"}
            </div>
        </SendButton>
    :
        <DisabledSendButton type="button" disabled={true}>
            Send Soulbound Card
        </DisabledSendButton>

    return(
        <Wrapper>
            <SendToWrapper>
                <SendText>
                    Send a copy of this card as a Soulbound Card to:
                </SendText>
                <InputWrapper key='box1'>
                    <div className="input__group field">
                        <input 
                            type="input" 
                            className="form__field" 
                            placeholder="Soulbound Card recipient" 
                            name={1}
                            id={1}
                            required 
                            value={recipient}
                            onChange={handleRecipientChange}
                        />
                        <label htmlFor={1} className="form__label">Soulbound Card recipient</label>
                        <div style={{ fontSize:15, color: "red", position: 'absolute'}}>
                            {recipientError}
                        </div>
                    </div>
                </InputWrapper>
            </SendToWrapper>
            {buttonComponent}
            <DividerWrapper>
                <DividerLine />
            </DividerWrapper>

        </Wrapper>
    )
}

export default SendCopySection;