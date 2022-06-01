import React, { useState, useEffect } from 'react';
import { 
    AttributeItem, 
    BoldText,
    AttributeWrapper,
    AttributeText,
    DividerLine,
} from './TokenSectionsElements';
import './fontclasses.css';


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

    const commonAttributes = ['Setting', 'Paper', 'Coloring', 'Font', 'Location', 'Phone number']

    useEffect(() => {
        if(props.metadata) {
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
        </AttributeWrapper>
        
    )
}

export default AttributesSection;