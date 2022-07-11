import React, { useState, useEffect } from 'react';
import { 
    AttributeItem, 
    AttributeLinks,
    LinkWrapper,
    LinkButton,
    DropLink,
    DropLinkContents,
    BoldText,
    AttributeWrapper,
    AttributeText,
    DividerLine,
} from './TokenSectionsElements';
import {
    FaTwitter,
    FaTelegramPlane,
    FaDiscord,
    FaGithub,
    FaGlobeAmericas, 
    FaGlobe,
} from "react-icons/fa";
import './fontclasses.css';
import { AccordionButton } from 'react-bootstrap';


// Gets fed the token metadata via this.props.tokenMetadataJSON

const AttributesSection = (props) => {
    // Attributes are stored in a dictionary
    const [name, setName] = useState("? ? ?");
    const [position, setPosition] = useState("? ? ?");
    const [attributes, setAttributes] = useState({
        'Setting': '? ? ?', 
        'Paper': '? ? ?',
        'Coloring': '? ? ?',
        'Font': '? ? ?',
        'Location': '? ? ?',
        'Phone number': '? ? ?',
    });
    const [specialAttributes, setSpecialAttributes] = useState([]);
    const [displayFont, setDisplayFont] = useState('babylon');
    const [properties, setProperties] = useState({
        'twitter_account': "",
        'telegram_account': "",
        'telegram_group': "",
        'discord_account': "0",
        'discord_group': "",
        "github_username": "",
        "website": "",
    });

    const commonAttributes = ['Setting', 'Paper', 'Coloring', 'Font', 'Location', 'Phone number']

    const getLink = function(icon, linkNames, links) {
        if (links.length === 2) {
            return(
                <LinkWrapper>
                    {icon}
                    <DropLink>
                        <DropLinkContents onClick={() => window.open(links[0], '_blank').focus()}>
                            {linkNames[0]}
                        </DropLinkContents>
                        <DropLinkContents onClick={() => window.open(links[1], '_blank').focus()}>
                            {linkNames[1]}
                        </DropLinkContents>
                    </DropLink>
                </LinkWrapper>
            )
        } else {
            return(
                <LinkButton onClick={() => window.open(links, '_blank').focus()}>
                    {icon}
                </LinkButton>
            )
        }
    }

    useEffect(() => {
        if(props.metadata) {
            console.log(props.metadata)
            setName(props.metadata.card_name)
            setPosition(props.metadata.card_position)

            let attr = props.metadata.attributes
            let attrDict = {}
            let _specialAttributes = []

            // Iterating over attributes
            for (let i = 0; i < attr.length; i++) {
                let _key = attr[i].trait_type
                let _value = attr[i].value

                // One of the six common attributes
                if (commonAttributes.includes(_key)) {
                    if (_key === 'Phone number') {
                        let num = _value.toString();
                        while (num.length < 4) num = "0" + num;
                        attrDict[_key] = num;
                    } else {
                        attrDict[_key] = _value;
                    }
                
                // Special attributes get pushed into a list, only if present
                } else {
                    if (_value) {
                        // Special lettering and shadow work differently -- the value will indicate these special attributes
                        // For the rest, the key indicates the special attribute
                        if (_key === 'Shadow' || _key === 'Special lettering') {
                            _specialAttributes.push(_value)
                        } else {
                            _specialAttributes.push(_key)
                        }
                    }
                }
            }
            setAttributes(attrDict)

            // Only capitalizes first element in the list
            _specialAttributes.sort()
            for(let i=1; i<_specialAttributes.length; i++) {
                _specialAttributes[i] = _specialAttributes[i].charAt(0).toLowerCase() + _specialAttributes[i].slice(1);
            }
            setSpecialAttributes(_specialAttributes)

            // Font for displaying the font
            setDisplayFont(attrDict['Font'].split(/(\s+)/)[0].toLocaleLowerCase())

            // Managing links
            setProperties(props.metadata['card_properties'])
        }

    // eslint-disable-next-line
    }, [props.metadata]) // Only updates when receiving the props

    
    // HAD THIS BEFORE FOR NAME: {name.replace(/(^\w|\s\w)(\S*)/g, (_,m1,m2) => m1.toUpperCase()+m2.toLowerCase())}
    return(
        <AttributeWrapper>
            <AttributeItem><BoldText>Name: </BoldText><AttributeText>{name}</AttributeText></AttributeItem>
            <AttributeItem><BoldText>Position: </BoldText><AttributeText>{position}</AttributeText></AttributeItem>
            <DividerLine />
            <AttributeItem><BoldText>Setting: </BoldText><AttributeText>{attributes['Setting']}</AttributeText></AttributeItem>
            <AttributeItem><BoldText>Paper: </BoldText><AttributeText>{attributes['Paper']}</AttributeText></AttributeItem>
            <AttributeItem><BoldText>Coloring: </BoldText><AttributeText>{attributes['Coloring']}</AttributeText></AttributeItem>
            <AttributeItem>
                <BoldText>Font: </BoldText>
                <AttributeText className={displayFont}>
                    {attributes['Font']}
                </AttributeText>
            </AttributeItem>
            <AttributeItem><BoldText>Location: </BoldText><AttributeText>{attributes['Location']}</AttributeText></AttributeItem>
            <AttributeItem><BoldText>Phone number: </BoldText><AttributeText>{attributes['Phone number']}</AttributeText></AttributeItem>
            <DividerLine />
            {(specialAttributes.length) ? 
                <AttributeItem><BoldText>Specials: </BoldText><AttributeText>{specialAttributes.join(", ")}</AttributeText></AttributeItem>
                :
                <div />
            }
            <AttributeLinks>
                {   // Twitter account
                    properties['twitter_account'] != "" ? 
                        getLink(<FaTwitter />, '', `https://www.twitter.com/${properties['twitter_account']}`)
                        :
                        <div/>
                }
                {   // Telegram account and/or group
                    properties['telegram_account'] != "" || properties['telegram_group'] != "" ?
                        // At least one of them is specified
                        properties['telegram_account'] != "" && properties['telegram_group'] != "" ?  
                                // Both are specified
                                getLink(
                                    <FaTelegramPlane />, ['Telegram account', 'Telegram group'], 
                                    [`https://t.me/${properties['telegram_account']}`, `https://t.me/${properties['telegram_group']}`]
                                )
                            :
                                // Only one of them is specified
                                properties['telegram_account'] != "" ?
                                    // The account is specified
                                    getLink(
                                        <FaTelegramPlane />, 'Telegram account', 
                                        `https://t.me/${properties['telegram_account']}`
                                    )
                                : 
                                    // The group is specified
                                    getLink(
                                        <FaTelegramPlane />, 'Telegram group', 
                                        `https://t.me/${properties['telegram_group']}`
                                    )
                    :  
                        // None of them are specified
                        <div/>
                }
                {   // Discord account and/or group
                    properties['discord_account'] != "0" || properties['discord_group'] != "" ?
                        // At least one of them is specified
                        properties['discord_account'] != "0" && properties['discord_group'] != "" ?  
                                // Both are specified
                                getLink(
                                    <FaDiscord />, ['Discord account', 'Discord group'], 
                                    [`https://discord.com/users/${properties['discord_account']}`, `https://discord.gg/${properties['discord_group']}`]
                                )
                            :
                                // Only one of them is specified
                                properties['discord_account'] != "0" ?
                                    // The account is specified
                                    getLink(
                                        <FaDiscord />, 'Discord account', 
                                        `https://discord.com/users/${properties['discord_account']}`
                                    )
                                : 
                                    // The group is specified
                                    getLink(
                                        <FaDiscord />, 'Discord group', 
                                        `https://discord.gg/${properties['discord_group']}`
                                    )
                    :  
                        // None of them are specified
                        <div/>
                }
                {   // Github account
                    properties['github_username'] != "" ? 
                        getLink(<FaGithub />, '', `https://github.com/${properties['github_username']}`)
                        :
                        <div/>
                }
                {   // Website
                    properties['website'] != "" ? 
                        getLink(<FaGlobeAmericas />, '', properties['website'])
                        :
                        <div/>
                }
                {/* {getLink(<FaTwitter />, [''], ['https://www.twitter.com/home'])}
                {getLink(<FaTelegramPlane />, ['Telegram account', 'Telegram group'], ['https://coinmarketcap.com/', 'https://www.youtube.com/'])}
                {getLink(<FaDiscord />, [''], ['https://twitter.com/home'])}
                {getLink(<FaGithub />, [''], ['https://twitter.com/home'])}
                {getLink(<FaGlobeAmericas />, [''], ['https://twitter.com/home'])} */}
            </AttributeLinks>
        </AttributeWrapper>
        
    )
}

export default AttributesSection;