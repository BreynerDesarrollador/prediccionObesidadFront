import React from 'react';
/* eslint react/prop-types: 0 */
import styles from '../sass/nav.less';

const Nav = (props) => {
    const dots = [];
    for (let i = 1; i <= props.totalSteps; i++) {
        const isActive = props.currentStep === i;
        dots.push((
            <span
                key={`step-${i}`}
                className={`dot ${isActive ? 'active' : ''}`}
                onClick={() => props.goToStep(i)}
            >&bull;</span>
        ));
    }

    return (
        <div className={'text-center nav'}>{dots}</div>
    );
};

export default Nav;
