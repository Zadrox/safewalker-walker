/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import MapView from 'react-native-maps';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

class Map extends Component {

  state = {
    region: {
      latitude: 53.5238595,
      longitude: -113.5290916,
      latitudeDelta: 0.0222,
      longitudeDelta: 0.0121,
    }
  };

  componentWillMount() {
    this.intervalId = setInterval(() => navigator.geolocation.getCurrentPosition(
      (position) => {
        this.props.submitUserLocation({...position, id: "VXNlcjoy"});
      },
      (error) => console.log(error),
      {timeout: 10000, maximumAge: 10000}
    ), 10000);
  }

  componentWillUnmount() {
    clearTimeout(this.intervalId);
  }

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

const UPDATE_USER_LOCATION_MUTATION = gql`
  mutation($input: UpdateUserInput!) {
    updateUser(input: $input) {
      changedUser {
        id
        currentState
        latitude
        longitude
        pendingAssignments(where: {
          status: { eq: PENDING }
        }) {
          edges {
            node {
              id
              status
              request {
                id
                status
                source {
                  latitude
                  longitude
                  name
                }
                destination {
                  latitude
                  longitude
                  name
                }
                requestor {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`

const withLocationMutation = graphql(
  UPDATE_USER_LOCATION_MUTATION,
  {
    name: 'updateUserLocation',
    props: ({ownProps, updateUserLocation}) => ({
      submitUserLocation: ({id, latitude, longitude}) => {
        return updateUserLocation({
          variables: { input: {id, latitude, longitude}}
        });
      }
    })
  }
)

export default compose(
  withLocationMutation
)(Map);
