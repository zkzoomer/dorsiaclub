import React from 'react';
import './ChangeNameInputBoxes.scss';
import { ethers } from 'ethers';
import { 
    chainId, 
    bCardAddress,
    bCardAbi,
    maxNameLength, 
    maxPositionLength,
    updatePrice,
} from '../../web3config'
import { 
    ScreenWrapper,
    EnabledButton,
    DisabledButton, 
    ChangeInputButton,
    ButtonWrapper, 
    TextWrapper
} from './TokenSectionsElements';
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
        twitter_account: "",
        telegram_account: "",
        telegram_group: "",
        discord_account: "",
        discord_group: "",
        github_username: "",
        website: ""
    },
    cardPropertiesError: {
        twitter_account: null,
        telegram_account: null,
        telegram_group: null,
        discord_account: null,
        discord_group: null,
        github_username: null,
        website: null
    },
    liveName: "",
    livePosition: "",
    screen: 1,
    awaitingTx: false,
}

const inputs = {
    id_1: 'name',
    placeholder_text_1: 'Your name',
    id_2: 'position',
    placeholder_text_2: 'Your position',
    id_3: 'twitter_account',
    placeholder_text_3: 'Twitter account',
    id_4: 'telegram_account',
    placeholder_text_4: 'Telegram account',
    id_5: 'telegram_group',
    placeholder_text_5: 'Telegram group',
    id_6: 'github_username',
    placeholder_text_6: 'Github account',
    id_7: 'discord_account',
    placeholder_text_7: 'Discord account',
    id_8: 'discord_group',
    placeholder_text_8: 'Discord group',
    id_9: 'website',
    placeholder_text_9: 'Website',
};

class ChangeNameSection extends React.Component {

    /* initialState['cardProperties'] = props.metadata.attributes */

    state = {
        name: this.props.metadata.card_name,
        currentName: this.props.metadata.card_name,
        position: this.props.metadata.card_position,
        nameError: "",
        positionError: "",
        cardProperties: this.props.metadata.card_properties,
        cardPropertiesError: {
            twitter_account: null,
            telegram_account: null,
            telegram_group: null,
            discord_account: null,
            discord_group: null,
            github_username: null,
            website: null
        },
        liveName: "",
        livePosition: "",
        screen: 1,
        awaitingTx: false,
    };
    
