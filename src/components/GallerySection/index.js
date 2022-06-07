import React, { useEffect, useState, useRef }  from 'react'
import { contract } from '../../web3config';
import GalleryCard from './GalleryCard';
import SearchItems from './SearchItems';
import { Form } from 'react-bootstrap';
import './dropdown.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import './checkbox.css';
import {
  PageContainer,
  DividerWrapper,
  DividerLine,
  GalleryContainer,
  SwitchRow,
  HeadContainer,
} from './GallerySectionElements';
import { Spinner } from 'react-bootstrap';

const Gallery = (props) => {
	const [isSwitchOn, setSwitch] = useState(false);
	const [page, setPage] = useState(1);
	const [totalCards, setTotalCards] = useState([]);  // All the cards that can be shown
	const [loadedCards, setLoadedCards] = useState([]);  // Cards that have been loaded
	const [isLoading, setIsLoading] = useState(false);
	const [toSearch, setToSearch] = useState(null);

	// Variable changes to keep track of
	const prevAccount = usePrevious(props.account);  // Change in account
	const prevPage = usePrevious(page);  // Change in page
	const prevSwitch = usePrevious(isSwitchOn);  // Change in switch
	const prevSearch = usePrevious(toSearch);
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
			window.innerHeight + document.documentElement.scrollTop ===
			document.documentElement.offsetHeight
			&&
			!isLoading
		) {
			setPage(page + 1);
		}
	}; 

	const MarketplaceSwitch = () => {
		return(
			<Form>
				<Form.Check 
					disabled={true}
					type="switch"
					id="switcherino"
					label="Marketplace (soon!)"
					checked={false}
				/>
			</Form>
		)
	}

	const OwnedSwitch = () => {
		return(
			<Form>
				<Form.Check 
					disabled={props.account ? false : true}
					type="switch"
					id="switcherino"
					label="Owned Business Cards"
					onChange={() => setSwitch(!isSwitchOn)}
					checked={isSwitchOn}
				/>
			</Form>
		)
	}

	const filterCards = async (filter, _cards) => {

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

			const tokenMetadataURL = await contract.tokenURI(card);
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
		async function fetchData() {
			// Change in account, fully resets Gallery page to loading and showing all Business Cards
			if (props.account !== prevAccount && isSwitchOn) {  // Only if there was a previous account
				setSwitch(false);
				setIsLoading(true);
				let _totalCards = await contract.totalSupply();
				setTotalCards( Array.from({length: parseInt(_totalCards)}, (_, i) => i + 1).reverse() );
				setLoadedCards([]);
				setPage(1);
			}

			// Adds 12 more cards to the list of already loaded ones
			const addLoadedCards = async (toLoad) => {

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
						<GalleryCard id={totalCards[i]} key={totalCards[i]} />
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


			// Change in switch or change in search items
			if (isSwitchOn !== prevSwitch || toSearch !== prevSearch) {

				if(isSwitchOn) {  // Only user owned cards

					setIsLoading(true);
					// Need to get the total balance first
					let _accountBalance = await contract.balanceOf(props.account)
					// Then iterate to get each index
					_accountBalance = parseInt(_accountBalance)
					var _userCards = []
					for (let i=0; i < _accountBalance; i++) {
						let _card = await contract.tokenOfOwnerByIndex(props.account, i);
						_userCards.push(parseInt(_card))
					}

					// MANAGE SEARCH TERMS
					// TODO: make it so that it doesnt do the same request twice, store a card - tokenMetadata key-value pair in the list, feed this to GalleryCard
					if (toSearch) {
						_userCards = await filterCards(toSearch, _userCards);
					}

					setTotalCards(_userCards.reverse());
					setLoadedCards([]);

				} else {  // All existing cards

					setIsLoading(true);
					let _totalCards = await contract.totalSupply();

					// MANAGE SEARCH TERMS
					_totalCards = Array.from({length: parseInt(_totalCards)}, (_, i) => i + 1).reverse()

					if (toSearch) {
						_totalCards = await filterCards(toSearch, _totalCards);
					}

					setTotalCards(_totalCards);
					setLoadedCards([]);

				}

			}


			// There are no loaded cards
			if (loadedCards.length === 0) {
				await addLoadedCards(12);  // Adds 12 more loaded cards
			}


			// Display all biz cards if account disconnects
			if(!props.account && isSwitchOn) { 
				setSwitch(!isSwitchOn)
			}
		}
		fetchData()
	// eslint-disable-next-line
  	}, [isSwitchOn, props.account, page, loadedCards, toSearch]); 

	
	return (
		<PageContainer>
			<HeadContainer>

				<SwitchRow>
					<OwnedSwitch />
					<MarketplaceSwitch />
				</SwitchRow>

				<SearchItems setToSearch={setToSearch}/>
				
				<DividerWrapper>
					<DividerLine />
				</DividerWrapper>
				
			</HeadContainer>
			<GalleryContainer>
				{isLoading ? null : loadedCards}
			</GalleryContainer>
			{isLoading ? <div ><Spinner animation="border"/></div> : null}
		</PageContainer>
		
	)
}


export default Gallery;