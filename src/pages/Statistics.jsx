import React from 'react';

const Statistics = () => {
    return (
        <div style={styles.container}>
            <h1 style={styles.text}>Statistics</h1>
        </div>
    );
};

export default Statistics;

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        minHeight: '100vh',
    },
    text: {
        color: '#000'
    }
};