    /* setState({ cardProperties: })

    componentDidUpdate(prevProps) {
        console.log('SNEED')
        console.log(prevProps.metadata)
        if (prevProps.metadata !== this.props.metadata) {
            console.log('CHUCK')
        }
    } */

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
        } else {
            let validUpdate = true;
            let errorMessage = null;
            let cardPropertiesError = this.state.cardPropertiesError

            if (event.target.name === 'twitter_account') {
                const format = /^[a-zA-Z0-9_]*$/;
                if(event.target.value.length < 3 && event.target.value.length > 0) {
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

            if (event.target.name === 'telegram_account' || event.target.name === 'telegram_group' || event.target.name === 'discord_group') {
                const format = /^[a-zA-Z0-9_]*$/;
                if(event.target.value.length < 5 && event.target.value.length > 0) {
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

            if (event.target.name === 'discord_account') {
                const format = /^[0-9]{18}$/;
                if (!format.test(event.target.value)) {
                    errorMessage = 'Discord ID is 18 digits long'
                    validUpdate = true;
                }
            }

            if (event.target.name === 'github_username') {
                const format = /^[a-zA-Z0-9\d](?:[a-zA-Z0-9\d]|-(?=[a-zA-Z0-9\d]))*$/;
                if(event.target.value.length < 4 && event.target.value.length > 0) {
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
        const bCardContract = new ethers.Contract(bCardAddress, bCardAbi, this.props.provider);
        let _nameTaken = await bCardContract.isNameReserved(this.state.name.trim())
        if (_nameTaken && this.state.name.trim() !== this.state.currentName) {
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
            cardProperties['twitter_account'], 
            cardProperties['telegram_account'], 
            cardProperties['telegram_group'], 
            (cardProperties['discord_account'] === "") ? '0' : cardProperties['discord_account'],
            cardProperties['discord_group'],
            cardProperties['github_username'],
            cardProperties['website'].trim(),
        ]

        if (isValid) {

            try {
                // Gontract for buying
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();

                const contractAbi = require('../../abis/BusinessCard.json')['abi']
                const _contract = new ethers.Contract(bCardAddress, contractAbi, provider)
                const connectedContract = await _contract.connect(signer)
                const properties = [this.state.position.trim()].concat(_properties)

                let _name;
                if (this.state.name.trim() !== this.state.currentName) {
                    _name = this.state.name.trim()
                } else {
                    _name = ""  // User wishes to keep the same name, we need to send an empty string to the smart contract
                }
                await connectedContract.updateCard(this.props.id, _name, properties, { value: updatePrice })
            } catch (err) {
                console.log(err)
            } finally {
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
            (this.state.name !== "" ||  // Either name, position or one property must be provided
            this.state.position !== "" ||
            !Object.values(this.state.cardProperties).every(function(v) { return v === ""; })) &&
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
                    {(this.state.awaitingTx) ? <Spinner animation="border" size="sm" /> : "Update Card"}
                </EnabledButton>
            </>
        } else {
            buttonComponent = 
            <>
                <DisabledButton type="button" disabled={true}>
                    Update Card
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
                            placeholder={inputs.placeholder_text_1} 
                            name={inputs.id_1} 
                            id={inputs.id_1} 
                            required 
                            value={this.state.name}
                            onChange={this.handleChange}
                        />
                        <label htmlFor={inputs.id_1} className="form__label">{inputs.placeholder_text_1}</label>
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
                            placeholder={inputs.placeholder_text_2} 
                            name={inputs.id_2} 
                            id={inputs.id_2} 
                            required 
                            value={this.state.position}
                            onChange={this.handleChange}
                        />
                        <label htmlFor={inputs.id_2} className="form__label">{inputs.placeholder_text_2}</label>
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
                            placeholder={inputs.placeholder_text_3} 
                            name={inputs.id_3} 
                            id={inputs.id_3}  
                            value={this.state.cardProperties['twitter_account']}
                            onChange={this.handleChange}
                        />
                        <label htmlFor={inputs.id_3} className="form__label">{inputs.placeholder_text_3}</label>
                        <div style={{ fontSize:15, color: "red", position: 'absolute'}}>
                            {this.state.cardPropertiesError['twitter_account']}
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
                            placeholder={inputs.placeholder_text_4} 
                            name={inputs.id_4} 
                            id={inputs.id_4} 
                            required 
                            value={this.state.cardProperties['telegram_account']}
                            onChange={this.handleChange}
                        />
                        <label htmlFor={inputs.id_4} className="form__label">{inputs.placeholder_text_4}</label>
                        <div style={{ fontSize:15, color: "red", position: 'absolute'}}>
                            {this.state.cardPropertiesError['telegram_account']}
                        </div>
                    </div>
                </TextWrapper>
                <TextWrapper key='box5'>
                    <div className="form__group field">
                        <input 
                            type="input" 
                            className="form__field" 
                            placeholder={inputs.placeholder_text_5} 
                            name={inputs.id_5} 
                            id={inputs.id_5} 
                            required 
                            value={this.state.cardProperties['telegram_group']}
                            onChange={this.handleChange}
                        />
                        <label htmlFor={inputs.id_5} className="form__label">{inputs.placeholder_text_5}</label>
                        <div style={{ fontSize:15, color: "red", position: 'absolute'}}>
                            {this.state.cardPropertiesError['telegram_group']}
                        </div>
                    </div>
                </TextWrapper>
                <TextWrapper key='box6'>
                    <div className="form__group field">
                        <input 
                            type="input" 
                            className="form__field" 
                            placeholder={inputs.placeholder_text_6} 
                            name={inputs.id_6} 
                            id={inputs.id_6} 
                            value={this.state.cardProperties['github_username']}
                            onChange={this.handleChange}
                        />
                        <label htmlFor={inputs.id_6} className="form__label">{inputs.placeholder_text_6}</label>
                        <div style={{ fontSize:15, color: "red", position: 'absolute'}}>
                            {this.state.cardPropertiesError['github_username']}
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
                            placeholder={inputs.placeholder_text_7} 
                            name={inputs.id_7} 
                            id={inputs.id_7} 
                            required 
                            value={this.state.cardProperties['discord_account']}
                            onChange={this.handleChange}
                        />
                        <label htmlFor={inputs.id_7} className="form__label">{inputs.placeholder_text_7}</label>
                        <div style={{ fontSize:15, color: "red", position: 'absolute'}}>
                            {this.state.cardPropertiesError['discord_account']}
                        </div>
                    </div>
                </TextWrapper>
                <TextWrapper key='box8'>
                    <div className="form__group field">
                        <input 
                            type="input" 
                            className="form__field" 
                            placeholder={inputs.placeholder_text_8} 
                            name={inputs.id_8} 
                            id={inputs.id_8} 
                            required 
                            value={this.state.cardProperties['discord_group']}
                            onChange={this.handleChange}
                        />
                        <label htmlFor={inputs.id_8} className="form__label">{inputs.placeholder_text_8}</label>
                        <div style={{ fontSize:15, color: "red", position: 'absolute'}}>
                            {this.state.cardPropertiesError['discord_group']}
                        </div>
                    </div>
                </TextWrapper>
                <TextWrapper key='box9'>
                    <div className="form__group field">
                        <input 
                            type="input" 
                            className="form__field" 
                            placeholder={inputs.placeholder_text_9} 
                            name={inputs.id_9} 
                            id={inputs.id_9} 
                            required 
                            value={this.state.cardProperties['website']}
                            onChange={this.handleChange}
                        />
                        <label htmlFor={inputs.id_9} className="form__label">{inputs.placeholder_text_9}</label>
                        <div style={{ fontSize:15, color: "red", position: 'absolute'}}>
                            {this.state.cardPropertiesError['website']}
                        </div>
                    </div>
                </TextWrapper>
            </>
        }

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

export default ChangeNameSection;