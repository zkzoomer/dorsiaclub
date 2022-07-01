import styled from "styled-components";

export const OfficeContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background-color: var(--light-background);
`

export const TimelineTitle = styled.h1`
    padding-top: 100px;
    font-size: 3rem;
    color: var(--main-text);
    align-items: center;
    text-align: center;
    justify-content: center;
    display: flex;
    position: relative;
    font-family: 'Dorsian-Sea', serif;

    @media screen and (max-width: 768px) {
        font-size: 40px;
    }

    @media screen and (max-width: 480px) {
        font-size: 32px;
    }
`
