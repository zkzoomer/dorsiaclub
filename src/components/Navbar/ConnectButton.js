import React, { useState, useEffect } from 'react';
import { FaUserTie, FaWallet, FaUserAltSlash } from "react-icons/fa";
import { network, chainId } from "../../web3config";
import { 
    NavWalletBtn,
    BtnContents,
    NavWalletBtnWrong,
    NavWalletBtnText,
} from "./NavbarElements";

// WHEN YOU CONNECT: connect first, change network seccond
// IF THE WRONG NETWORK IS DETECTED: prompt in the wallet icon

export const ConnectButton = (props) => {
    // eslint-disable-next-line
    const [errorMessage, setErrorMessage] = useState('');

    const eagerConnect = () => {
        if (window.ethereum && window.ethereum.isMetaMask) {
            // Cheeky trick, assume right network, change if not
            props.setChainId(chainId)
            window.ethereum.request({ method: 'eth_accounts' })
            .then((result) => {
                accountChangeHandler(result)
                window.ethereum.request({ method: 'eth_chainId' }).then((_result) => {
                    chainChangedHandler(_result)
                })
                .catch((error) => {
                    setErrorMessage(error.message);
                })
            })
            .catch((error) => {
                setErrorMessage(error.message);
            })
        } else {
            setErrorMessage('Please install MetaMask browser extension to interact');
        }
        
    }

    const handleConnectWallet = () => {
        
        if (window.ethereum && window.ethereum.isMetaMask) {
            // Cheeky trick, assume right network, change if not
            props.setChainId(chainId)
            window.ethereum.request({ method: 'eth_requestAccounts'})
			.then((result) => {
                accountChangeHandler(result);
                window.ethereum.request({ method: 'eth_chainId' }).then((_result) => {
                    chainChangedHandler(_result)
                })
                .catch((error) => {setErrorMessage(error.message)})
			})
			.catch((error) => {
				setErrorMessage('Please install MetaMask browser extension to interact');
			});

		} else {
			setErrorMessage('Please install MetaMask browser extension to interact');
		}
    }

    const networkSwitch = () => {
        if (window.ethereum && window.ethereum.isMetaMask) {
            window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                    {
                        ...network
                    }
                ]
            })
            .catch((error) => {
                setErrorMessage(error.message);
            });
        } else {
            setErrorMessage('Please install MetaMask browser extension to interact');
        }
    }

    const accountChangeHandler = (newAccount) => {
        props.setAccount(newAccount[0]);
    }

    const chainChangedHandler = (newChainId) => {
        props.setChainId(parseInt(newChainId, 16));
    }

    // Listen for account changes
    useEffect(() => {
        if (window.ethereum && window.ethereum.isMetaMask) {
            window.ethereum.on('connect', eagerConnect);
            window.ethereum.on('accountsChanged', accountChangeHandler);
            window.ethereum.on('chainChanged', chainChangedHandler);
        } else {
            setErrorMessage('Please install MetaMask browser extension to interact');
        }
    // eslint-disable-next-line
    }, [])

    return (
        (props.account) ? (
            props.chainId === chainId ? (
                <NavWalletBtn onClick={handleConnectWallet}>
                    <BtnContents>
                        <FaUserTie />
                        <NavWalletBtnText>
                            &nbsp;&nbsp;
                            {props.account &&
                            `${props.account.slice(0, 3)} ${props.account.slice(3,6)} / ${props.account.slice(
                            props.account.length - 4,
                            props.account.length
                            )}`.toUpperCase()}
                        </NavWalletBtnText>
                    </BtnContents>
                </NavWalletBtn>
            ) : (
                <NavWalletBtnWrong onClick={networkSwitch}>
                    <BtnContents>
                        <FaUserAltSlash />
                        <NavWalletBtnText>
                            &nbsp;&nbsp;Wrong Network
                        </NavWalletBtnText>
                    </BtnContents>
                </NavWalletBtnWrong>
            )
        ) : (
            <NavWalletBtn onClick={handleConnectWallet}>
                <BtnContents>
                    <FaWallet /> 
                    <NavWalletBtnText>
                        &nbsp;&nbsp;Connect wallet
                    </NavWalletBtnText>
                </BtnContents>
            </NavWalletBtn>
        )
    )
};
