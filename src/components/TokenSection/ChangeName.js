import React from 'react';
import './ChangeNameInputBoxes.scss';
import { ethers } from 'ethers';
import { 
    chainId, 
    contract, 
    _provider,
    contractAddress,
    maxNameLength, 
    maxPositionLength,
    updatePrice,
} from '../../web3config'
import { 
    EnabledButton,
    DisabledButton, 
    ButtonWrapper, 
    TextWrapper,
} from './TokenSectionsElements';
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

class ChangeNameSection extends React.Component {

    state = initialState;

    handleChange = event => {

        event.preventDefault();
        if (event.target.name === "name") {
            const nameIsValid = this.validateNameChange(event.target.value);
            if (nameIsValid) {
                let nameError = "";
                this.setState({nameError});

                // Reflect the validated change on input boxes
                this.setState({[event.target.name]: event.target.value});
            }
            
        } else if (event.target.name === "position") {
            const positionIsValid = this.validatePositionChange(event.target.value);
            if (positionIsValid) {
                let positionError = "";
                this.setState({positionError});

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
        if (balance < ethers.utils.formatEther(updatePrice)) {
            this.props.setErrorMessage(['Insufficient funds', 'Make sure your wallet is funded'])
            return false
        }

        if (this.state.name.trim().length > maxNameLength) {
            nameError = "Maximum number of characters reached"
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

                await connectedContract.changeNameAndOrPosition(this.props.id, this.state.name.trim(), this.state.position.trim(), { value: updatePrice })

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

        let buttonEnabled = false;
        if(
            this.props.account &&
            this.props.chainId === chainId &&
            (this.state.name !== "" ||  // Either name or position must be provided
            this.state.position !== "")
        ) {
            buttonEnabled = true
        } else {
            buttonEnabled = false;
        }   

        let buttonComponent = null;
        if (buttonEnabled) {
            buttonComponent = 
                <EnabledButton type="button" disabled={false} onClick={this.handleClick}>
                    {(this.state.awaitingTx) ? <Spinner animation="border" size="sm" /> : "Update Business Card"}
                </EnabledButton>
        } else {
            buttonComponent = 
                <DisabledButton type="button" disabled={true}>
                    Update Business Card
                </DisabledButton>
        }

        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    
                    <TextWrapper>
                        <div className="form__group field">
                            <input 
                                type="input" 
                                className="form__field" 
                                placeholder="New name"
                                name="name"
                                id="name"
                                value={this.state.name}
                                onChange={this.handleChange}
                            />
                            <label htmlFor="name" className="form__label">New name</label>
                            <div style={{ fontSize:12, color: "red", position: 'absolute'}}>
                                {this.state.nameError}
                            </div>
                        </div>
                    </TextWrapper>
                    <TextWrapper>
                        <div className="form__group field">
                            <input 
                                type="input" 
                                className="form__field" 
                                placeholder="New position"
                                name="position"
                                id="position"
                                value={this.state.position}
                                onChange={this.handleChange}
                            />
                            <label htmlFor="position" className="form__label">New position</label>
                            <div style={{ fontSize:12, color: "red", position: 'absolute'}}>
                                {this.state.positionError}
                            </div>
                        </div>
                    </TextWrapper>
                    <ButtonWrapper>
                        {buttonComponent}
                        {/* <Button type="submit">
                            Update Business Card
                        </Button> */}
                    </ButtonWrapper>
                </form>
            </div>
        );
    }
};

export default ChangeNameSection;