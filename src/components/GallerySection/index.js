import React, { useEffect, useState, useRef }  from 'react'
import { contract } from '../../web3config';
import GalleryCard from './GalleryCard';
import { Form } from 'react-bootstrap';
import './checkbox.css';
import {
  PageContainer,
  DividerWrapper,
  DividerLine,
  GalleryContainer,
  SwitchContainer,
  HeadContainer,
} from './GallerySectionElements';
import { Spinner } from 'react-bootstrap';

const Gallery = (props) => {
	const [isSwitchOn, setSwitch] = useState(false);
	const [page, setPage] = useState(1);
	const [totalCards, setTotalCards] = useState([]);  // All the cards that can be shown
	const [loadedCards, setLoadedCards] = useState([]);  // Cards that have been loaded
	const [isLoading, setIsLoading] = useState(false);

	// Variable changes to keep track of
	const prevAccount = usePrevious(props.account);  // Change in account
	const prevPage = usePrevious(page);  // Change in page
	const prevSwitch = usePrevious(isSwitchOn);  // Change in switch
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


			// Change in switch, reset as well
			if (isSwitchOn !== prevSwitch) {

				if(isSwitchOn) {  // Only user owned cards

					setIsLoading(true);
					// Need to get the total balance first
					let _accountBalance = await contract.balanceOf(props.account)
					// Then iterate to get each index
					_accountBalance = parseInt(_accountBalance)
					const _userCards = []
					for (let i=0; i < _accountBalance; i++) {
						let _card = await contract.tokenOfOwnerByIndex(props.account, i);
						_userCards.push(parseInt(_card))
					}
					setTotalCards(_userCards.reverse());
					setLoadedCards([]);

				} else {  // All existing cards

					setIsLoading(true);
					let _totalCards = await contract.totalSupply();
					setTotalCards( Array.from({length: parseInt(_totalCards)}, (_, i) => i + 1).reverse() );
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
  	}, [isSwitchOn, props.account, page, loadedCards, ]); 

	
	return (
		<PageContainer>
			<HeadContainer>
				<SwitchContainer>
				<div>
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
				</div>
				</SwitchContainer>
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