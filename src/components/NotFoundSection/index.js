import React from 'react';
import {
    PageContainer,
    Page,
    NotFoundTitle,
    NotFoundSubtitle,
} from './NotFoundElements';
class NotFound extends React.Component {
    render () {
        return (
            <PageContainer>
                <Page>
                    <NotFoundTitle>404</NotFoundTitle>
                    <NotFoundSubtitle>Something wrong? You are sweating.</NotFoundSubtitle>
                </Page>
            </PageContainer>

    )}
}

export default NotFound;