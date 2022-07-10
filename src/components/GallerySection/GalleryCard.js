import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import './card.css';

const GalleryCard = (props) => {

    const [tokenMetadata, setTokenMetadata] = useState(null);
    
    const stylizedTokenNumber = () => {
        let num = props.id.toString();
        while (num.length < 4) num = "0" + num;
        return '#' + num
    } 

    useEffect(() => {
        async function fetchData() {
            let tokenMetadataURL = null;
            tokenMetadataURL = await props.contract.tokenURI(props.id);
            const response = await fetch(tokenMetadataURL);
            const data = await response.json();
            setTokenMetadata(data);
        }
        fetchData();
    // eslint-disable-next-line
    }, [])

    // TODO: show THUMBNAIL, not full IMAGE, in order to reduce total bandwidth
    return(
        <>
        <Card 
            bg='custom' 
            text='custom' 
            style={{  cursor: 'pointer' }} 
        >
            {/* eslint-disable-next-line */}
            <a className='card-link' href={'../card/' + props.id} exact="true"/>
            <Card.Img 
                variant="top" 
                src={tokenMetadata ? tokenMetadata.thumbnail : require('../../images/placeholder_card.png')} 
            />
            <Card.Body>
            <Card.Title>{stylizedTokenNumber(props.id)}</Card.Title>
            <Card.Text>
                {
                tokenMetadata ? 
                    tokenMetadata.name ? tokenMetadata.card_name : '? ? ?'
                    : 
                    '? ? ?'
                }
                <br />
                {
                tokenMetadata ? 
                    tokenMetadata.description ? tokenMetadata.card_position : '? ? ?'
                    : 
                    '? ? ?'
                }
            </Card.Text>
            </Card.Body>
        </Card>
        </>
    )
}

export default GalleryCard;