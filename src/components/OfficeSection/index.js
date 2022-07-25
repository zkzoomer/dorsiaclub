import React, { useEffect, useState, useRef, memo }  from 'react'
import { ethers } from "ethers"; 
import { 
	bCardAddress, 
	bCardAbi, 
	sCardAddress, 
	sCardAbi, 
	chainId 
} from '../../web3config';
import OfficeCard from './OfficeCard';
import SearchItems from './SearchItems';
import { Form } from 'react-bootstrap';
import './dropdown.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import './checkbox.css';
import {
  PageContainer,
  DividerWrapper,
  DividerLine,
  OfficeContainer,
  SwitchRow,
  SwitchText,
  HeadContainer,
  BlacklistButton,
  BlacklistButtonText
} from './OfficeSectionElements';
import { Spinner } from 'react-bootstrap';

const Office = (props) => {
	const [switchOn, setSwitch] = useState(1);
	const [page, setPage] = useState(1);
	const [totalCards, setTotalCards] = useState([]);  // All the cards that correspond to a given addres
	const [loadedCards, setLoadedCards] = useState([]);  // Cards that have been loaded
	const [isLoading, setIsLoading] = useState(false);
	const [toSearch, setToSearch] = useState(null);

	const [isBlacklisted, setIsBlacklisted] = useState(null);
	const [awaitingTx, setAwaitingTx] = useState(false);

	// Variable changes to keep track of
	const prevAccount = usePrevious(props.account);  // Change in account
	const prevPage = usePrevious(page);  // Change in page
	const prevSwitch = usePrevious(switchOn);  // Change in switch
	const prevSearch = usePrevious(toSearch);

	// Smart contracts being used inside the office page
	const bCardContract = new ethers.Contract(bCardAddress, bCardAbi, props.provider);
    const sCardContract = new ethers.Contract(sCardAddress, sCardAbi, props.provider);

	function usePrevious(value) {
		const ref = useRef();
		useEffect(() => {
			ref.current = value;
		});
		return ref.current;
	}

	// Increases the number of biz cards to load on the page
	window.onscroll = function (e) {
		if (
			(window.innerHeight + window.scrollY) >= document.body.offsetHeight - 90  // Footer is 80 px high
			&&
			!isLoading
		) {
			setPage(page + 1);
		}
	}; 

	const ownedSwitch = (
		<Form>
			<Form.Check 
				disabled={props.account ? false : true}
				type="switch"
				id="switcherino"
				label=""
				onChange={() => setSwitch(!switchOn)}
				checked={switchOn}
			/>
		</Form>
	)
	
	const filterCards = async (filter, _cards, bCardContract) => {

		const checkCardData = async (data, filter, specialFilter) => {
			// Is the Setting, Paper, Coloring, Font, Location from the token metadata in the provided list ?
			const commonAttributes = ['Setting', 'Paper', 'Coloring', 'Font', 'Location'];

			// Iterating over attributes
			let attr = data.attributes;
			let specialAttr = [];
            for (let i = 0; i < attr.length; i++) {
                let _key = attr[i].trait_type
                let _value = attr[i].value

				// Are the common attributes present in the provided list?
                if (commonAttributes.includes(_key)) {
					if (filter[_key].length !== 0) {  // If there is a filter set for this attribute
						if(!filter[_key].includes(_value)){
							return false
						}
					}

                // Special attributes get pushed into a list for comparison later
                } else {
					if (_value) {
                        // Special lettering and shadow work differently -- the value will indicate these special attributes
                        // For the rest, the key indicates the special attribute
                        if (_key === 'Shadow' || _key === 'Special lettering') {
                            specialAttr.push(_value)
                        } else {
                            specialAttr.push(_key)
                        }
                    }
                }
			}

			// Are the special attributes represented AS IS in the token metadata?
			if (specialFilter.length !== 0) {  // If there is a filter set for special attributes

				for (const at of specialFilter) {
					if(!specialAttr.includes(at)) {
						return false
					} 
				}
			}

			return true
		}

		const cards = [];

		let specialFilter = [];
		for (let i = 0; i < filter['Special'].length; i++) {
			let _key = filter['Special'][i].trait_type
			let _value = filter['Special'][i].value

			if (_key === 'Shadow' || _key === 'Special lettering') {
				specialFilter.push(_value)
			} else {
				specialFilter.push(_key)
			}
		}

		for (const card of _cards) {

			const tokenMetadataURL = await bCardContract.tokenURI(card);
			const response = await fetch(tokenMetadataURL);
			const data = await response.json();
			
			// Check if the attribute list is in accordance with the toSearch one
			const passes = await checkCardData(data, filter, specialFilter)
			if (passes) {
				cards.push(card)
			}
		}
		
		return cards
	}

	useEffect(() => {
		let mounted = true

		async function fetchData() {
			// Change in account, fully resets Gallery page to loading and showing all Business Cards
			if (props.account !== prevAccount && props.account) {  // Only if there was a previous account
				setIsLoading(true);
				setSwitch(true);
				let receivedCards = []
				const _receivedCards = await sCardContract.receivedSoulboundCards(props.account);
				_receivedCards.forEach((v) => receivedCards.push(parseInt(v)))
				const _isBlacklisted = await sCardContract.isBlacklisted(props.account)
				setIsBlacklisted(_isBlacklisted);
				setTotalCards(receivedCards.reverse());
				setLoadedCards([])
				setPage(1)
			}

			if (!props.account) {
				setIsBlacklisted(null);
			}

			// Adds 12 more cards to the list of already loaded ones
			const addLoadedCards = async (toLoad) => {
				setIsLoading(true);

				const lastLoadedCard = loadedCards.length;
				// On final go will add all the remaining cards
				if (lastLoadedCard + toLoad > totalCards.length) {
					toLoad = totalCards.length - lastLoadedCard
				}
				if (toLoad <= 0) { // Exit if there is nothing to update
					setIsLoading(false);
					return 
				}  

				const _newLoadedCards = [];
				for (var i = lastLoadedCard; i < lastLoadedCard + toLoad; i++) {
					_newLoadedCards.push(
						<OfficeCard 
							id={totalCards[i]} 
							contract={bCardContract} 
							key={totalCards[i]} 
						/>
					)
				}

				// Add to the loaded cards
				setLoadedCards((prev) => [...prev, ..._newLoadedCards])
				setIsLoading(false);
			}


			if (page !== prevPage && page > 1) {  // Load more items on the page after first go
				setIsLoading(true);
				await addLoadedCards(4);  // Adds 4 more loaded cards
			} 


			// Change in switches or change in search items
			if ((switchOn !== prevSwitch || toSearch !== prevSearch) && props.account) {

				if( switchOn ) {  // Only user received cards

					setIsLoading(true);
					setSwitch(true);
					var receivedCards = []
					const _receivedCards = await sCardContract.receivedSoulboundCards(props.account);
					_receivedCards.forEach((v) => receivedCards.push(parseInt(v)))

					if (toSearch) {
						receivedCards = await filterCards(toSearch, receivedCards, bCardContract);
					}
					
					setTotalCards(receivedCards);
					setLoadedCards([])
					setPage(1)


				} else if ( !switchOn ) {  // User received cards

					setIsLoading(true);
					// Need to get the total balance first
					let _accountBalance = await bCardContract.balanceOf(props.account)
					// Then iterate to get each index
					_accountBalance = parseInt(_accountBalance)
					var sentCards = []
					for (let i=0; i < _accountBalance; i++) {
						let _card = await bCardContract.tokenOfOwnerByIndex(props.account, i);
						let _cardRecipients = await sCardContract.soulboundCardReceivers(parseInt(_card))
						if (_cardRecipients.length) {
							sentCards.push(parseInt(_card))
						}
					}

					if(toSearch) {
						sentCards = await filterCards(toSearch, sentCards, bCardContract)
					}

					setTotalCards(sentCards.reverse());
					setLoadedCards([]);
					setPage(1)

				} 

			}

			// There are no loaded cards
			if (loadedCards.length === 0) {
				await addLoadedCards(12);  // Adds 12 more loaded cards
			}

			// Display all biz cards if account disconnects
			if(!props.account && switchOn) { 
				setSwitch(!switchOn)
			}

			setIsLoading(false);
		}

		if (mounted) {
			fetchData()
		}

		return () => mounted = false;
		
	// eslint-disable-next-line
  	}, [switchOn, props.account, props.provider, page, loadedCards, toSearch]); 

	const handleBlacklisting = async (blacklist) => {
		setAwaitingTx(true);
		try {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();    
			const _contract = new ethers.Contract(sCardAddress, sCardAbi, provider)
			const sCard = await _contract.connect(signer)

			await sCard.setBlacklistForAddress(props.account, blacklist)
			setIsBlacklisted(blacklist);
		} catch(err) {

		} finally {
			setAwaitingTx(false);
		}
	}

	let blacklistComponent;
	if (isBlacklisted === false) {
		blacklistComponent = (
			<BlacklistButton 
				type="button" 
				disabled={(awaitingTx || props.chainId !== chainId) ? true : false} 
				onClick={() => handleBlacklisting(true)}
			>
				<BlacklistButtonText>
					{awaitingTx ? <Spinner animation="border" size="sm" /> : 'GET BLACKLISTED' }
				</BlacklistButtonText>
			</BlacklistButton>
		)
	} else if (isBlacklisted === true) {
		blacklistComponent = (
			<BlacklistButton
				type="button" 
				disabled={(awaitingTx || props.chainId !== chainId) ? true : false}
				onClick={() => handleBlacklisting(false)}
			>
				<BlacklistButtonText>
					{awaitingTx ? <Spinner animation="border" size="sm" /> : 'ACCEPT CARDS' }
				</BlacklistButtonText>
			</BlacklistButton>
		)
	} else {
		blacklistComponent = (
			<BlacklistButton
				type="button" 
				disabled={true}
			>
				<BlacklistButtonText>
					? ? ?
				</BlacklistButtonText>
			</BlacklistButton>
		)
	}
	
	return (
		<PageContainer>
			<HeadContainer>
				{blacklistComponent}
				<SwitchRow>
					<SwitchText>
						Sent
					</SwitchText>
					{ownedSwitch}
					<SwitchText>
						Received
					</SwitchText>
				</SwitchRow>
				<SearchItems setToSearch={setToSearch}/>
				<DividerWrapper>
					<DividerLine />
				</DividerWrapper>
			</HeadContainer>
			{ !props.account ? 'You need to connect your account to see the Soulbound Cards you received' : null }
			<OfficeContainer>
				{ isLoading ? null : loadedCards }
			</OfficeContainer>
			{ isLoading ? <div ><Spinner animation="border"/></div> : null }
		</PageContainer>
		
	)
}


export default Office;