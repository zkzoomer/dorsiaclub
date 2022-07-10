import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { 
    chainId, 
    bCardContract, 
    bCardAddress,
    bCardAbi,
    updatePrice,
} from '../../web3config'
import { Spinner } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import './dropdown.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
    SwapDropdownWrapper,
    SwapButtonWrapper,
    StyledDropdownButton,
    SwapNameText,
    SwapNameTextWrapper,
    SpinnerContainer,
    EnabledButton,
    DisabledButton,
} from './TokenSectionsElements';


const SwapNameSection = (props) => {
    const [buttonEnabled, setButtonEnabled] = useState(false);
    const [value, setValue] = useState('Your Business Cards');
    const [ownedCards, setOwnedCards] = useState([]);
    const [awaitingTx, setAwaitingTx] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Smart contracts being used inside the token page
	const bCardContract = new ethers.Contract(bCardAddress, bCardAbi, props.provider);

    const handleSelect = (item) => {
        setValue(item)
    }

    const stylizedTokenNumber = (num) => {
        num = '' + num
        while (num.length < 4) num = "0" + num;
        return '#' + num
    } 

    // Gets the cardId as an integer from the selected card
    const fetchCardId = (selectedCard) => {
        return parseInt(selectedCard.slice(1,5))
    }

    const ownedCardsItems = ownedCards.map((item, index) => {
        return(
            <Dropdown.Item key={index} eventKey={item} variant='dark'>{item}</Dropdown.Item>
        )
    })

    const handleClick = async() => {
        let cardId = fetchCardId(value)

        setAwaitingTx(true);

        try {
            // Check if account has enough funds
            let balance = await props.provider.getBalance(props.account);
            balance = ethers.utils.formatEther(balance)
            if (balance < ethers.utils.formatEther(updatePrice)) {
                props.setErrorMessage(['Insufficient funds', 'Make sure your wallet is funded'])
                const errorMessage = { code: 403, message: 'Insufficient funds'}
                throw errorMessage
            }

            // Gontract for buying
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const contractAbi = require('../../abis/BusinessCard.json')['abi']
            const _contract = new ethers.Contract(bCardAddress, contractAbi, provider)
            const connectedContract = await _contract.connect(signer)

            await connectedContract.swapCards(props.id, cardId, { value: updatePrice })

            // Empty all fields when tx is successful
            setButtonEnabled(false);
            setValue('Your Business Cards');
            setAwaitingTx(false);
        } catch (err) {
            // User can try again
            setAwaitingTx(false);
        } 

    }

    let buttonComponent = null;
    if (buttonEnabled) {
        buttonComponent = 
            <EnabledButton type="button" disabled={false} onClick={handleClick}>
                <div>
                    {(awaitingTx) ? <Spinner animation="border" size="sm" /> : "Swap Business Cards"}
                </div>
                
            </EnabledButton>
    } else {
        buttonComponent = 
            <DisabledButton type="button" disabled={true} >
                Swap Business Cards
            </DisabledButton>
    }

    useEffect(() => {
        
        async function fetchData() {
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
                setButtonEnabled(true);
            } else {
                setButtonEnabled(false);
            }
        }
        fetchData()
    // eslint-disable-next-line
    }, [props.account, props.chainId, value]) 

    return(
        <div>
            <SwapNameTextWrapper>
                <SwapNameText>
                    Select a Business Card to swap name and position with:
                </SwapNameText>
            </SwapNameTextWrapper>
            <SwapDropdownWrapper>
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
            </SwapDropdownWrapper>
            <SwapButtonWrapper>
                {buttonComponent}
            </SwapButtonWrapper>
        </div>
    )
}


export default SwapNameSection;