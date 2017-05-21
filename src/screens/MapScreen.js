import React, { Component } from 'react';
import { Dimensions, StyleSheet, StatusBar } from 'react-native';
import { Container } from 'native-base';
import _ from 'lodash';

import Map from '../components/Map';
import Request from '../components/Request';

class MapScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      requestId: null,
      online: false,
      dispatched: false,
      arrived: false,
      pickedUp: false,
    };
  }

  componentWillMount() {
    this._onLayout();
  }

  _onLayout = () => {
    const { width, height } = Dimensions.get('window');
    this.setState({ width, height });
  }

  toggleOnline = () => {
    this.setState(
      (prevState) => ({online: !prevState.online}),
      () => setTimeout(() => this.setState({requestId: 1}), 2000)
    );
  }

  acceptDispatch = () => {
    this.setState(
      {dispatched: true},
      () => setTimeout(() => this.setState({arrived: true}), 2000)
    );
  }

  cancelDispatch = () => {
    this.setState(
      {requestId: null, dispatched: false, arrived: false}
    );
  }

  confirmPickup = () => {
    this.setState(
      {pickedUp: true}
    );
  }

  confirmComplete = () => {
    this.setState(
      {requestId: null, dispatched: false, arrived: false, pickedUp: false}
    );
  }

  render() {
    const {
      height,
      width,
      online,
      requestId,
      dispatched,
      arrived,
      pickedUp,
    } = this.state;

    return (
      <Container
        onLayout={this._onLayout}
        style={styles.container}>
        <StatusBar
          translucent
          backgroundColor='rgba(100, 100, 100, 0.4)'/>
        <Map/>
        <Request
          online={online}
          requestId={requestId}
          dispatched={dispatched}
          arrived={arrived}
          pickedUp={pickedUp}
          height={height}
          width={width}
          currentLocation={{latitude: 53.525, longitude: -113.527}}
          toggleOnline={this.toggleOnline}
          acceptDispatch={this.acceptDispatch}
          cancelDispatch={this.cancelDispatch}
          confirmPickup={this.confirmPickup}
          confirmComplete={this.confirmComplete}
          />
      </Container>
    );
  }

}

const styles = {
  container: {
    flex: 1,
    borderRadius: 0,
    backgroundColor: '#EEE',
  }
};

export default MapScreen;
