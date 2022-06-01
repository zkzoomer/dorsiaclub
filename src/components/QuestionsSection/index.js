import React, { useState } from 'react';
import { items } from './Data';
import {
    DividerWrapper,
    DividerLine,
    QuestionsContainer,
    QuestionsWrapper,
    QuestionsRow,
    Column1,
    Column2,
    ImgWrap,
    Img,
    AccordionContainer,
    AccordionContent,
} from './QuestionsElements';

const Accordion = ({ items }) => {

    const [active, setActive] = useState();

    const handleClick = (name) => {
        setActive(name === active ? null : name)
    }

    return(
        <>
            <AccordionContainer>
                {items.map((item, index) => {
                    let isActive = active === item.name;
                    return (
                        <AccordionContent 
                            key={index}
                            onClick={() => handleClick(item.name)}
                            itemName={item.name}
                            itemContent={item.content}
                            isActive={isActive}
                        />
                    );
                })}
            </AccordionContainer>
        </>
    )
}

const QuestionsSection = () => {

    return (
        <>
            <DividerWrapper>
                        <DividerLine />
            </DividerWrapper>
            <QuestionsContainer>
                <QuestionsWrapper>
                    <QuestionsRow>
                        <Column1>
                            <ImgWrap>
                                <Img src={require("../../images/faq_transparent.png")} alt="youlikehlatn?"/>
                            </ImgWrap>
                        </Column1>
                        <Column2>
                            <Accordion items={items} />
                        </Column2>
                    </QuestionsRow>
                </QuestionsWrapper>
            </QuestionsContainer>
        </>
    )
}

export default QuestionsSection;