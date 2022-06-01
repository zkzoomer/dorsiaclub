import React from 'react';
import './InputBoxes.scss';
import { ethers } from 'ethers';
import { 
    chainId, 
    contract, 
    _provider,
    contractAddress,
    maxNameLength, 
    maxPositionLength,
    mintPrice,
} from '../../web3config'
import { 
    EnabledButton,
    DisabledButton, 
    ButtonWrapper, 
    TextWrapper 
} from './MintElements';
import { Spinner } from 'react-bootstrap';

const initialState = {
    name: "",
    position: "",
    nameError: "",
    positionError: "",
    liveName: "",
    livePosition: "",
    awaitingTx: false,
}

class InputBoxes extends React.Component {

    state = initialState;

    handleChange = event => {
        
        event.preventDefault();
        if (event.target.name === "name") {
            const nameIsValid = this.validateNameChange(event.target.value);
            if (nameIsValid) {
                let nameError = "";
                this.setState({nameError});

                // Change the parent live name and position 
                this.props.handleLiveNameChange(event.target.value);
                // Reflect the validated change on input boxes
                this.setState({[event.target.name]: event.target.value});
            }

            
        } else if (event.target.name === "position") {
            const positionIsValid = this.validatePositionChange(event.target.value);
            if (positionIsValid) {
                let positionError = "";
                this.setState({positionError});

                // Change the parent live name and position 
                this.props.handleLivePositionChange(event.target.value);
                // Reflect the validated change on input boxes
                this.setState({[event.target.name]: event.target.value});
            }
        }
    };

    isAlphaNumeric = (str) => {
        var code, i, len;
      
        for (i = 0, len = str.length; i < len; i++) {
          code = str.charCodeAt(i);
          if (
              !(code > 31 && code < 64) && // special characters
              !(code > 64 && code < 91) && // upper alpha (A-Z)
              !(code > 96 && code < 123) // lower alpha (a-z)
            ) { // space (" ")
                return false;
          }
        }
        return true;

    };

    validateNameChange = (newName) => {
        let nameError = "";
        let liveName = "";

        if (newName.length > maxNameLength) {
            nameError = "Maximum number of characters reached"
        }

        if (!this.isAlphaNumeric(newName)) {
            nameError = "Must contain valid characters"
        }
        
        if (nameError) {
            this.setState({nameError})
            return false;
        } else {
            liveName = newName;
            this.setState({liveName})
            return true;
        }
    }

    validatePositionChange = (newPosition) => {
        let positionError = "";
        let livePosition = "";

        
        if (newPosition.length > maxPositionLength) {
            positionError = "Maximum number of characters reached"
        }

        if (!this.isAlphaNumeric(newPosition)) {
            positionError = "Must contain valid characters"
        }
        
        if (newPosition[0] === " ") {
            positionError = "Cannot have leading space"
        }

        if (newPosition[newPosition.length - 1] === " " && newPosition[newPosition.length - 2] === " ") {
            positionError = "Cannot contain continuous spaces"
        }

        if (positionError) {
            this.setState({positionError})
            return false;
        } else {
            livePosition = newPosition;
            this.setState({livePosition})
            return true;
        }
    }

    validate = async () => {
        let nameError = "";
        let positionError = "";

        // Check if account has enough funds
        let balance = await _provider.getBalance(this.props.account);
        balance = ethers.utils.formatEther(balance)
        if (balance < ethers.utils.formatEther(mintPrice)) {
            this.props.setErrorMessage(['Insufficient funds', 'Make sure your wallet is funded'])
            return false
        }

        if (!this.state.name) {
            nameError = "Name cannot be blank";
        }

        if (this.state.name.trim().length > maxNameLength) {
            nameError = "Maximum number of characters reached"
        }

        if (!this.state.position) {
            positionError = "Position cannot be blank";
        }

        if (this.state.position.trim().length > maxPositionLength) {
            positionError = "Maximum number of characters reached"
        }

        /* name already taken, checks the smart contract */
        let _nameTaken = await contract.isNameReserved(this.state.name.trim())
        if (_nameTaken) {
            nameError = "Name is already taken, choose another one"
        }

        if (nameError || positionError) {
            this.setState({nameError, positionError})
            return false;
        }
        
        // All clear - removes errors
        this.setState({nameError, positionError})
        return true;
    };

    
    handleClick = async () => {
        this.setState({ awaitingTx: true })

        const isValid = await this.validate();

        if (isValid) {

            try {
                // Gontract for buying
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();

                const contractAbi = require('../../contracts/BusinessCard/build/contracts/BusinessCard.json')['abi']
                const _contract = new ethers.Contract(contractAddress, contractAbi, provider)
                const connectedContract = await _contract.connect(signer)

                await connectedContract.getCard(this.state.name.trim(), this.state.position.trim(), { value: mintPrice })

                // Empty all fields when tx is successful
                this.setState(initialState);
            } catch (err) {
                // User can try and mint again
                this.setState({ awaitingTx: false })
            } 

        } else {
            this.setState({ awaitingTx: false })
        }
    }

    render () {

        let buttonEnabled = false
        if(
            this.props.account &&
            this.props.chainId === chainId &&
            this.state.name !== "" &&
            this.state.position !== ""
        ) {
            buttonEnabled = true
        } else {
            buttonEnabled = false;
        }   
        
        // Showing clickable button or not
        let buttonComponent = null;
        if (buttonEnabled) {
            buttonComponent = 
                <EnabledButton type="button" disabled={false} onClick={this.handleClick}>
                    {(this.state.awaitingTx) ? <Spinner animation="border" size="sm" /> : "Mint"}
                </EnabledButton>
        } else {
            buttonComponent = 
                <DisabledButton type="button" disabled={true}>
                    Mint
                </DisabledButton>
        }

        // Button gets enabled if connected on the right network, and name and position are filled
        if(
            this.props.account &&
            this.props.chainId === chainId &&
            this.nameFeed !== "" &&
            this.positionFeed !== ""
        ) {
            buttonEnabled = true
        } else {
            buttonEnabled = false;
        }

        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <TextWrapper key='box1'>
                        <div className="form__group field">
                            <input 
                                type="input" 
                                className="form__field" 
                                placeholder={this.props.inputs.placeholder_text_1} 
                                name={this.props.inputs.id_1} 
                                id={this.props.inputs.id_1} 
                                required 
                                value={this.state.name}
                                onChange={this.handleChange}
                            />
                            <label htmlFor={this.props.inputs.id_1} className="form__label">{this.props.inputs.placeholder_text_1}</label>
                            <div style={{ fontSize:15, color: "red", position: 'absolute'}}>
                                {this.state.nameError}
                            </div>
                        </div>
                    </TextWrapper>
                    <TextWrapper key='box2'>
                        <div className="form__group field">
                            <input 
                                type="input" 
                                className="form__field" 
                                placeholder={this.props.inputs.placeholder_text_2} 
                                name={this.props.inputs.id_2} 
                                id={this.props.inputs.id_2} 
                                required 
                                value={this.state.position}
                                onChange={this.handleChange}
                            />
                            <label htmlFor={this.props.inputs.id_2} className="form__label">{this.props.inputs.placeholder_text_2}</label>
                            <div style={{ fontSize:15, color: "red", position: 'absolute'}}>
                                {this.state.positionError}
                            </div>
                        </div>
                    </TextWrapper>
                    <ButtonWrapper>
                        {buttonComponent}
                    </ButtonWrapper>
                    
                </form>
            </div>
        );
    }
};

export default InputBoxes;