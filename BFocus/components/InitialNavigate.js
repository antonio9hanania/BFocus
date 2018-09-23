import React, { Component } from 'react';
import NavigationService from './NavigationService';

export default class InitialNavigate extends Component {
    componentWillMount() {
        console.log(">>>App component mounted navigating to current location..");
        NavigationService.navigateToCurrentLocation();
    }

    render() {
        return (null);
    }
}