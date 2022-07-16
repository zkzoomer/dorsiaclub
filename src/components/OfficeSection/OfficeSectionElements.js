import styled from "styled-components";
import { DropdownButton } from 'react-bootstrap';

export const PageContainer = styled.div`
    min-height: 101vh;
    background: var(--light-background);
    /* background: linear-gradient(to right, var(--light-background), var(--transition-background)); */
    color: var(--main-text);
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

export const SearchContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
`

export const SearchItemsContainer = styled.div`
    max-width: 1100px;
    height: 50px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
    align-items: center;

    @media screen and (max-width: 1300px) {
        max-width: 500px;
        height: 100px;
        grid-template-columns: 1fr 1fr 1fr;
    }

    @media screen and (max-width: 1000px) {
        max-width: 300px;
        height: 150px;
        grid-template-columns: 1fr 1fr;
    }
`

export const StyledDropdownButton = styled(DropdownButton)`
    width: 25%; 
    text-overflow: ellipsis;
`

export const SwitchRow = styled.div`
    height: 40px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    position: relative;
    width: 150px;

    @media screen and (max-width: 1000px) {
        height: 80px;
        display: grid;
    }
`

export const SwitchText = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding-right: 7px;
    padding-top: 1px;
`

export const SwitchContainer = styled.div`
    height: 50px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
`

export const DividerWrapper = styled.div`
    background-color: var(--light-background);
    height: 1px;
    width: 100%;
    margin: auto;
    position: absolute;
`

export const DividerLine = styled.hr`
    color: var(--divider);
    height: 1px;
    margin: auto;
`

export const OfficeContainer = styled.div`
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

export const BlacklistButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;    
    border-radius: 5px;
    background: black;
    white-space: nowrap;
    padding: 2px;
    font-size: 1.25rem;
    color: var(--main-text);
    font-size: 16px;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    width: 145px;

    &:hover {
        transition: all 0.3s ease-in-out;
        color: var(--main-text);
        box-shadow:  0 0 0 1px var(--main-text);
    }
`

export const BlacklistButtonText = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    height: 100%;
`