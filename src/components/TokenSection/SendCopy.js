import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import { Spinner } from 'react-bootstrap';
import Select from 'react-select'
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

const SendText = styled.div`
    font-size: 1.25rem;
    font-family: 'Royal-Script', serif;
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
    width: 69%;
    padding-bottom: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
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

const DisabledBurnButton = styled.button`
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50px;
    background: var(--error-alt);
    white-space: nowrap;
    padding: 14px;
    color: var(--dark-background);
    font-size: 16px;
    outline: none;
    border: none;
`

const DividerWrapper = styled.div`
    padding-top: 10px;
    padding-bottom: 20px;
    background-color: var(--light-background);
    height: 1px;
    width: 400px;
`

const DividerLine = styled.hr`
    color: var(--divider);
    height: 1px;
`

const customStyles = {
    control: (provided, state) => ({
        ...provided,
        width: '100%',
        backgroundColor: 'var(--light-background)',
        color: 'red',
        border: '1px solid var(--main-text)',
        boxShadow: 'none',
        '&:hover': {
            border: '1px solid var(--highlighted-text)'
        }
    }),
    placeholder: (provided, state) => ({
        ...provided,
        color: 'var(--main-text)'
    }),
    dropdownIndicator: (provided, state) => ({
        ...provided,
        color: 'var(--main-text)'
        
    }),
    container: (provided, state) => ({
        ...provided,
        width: '100%',
        color: 'var(--main-text)', // E6C229
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: 'var(--light-background)',
        padding: 20,
        color: state.isSelected ? 'var(--error)' : 'var(--main-text)',
        '&:hover': {
            backgroundColor: 'var(--light-background-2)'
        },
    }),
    menuList: (provided, state) => ({
        ...provided,
        padding: 0,
        backgroundColor: 'var(--light-background)',
    }),
    
}

const SendCopySection = (props) => {
    const [sendButtonEnabled, setSendButtonEnabled] = useState(false);
    const [burnButtonEnabled, setBurnButtonEnabled] = useState(false);
    const [awaitingTx, setAwaitingTx] = useState(false);
    const [recipient, setRecipient] = useState("");
    const [recipientError, setRecipientError] = useState("");
    const [toBurn, setToBurn] = useState([]);
    const [receivers, setReceivers] = useState([]);

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

    const listToOptions = (list) => {
        let options = []
        for (let i = 0; i < list.length; i++) {
            const label = `${list[i].slice(0, 3)} ${list[i].slice(3,6)} / ${list[i].slice(
                            list[i].length - 4,
                            list[i].length
                            )}`.toUpperCase()
            options.push({value: list[i], label: label})
        }
        return options
    }

    const handleSendClick = async () => {
        setAwaitingTx(true);
        if(ethers.utils.getAddress(recipient) === ethers.utils.getAddress(props.account)) {
            props.setErrorMessage(['Invalid recipient', 'Cannot send Soulbound Card to owner'])
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
        <SendButton type="button" disabled={awaitingTx ? true : false} onClick={handleSendClick}>
            <div>
                {(awaitingTx) ? <Spinner animation="border" size="sm" /> : "Send Soulbound Card"}
            </div>
        </SendButton>
    :
        <DisabledSendButton type="button" disabled={true}>
            Send Soulbound Card
        </DisabledSendButton>

    const BurnButtonComponent = (props) => {
        const handleBurnClick = async () => {
            const addysToBurn = [];
            props.toBurn.forEach((v) => addysToBurn.push(v['value']))

            // Send corresopnding transaction
            try {
                props.setAwaitingTx(true)
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();    
                const _contract = new ethers.Contract(sCardAddress, sCardAbi, provider)
                const sCard = await _contract.connect(signer)
                await sCard.burnSoulboundCardsOfToken(props.id, addysToBurn)

                // Clear values from receivers and toBurn
                const _receivers = props.receivers.filter(function(value, index, arr) {return !addysToBurn.includes(value)})
                props.setReceivers(_receivers)
                props.setToBurn([]);
            } catch (err) {

            } finally {
                props.setAwaitingTx(false)
            }
        }

        if(props.toBurn.length) {
            return(
                <BurnButton type="button" disabled={props.awaitingTx ? true : false} onClick={handleBurnClick}>
                    <div>
                        {(props.awaitingTx) ? <Spinner animation="border" size="sm" /> : "Burn Selected Cards"}
                    </div>
                </BurnButton>
            )
        } else {
            return(
                <DisabledBurnButton type="button" disabled={true}>
                    Burn Selected Cards
                </DisabledBurnButton>
            )
        }
    }

    const burnComponent = receivers.length ? 
        <>
            <DividerWrapper>
                <DividerLine />
            </DividerWrapper>
            <BurnText>
                You sent this card to {receivers.length} {receivers.length === 1 ? 'address' : 'addresses'}:
            </BurnText>
            {/* <BurnDropdownComponent toBurn={toBurn} setToBurn={setToBurn}/> */}
            <ButtonWrapper>
                <Select
                    styles={customStyles}
                    options={listToOptions(receivers)}
                    placeholder={'Soulbound Card receivers'}
                    isMulti={true}
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    controlShouldRenderValue={false}
                    autoBlur={false}
                    value={toBurn}
                    onChange={(v) => setToBurn(v)}
                />
            </ButtonWrapper>
            <ButtonWrapper>
                <BurnButtonComponent toBurn={toBurn} setToBurn={setToBurn} awaitingTx={awaitingTx} setAwaitingTx={setAwaitingTx} id={props.id} receivers={receivers} setReceivers={setReceivers}/>
            </ButtonWrapper>
        </>
    :   
        <div />


    return(
        <Wrapper>
            <SendText>
                Send this as a Soulbound Card to:
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
                    <div style={{ fontSize:15, color: "red", position: 'absolute'}}>
                        {recipientError}
                    </div>
                </div>
            </InputWrapper>
            <ButtonWrapper>
                {buttonComponent}
            </ButtonWrapper>
            {burnComponent}
        </Wrapper>
    )
}

export default SendCopySection;