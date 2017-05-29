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

import LocationMarker from './LocationMarker';
import BezierCurve from '../utils/BezierCurve';

class Map extends Component {

  state = {
    region: {
      latitude: 53.5238595,
      longitude: -113.5290916,
      latitudeDelta: 0.0222,
      longitudeDelta: 0.0121,
    },
    markers: [],
    polyLineCoords: [],
  };

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
    if (nextProps.requestState) {
      this.setState({
        markers: [
          nextProps.request.source,
          nextProps.request.destination
        ],
        polyLineCoords: BezierCurve(nextProps.request.source, nextProps.request.destination)
      });
    } else {
      this.setState({
        markers: [],
        polyLineCoords: []
      });
    }
  }

  componentWillMount() {
    this.intervalId = setInterval(() => navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position);
        this.props.submitUserLocation({...position.coords, id: "VXNlcjoy"})
        .then(result => console.log(result));
      },
      (error) => console.log(error),
      {timeout: 1000, maximumAge: 5000}
    ), 1000);
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

        {this.state.markers.map(({name, latitude, longitude}, index) =>
          (<MapView.Marker
            key={index}
            coordinate={{latitude, longitude}}>
            <LocationMarker position={index} title={name}/>
           </MapView.Marker>
          )
        )}

        {this.state.markers.length !== 0 && (
          <MapView.Polyline
            coordinates={this.state.polyLineCoords}
            lineCap="round"
            miterLimit={15}
            strokeWidth={1.5}
          />
        )}

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
        latitude
        longitude
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

const REQUEST_QUERY = gql`
  query requestQuery($id: ID!) {
    getRequest(id: $id) {
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
    }
  }
`;

const withRequestData = graphql(
  REQUEST_QUERY,
  {
    name: 'request',
    skip: ownProps => ownProps.requestId ? false : true,
    options: ownProps => ({ variables: { id: ownProps.requestId }}),
    props: ({ownProps, request}) => {
      const mappedState = {};

      if (!request.loading && !request.error) {
        const { getRequest: requestData } = request;

        mappedState.request = requestData;
        mappedState.requestState = requestData.status;
      }

      return { ...mappedState };
    }
  }
);

export default compose(
  withLocationMutation,
  withRequestData
)(Map);
