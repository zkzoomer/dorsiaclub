import React from 'react';
import './InputBoxes.scss';
import { ethers } from 'ethers';
import { 
    chainId, 
    bCardAddress,
    bCardAbi,
    maxNameLength, 
    maxPositionLength,
    mintPrice,
} from '../../web3config'
import { 
    ScreenWrapper,
    EnabledButton,
    DisabledButton, 
    ChangeInputButton,
    ButtonWrapper, 
    TextWrapper
} from './MintElements';
import { Spinner } from 'react-bootstrap';
import { 
    FaAngleLeft,
    FaAngleRight
} from 'react-icons/fa'

const initialState = {
    name: "",
    position: "",
    nameError: "",
    positionError: "",
    cardProperties: {
        twitterAccount: "",
        telegramAccount: "",
        telegramGroup: "",
        discordAccount: "",
        discordGroup: "",
        githubAccount: "",
        website: ""
    },
    cardPropertiesError: {
        twitterAccount: null,
        telegramAccount: null,
        telegramGroup: null,
        discordAccount: null,
        discordGroup: null,
        githubAccount: null,
        website: null
    },
    liveName: "",
    livePosition: "",
    screen: 1,
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
        } else {
            let validUpdate = true;
            let errorMessage = null;
            let cardPropertiesError = this.state.cardPropertiesError

            if (event.target.name === 'twitterAccount') {
                const format = /^[a-zA-Z0-9_]*$/;
                if(event.target.value.length < 3) {
                    errorMessage = 'Must be more than 3 characters'
                } else if (event.target.value.length > 15) {
                    errorMessage = 'Must be less than 15 characters'
                    validUpdate = false;
                } 
                if (!format.test(event.target.value)) {
                    errorMessage = 'Must be a valid username'
                    validUpdate = false;
                } 
            }

            if (event.target.name === 'telegramAccount' || event.target.name === 'telegramGroup' || event.target.name === 'discordGroup') {
                const format = /^[a-zA-Z0-9_]*$/;
                if(event.target.value.length < 5) {
                    errorMessage = 'Must be more than 5 characters'
                } else if (event.target.value.length > 32) {
                    errorMessage = 'Must be less than 32 characters'
                    validUpdate = false;
                } 
                if (!format.test(event.target.value)) {
                    errorMessage = 'Must be a valid username'
                    validUpdate = false;
                } 
            }

            if (event.target.name === 'discordAccount') {
                const format = /^[0-9]{18}$/;
                if (!format.test(event.target.value)) {
                    errorMessage = 'Discord ID is 18 digits long'
                    validUpdate = true;
                }
            }

            if (event.target.name === 'githubAccount') {
                const format = /^[a-zA-Z0-9\d](?:[a-zA-Z0-9\d]|-(?=[a-zA-Z0-9\d]))*$/;
                if(event.target.value.length < 4) {
                    errorMessage = 'Must be more than 4 characters'
                } else if (event.target.value.length > 39) {
                    errorMessage = 'Must be less than 39 characters'
                    validUpdate = false;
                } 
                if (!format.test(event.target.value)) {
                    errorMessage = 'Must be a valid username'
                } 
            }

            if (event.target.name === 'website') {
                const format = /(([\w]+:)?\/\/)?(([\d\w]|%[a-fA-f\d]{2,2})+(:([\d\w]|%[a-fA-f\d]{2,2})+)?@)?([\d\w][-\d\w]{0,253}[\d\w]\.)+[\w]{2,63}(:[\d]+)?(\/([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)*(\?(&?([-+_~.\d\w]|%[a-fA-f\d]{2,2})=?)*)?(#([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)?/;
                if (event.target.value.length > 75) {
                    errorMessage = 'Too many characters'
                    validUpdate = false;
                } else if (!format.test(event.target.value)) {
                    errorMessage = 'Not a valid website'
                } 
            }

            // Card properties
            if (validUpdate) {
                let cardProperties = this.state.cardProperties
                cardProperties[event.target.name] = event.target.value
                this.setState({ cardProperties })
            }
            // Error handling
            cardPropertiesError[event.target.name] = errorMessage
            this.setState({ cardPropertiesError })
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
        let balance = await this.props.provider.getBalance(this.props.account);
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
        const bCardContract = new ethers.Contract(bCardAddress, bCardAbi, this.props.provider);
        let _nameTaken = await bCardContract.isNameReserved(this.state.name.trim())
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

        const cardProperties = this.state.cardProperties;

        const _properties = [
            cardProperties['twitterAccount'], 
            cardProperties['telegramAccount'], 
            cardProperties['telegramGroup'], 
            (cardProperties['discordAccount'] === "") ? '0' : cardProperties['discordAccount'],
            cardProperties['discordGroup'],
            cardProperties['githubAccount'],
            cardProperties['website'].trim(),
        ]

        if (isValid) {

            const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();

                const contractAbi = require('../../abis/BusinessCard.json')['abi']
                const _contract = new ethers.Contract(bCardAddress, contractAbi, provider)
                const connectedContract = await _contract.connect(signer)
                const properties = [this.state.position.trim()].concat(_properties)

                await connectedContract.getCard(this.state.name.trim(), properties, { value: mintPrice })

                // Empty all fields when tx is successful
                this.setState(initialState);

            try {
                // Gontract for buying
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();

                const contractAbi = require('../../abis/BusinessCard.json')['abi']
                const _contract = new ethers.Contract(bCardAddress, contractAbi, provider)
                const connectedContract = await _contract.connect(signer)
                const properties = [this.state.position.trim()].concat(cardProperties)

                await connectedContract.getCard(this.state.name.trim(), properties, { value: mintPrice })

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
            this.state.position !== "" &&
            Object.values(this.state.cardPropertiesError).every(function(v) { return v === null; })  // no errors 
        ) {
            buttonEnabled = true
        } else {
            buttonEnabled = false;
        }   
        
        // Showing clickable button or not
        let buttonComponent = null;
        if (buttonEnabled) {
            buttonComponent = 
            <>
                <EnabledButton type="button" disabled={false} onClick={this.handleClick}>
                    {(this.state.awaitingTx) ? <Spinner animation="border" size="sm" /> : "Mint"}
                </EnabledButton>
            </>
        } else {
            buttonComponent = 
                <>
                    <DisabledButton type="button" disabled={true}>
                        Mint
                    </DisabledButton>
                </>
        }

        let screenComponent = null;
        if (this.state.screen===1) {
            screenComponent = 
            <>
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
                <TextWrapper key='box3'>
                    <div className="form__group field">
                        <input 
                            type="input" 
                            className="form__field" 
                            placeholder={this.props.inputs.placeholder_text_3} 
                            name={this.props.inputs.id_3} 
                            id={this.props.inputs.id_3}  
                            value={this.state.cardProperties['twitterAccount']}
                            onChange={this.handleChange}
                        />
                        <label htmlFor={this.props.inputs.id_3} className="form__label">{this.props.inputs.placeholder_text_3}</label>
                        <div style={{ fontSize:15, color: "red", position: 'absolute'}}>
                            {this.state.cardPropertiesError['twitterAccount']}
                        </div>
                    </div>
                </TextWrapper>
            </>
        } else if (this.state.screen===2) {
            screenComponent = 
            <>
                <TextWrapper key='box4'>
                    <div className="form__group field">
                        <input 
                            type="input" 
                            className="form__field" 
                            placeholder={this.props.inputs.placeholder_text_4} 
                            name={this.props.inputs.id_4} 
                            id={this.props.inputs.id_4} 
                            required 
                            value={this.state.cardProperties['telegramAccount']}
                            onChange={this.handleChange}
                        />
                        <label htmlFor={this.props.inputs.id_4} className="form__label">{this.props.inputs.placeholder_text_4}</label>
                        <div style={{ fontSize:15, color: "red", position: 'absolute'}}>
                            {this.state.cardPropertiesError['telegramAccount']}
                        </div>
                    </div>
                </TextWrapper>
                <TextWrapper key='box5'>
                    <div className="form__group field">
                        <input 
                            type="input" 
                            className="form__field" 
                            placeholder={this.props.inputs.placeholder_text_5} 
                            name={this.props.inputs.id_5} 
                            id={this.props.inputs.id_5} 
                            required 
                            value={this.state.cardProperties['telegramGroup']}
                            onChange={this.handleChange}
                        />
                        <label htmlFor={this.props.inputs.id_5} className="form__label">{this.props.inputs.placeholder_text_5}</label>
                        <div style={{ fontSize:15, color: "red", position: 'absolute'}}>
                            {this.state.cardPropertiesError['telegramGroup']}
                        </div>
                    </div>
                </TextWrapper>
                <TextWrapper key='box6'>
                    <div className="form__group field">
                        <input 
                            type="input" 
                            className="form__field" 
                            placeholder={this.props.inputs.placeholder_text_6} 
                            name={this.props.inputs.id_6} 
                            id={this.props.inputs.id_6} 
                            value={this.state.cardProperties['githubAccount']}
                            onChange={this.handleChange}
                        />
                        <label htmlFor={this.props.inputs.id_6} className="form__label">{this.props.inputs.placeholder_text_6}</label>
                        <div style={{ fontSize:15, color: "red", position: 'absolute'}}>
                            {this.state.cardPropertiesError['githubAccount']}
                        </div>
                    </div>
                </TextWrapper>
            </>
        } else if (this.state.screen===3) {
            screenComponent = 
            <>
            <TextWrapper key='box7'>
                    <div className="form__group field">
                        <input 
                            type="input" 
                            className="form__field" 
                            placeholder={this.props.inputs.placeholder_text_7} 
                            name={this.props.inputs.id_7} 
                            id={this.props.inputs.id_7} 
                            required 
                            value={this.state.cardProperties['discordAccount']}
                            onChange={this.handleChange}
                        />
                        <label htmlFor={this.props.inputs.id_7} className="form__label">{this.props.inputs.placeholder_text_7}</label>
                        <div style={{ fontSize:15, color: "red", position: 'absolute'}}>
                            {this.state.cardPropertiesError['discordAccount']}
                        </div>
                    </div>
                </TextWrapper>
                <TextWrapper key='box8'>
                    <div className="form__group field">
                        <input 
                            type="input" 
                            className="form__field" 
                            placeholder={this.props.inputs.placeholder_text_8} 
                            name={this.props.inputs.id_8} 
                            id={this.props.inputs.id_8} 
                            required 
                            value={this.state.cardProperties['discordGroup']}
                            onChange={this.handleChange}
                        />
                        <label htmlFor={this.props.inputs.id_8} className="form__label">{this.props.inputs.placeholder_text_8}</label>
                        <div style={{ fontSize:15, color: "red", position: 'absolute'}}>
                            {this.state.cardPropertiesError['discordGroup']}
                        </div>
                    </div>
                </TextWrapper>
                <TextWrapper key='box9'>
                    <div className="form__group field">
                        <input 
                            type="input" 
                            className="form__field" 
                            placeholder={this.props.inputs.placeholder_text_9} 
                            name={this.props.inputs.id_9} 
                            id={this.props.inputs.id_9} 
                            required 
                            value={this.state.cardProperties['website']}
                            onChange={this.handleChange}
                        />
                        <label htmlFor={this.props.inputs.id_9} className="form__label">{this.props.inputs.placeholder_text_9}</label>
                        <div style={{ fontSize:15, color: "red", position: 'absolute'}}>
                            {this.state.cardPropertiesError['website']}
                        </div>
                    </div>
                </TextWrapper>
            </>
        }

        // Button gets enabled if connected on the right network, and name and position are filled

        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <ScreenWrapper>
                        {screenComponent}
                    </ScreenWrapper>
                    <ButtonWrapper>
                        <ChangeInputButton 
                            type="button" 
                            disabled={this.state.screen > 1 ? false : true} 
                            onClick={() => {this.setState({screen: this.state.screen - 1})}}
                        >
                            {(this.state.screen > 1) ? <FaAngleLeft /> : <div />}
                        </ChangeInputButton>
                        {buttonComponent}
                        <ChangeInputButton 
                            type="button" 
                            disabled={this.state.screen < 3 ? false : true}
                            onClick={() => {this.setState({screen: this.state.screen + 1})}}
                        >
                            {(this.state.screen < 3) ? <FaAngleRight /> : <div />}
                        </ChangeInputButton>
                    </ButtonWrapper>
                    
                </form>
            </div>
        );
    }
};

export default InputBoxes;