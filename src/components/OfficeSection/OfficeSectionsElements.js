import styled from "styled-components";

export const OfficeContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background-color: #212529;
`

export const TimelineTitle = styled.h1`
    padding-top: 100px;
    font-size: 3rem;
    color: #fff;
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

export const Timeline = styled.div`
    height: auto;
    margin: 0 auto;
    position: relative;
`

export const TimelineUl = styled.ul`
    list-style: none;
`

export const TimelineUlLi = styled.li`
    padding: 20px;
    background-color: #1e1f22;
    color: white;
    border-radius: 10px;
    margin-bottom: 20px;
`

export const TimelineContentH1 = styled.h1`
    font-weight: 500;
    font-size: 25px;
    line-height: 30px;
    margin-bottom: 10px;
`

export const TimelineContentP = styled.p`
    font-size: 16px;
    line-height: 30px;
    font-weight: 300;
`