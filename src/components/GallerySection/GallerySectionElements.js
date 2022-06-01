import styled from "styled-components";

export const PageContainer = styled.div`
    min-height: 101vh;
    background: #212529;
    color: #F8F9FA;
    display: flex; 
    flex-direction: column;
    align-items: center;
    padding-top: 120px;
    padding-bottom: 60px;
    position: relative;
`

export const HeadContainer = styled.div`
    position: relative;
    padding-bottom: 16px;
    width: 1425px;

    @media screen and (max-width: 1500px) {
        width: 95%;
    }
`

export const SwitchContainer = styled.div`
    height: 50px;
    background: #212529;
    display: flex;
    justify-content: flex-end;
    align-items: center;
`

export const DividerWrapper = styled.div`
    background-color: #212529;
    height: 1px;
    width: 100%;
    margin: auto;
    position: absolute;
`

export const DividerLine = styled.hr`
    color: #F8F9FA;
    height: 1px;
    margin: auto;
`

export const GalleryContainer = styled.div`
    max-width: 1500px;
    padding-top: 10px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    align-items: center;
    grid-gap: 32px;

    @media screen and (max-width: 1300px) {
        grid-template-columns: 1fr 1fr 1fr;
    }

    @media screen and (max-width: 1000px) {
        grid-template-columns: 1fr 1fr;
    }

    @media screen and (max-width: 700px) {
        grid-template-columns: 1fr;
    }
`

