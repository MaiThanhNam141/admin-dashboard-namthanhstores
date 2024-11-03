import React from 'react';

const NotFound = () => {
    return (
        <div style={styles.container}>
            <h1>NotFound</h1>
        </div>
    );
};

export default NotFound;

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
    }
};