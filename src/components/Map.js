/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import MapView from 'react-native-maps';

class Map extends Component {

  state = {
    region: {
      latitude: 53.5238595,
      longitude: -113.5290916,
      latitudeDelta: 0.0222,
      longitudeDelta: 0.0121,
    }
  };

  render() {
    return (
      <MapView
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        pitchEnabled={false}
        showsPointsOfInterest={false}
        style={styles.map}
        ref={map => this.map = map}
        initialRegion={this.state.region}>

      </MapView>
    );
  }
}

const styles = StyleSheet.create({
  map: {
    position: 'absolute',
    marginLeft: 1,
    zIndex: -1,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
});

export default Map;
