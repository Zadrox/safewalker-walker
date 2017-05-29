import React, { Component } from 'react';
import { Dimensions, StyleSheet, StatusBar } from 'react-native';
import { Container } from 'native-base';
import _ from 'lodash';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import Map from '../components/Map';
import Request from '../components/Request';

class MapScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      requestId: null
    };
  }

  componentWillMount() {
    this._onLayout();
  }

  _onLayout = () => {
    const { width, height } = Dimensions.get('window');
    this.setState({ width, height });
  }

  setRequestId = (requestId) => {
    if (requestId != this.state.requestId)
      this.setState({requestId});
  }

  render() {
    const {
      height,
      width,
      requestId,
    } = this.state;

    return (
      <Container
        onLayout={this._onLayout}
        style={styles.container}>
        <StatusBar
          translucent
          backgroundColor='rgba(100, 100, 100, 0.4)'/>
        <Map
          requestId={requestId}/>
        <Request
          requestId={requestId}
          height={height}
          width={width}
          currentLocation={{latitude: 53.525, longitude: -113.527}}
          setRequestId={this.setRequestId}
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
