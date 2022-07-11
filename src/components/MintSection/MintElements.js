import styled from 'styled-components'

export const PageContainer = styled.div`
    background-color: var(--light-background);
    min-height: 101vh;
`

export const MintContainer = styled.div`
    height: 100%;
    background-color: var(--light-background);

    @media screen and (max-width: 768px) {
        overflow-x: hidden;
        height: 120vh;
    }
`

export const HeadingWrapper = styled.div`
    height: 20vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    @media screen and (max-width: 768px) {
        padding: 100px 0 0px;
    }
`

export const MintH1 = styled.h1`
    padding-top: 150px;
    font-size: 2.5rem;
    color: var(--main-text);
    margin-bottom: 100px;
    align-items: center;
    text-align: center;
    justify-content: center;
    display: flex;
    position: relative;
    filter: drop-shadow(5px 5px 5px rgba(0,0,0,0.5));

    @media screen and (max-width: 768px) {
        font-size: 40px;
        margin-bottom: 20px;
    }

    @media screen and (max-width: 480px) {
        font-size: 32px;
    }
`

export const InfoWrapper = styled.div`
    display: grid;
    max-width: 1450px;
    align-items: center;
    padding-left: 30px;
    padding-right: 30px;
    margin-left: auto;
    margin-right: auto;
`

export const InfoRow = styled.div`
    display: grid;
    grid-auto-columns: minmax(auto, 1fr);
    align-items: center;
    grid-template-areas: 'col1 col2';

    @media screen and (max-width: 768px) {
        grid-template-areas: 'col1 col1' 'col2 col2';
    };
`

export const Column1 = styled.div`
    height: 100%;
    grid-area: col1;
    color: var(--main-text);
    padding-top: 10%;
    margin-bottom: 0px;

    @media screen and (max-width: 768px) {
        height: 100%;
        padding-top: 0%;
        padding-bottom: 10%;
        width: 100%;
    };
`

export const ScreenWrapper = styled.div`
`

export const Column2 = styled.div`
    grid-area: col2;
`

export const ImgWrap = styled.div`
    position: relative;
    max-width: 1000px;
    height: 100%;
`

export const ImgDescription = styled.h1`   
    color: var(--main-text);
    font-size: 1rem;
    margin-top: 0px;
    height: 40px;
    align-items: center;
    text-align: center;
    justify-content: center;
    display: flex;
`

export const Img = styled.img`
    width: 100%;
    height: 100%;
    margin: 0 0 10px 0;
    padding-right: 0;
    filter: drop-shadow(10px 10px 5px rgba(0,0,0,0.5));
`

export const ImgLiveName = styled.h1`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 55.5%;
    color: var(--dark-background);
    font-size: 21.2px;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-family: 'Royal-Script', serif;
    font-feature-settings: "smcp";
    font-variant-ligatures: none;
    display: block;

    @media screen and (max-width: 1415px) {
        font-size: 1.5vw;
        transform: translateY(calc((-1415px + 100vw)*0.013))
    }

    @media screen and (max-width: 768px) {
        font-size: 3.1vw;
        transform: translateY(calc((-768px + 100vw)*0.013))
    }
`

export const ImgLivePosition = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 52.5%;
    color: var(--dark-background);
    font-size: 14px;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-family: 'Royal-Script', serif;
    font-feature-settings: "smcp";
    font-variant-ligatures: none;


    @media screen and (max-width: 1415px) {
        font-size: 1.132vw;
        transform: translateY(calc((-1415px + 100vw)*0.013))
    }

    @media screen and (max-width: 768px) {
        font-size: 2.34vw;
        transform: translateY(calc((-768px + 100vw)*0.013))
    }
`

export const TextWrapper = styled.div`
    padding-top: 0px;
    padding-bottom: 15px;
    margin-left: 0%;
    width: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
`

export const ButtonWrapper = styled.div`
    margin-top: 32px;
    width: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
`

export const EnabledButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;    
    border-radius: 50px;
    background: var(--button);
    white-space: nowrap;
    padding: 14px 48px;
    color: var(--button-text);
    font-size: 16px;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    width: 50%;
    filter: drop-shadow(10px 10px 5px rgba(0,0,0,0.5));

    &:hover {
        transition: all 0.3s ease-in-out;
        color: var(--highlighted-text);
        box-shadow:  0 0 0 2px var(--highlighted-text);
    }
`

export const DisabledButton = styled.button`
    width: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50px;
    background: var(--disabled-button);
    white-space: nowrap;
    padding: 14px 48px;
    color: var(--button-text);
    font-size: 16px;
    outline: none;
    border: none;
`

export const ChangeInputButton = styled.button`
    width: 10%;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50px;
    font-size: 1.5rem;
    padding: 14px 0px;
    margin: 0 20px 0 20px;
    background: transparent;
    color: var(--sub-text);

    &:hover {
        transition: all 0.3s ease-in-out;
        color: var(--highlighted-text);
        transform: scale(1.3);
    }
`
