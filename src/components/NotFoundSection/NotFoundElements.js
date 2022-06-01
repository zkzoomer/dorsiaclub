import styled from 'styled-components'

export const PageContainer = styled.div`
    height: 101vh;
`

export const Page = styled.div`
    height: 100%;
    background: #212529;

    @media screen and (max-width: 768px) {
        overflow-x: hidden;

        height: 120vh;
        padding: 0px 0 0px;
    }
`

export const NotFoundTitle = styled.h1`
    padding-top: 150px;
    font-size: 5rem;
    color: #F8F9FA;
    margin-bottom: 100px;
    align-items: center;
    text-align: center;
    justify-content: center;
    display: flex;
    position: relative;
    font-family: 'Silian-Rail', serif;
    

    @media screen and (max-width: 768px) {
        font-size: 40px;
        margin-bottom: 20px;
    }

    @media screen and (max-width: 480px) {
        font-size: 32px;
    }
`

export const NotFoundSubtitle = styled.h2`
    font-size: 2.5rem;
    color: #F8F9FA;
    margin-bottom: 100px;
    align-items: center;
    text-align: center;
    justify-content: center;
    display: flex;
    position: relative;
    font-family: 'Silian-Rail', serif;

    @media screen and (max-width: 768px) {
        font-size: 40px;
        margin-bottom: 20px;
    }

    @media screen and (max-width: 480px) {
        font-size: 32px;
    }
`

export const ImgWrap = styled.div`
    width: 50%;
    height: 50%;
    left: 25%;
`

export const Img = styled.img`
    height: 100%;
    width: 100%;
    -o-object-fit: cover;
    object-fit: cover;
`