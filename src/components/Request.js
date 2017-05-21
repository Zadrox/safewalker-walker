/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Button, Thumbnail } from 'native-base';

import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import _ from 'lodash';

class Request extends Component {
  constructor(props) {
    super(props);

    // handles to subscriptions go here.
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps.localRequests);
  }

  _renderIcon = () => {
    const {
      online,
      requestId,
      dispatched,
      arrived,
      pickedUp,
    } = this.props;

    if (!online) {
      return (
        <View style={styles.thumbnailBorder}>
          <Thumbnail size={56} source={{uri: 'https://avatars3.githubusercontent.com/u/7960861?v=3&s=460'}}/>
        </View>
      );
    } else if (!requestId) {
      return (
        <View/>
      );
    } else if ((requestId || dispatched || arrived) && !pickedUp) {
      return (
        <View style={styles.thumbnailBorder}>
          <Thumbnail size={56} source={{uri: 'https://avatars0.githubusercontent.com/u/15644165?v=3&s=460'}}/>
        </View>
      );
    } else if (pickedUp) {
      return (
        <View/>
      );
    }
  }

  _renderContent = () => {
    const {
      online,
      requestId,
      dispatched,
      arrived,
      pickedUp,
    } = this.props;

    if (!online) {
      return (
        <View style={styles.content}>
          <Text style={{textAlign: 'center'}}>Hi there, Nicholas L.</Text>
        </View>
      );
    } else if (!requestId) {
      return (
        <View style={styles.content}>
          <Text style={{textAlign: 'center'}}>Waiting for Dispatch</Text>
          <ActivityIndicator
            style={{marginTop: 12}}
            size="large"
            color="#4CAF50"
            animating/>
        </View>
      );
    } else if (requestId && !dispatched) {
      return (
        <View style={styles.content}>
          <Text style={{textAlign: 'center'}}>New Request from Christopher R.</Text>
        </View>
      );
    } else if (dispatched && !arrived) {
      return (
        <View style={styles.content}>
          <Text style={{textAlign: 'center'}}>On way to Christopher R.</Text>
        </View>
      );
    } else if (arrived && !pickedUp) {
      return (
        <View style={styles.content}>
          <Text style={{textAlign: 'center'}}>Confirm Pickup</Text>
        </View>
      );
    } else if (pickedUp) {
      return (
        <View style={styles.content}>
          <Text style={{textAlign: 'center'}}>In Progress</Text>
          <ActivityIndicator
            style={{marginTop: 12}}
            size="large"
            color="#4CAF50"
            animating/>
        </View>
      );
    }
  }

  _setUserActive = () => {
    submitUserUpdate({id: 'VXNlcjoy', currentState: 'AVAILABLE'})
    .then(() => this.props.toggleOnline());
  }

  _setUserInactive = () => {
    submitUserUpdate({id: 'VXNlcjoy', currentState: 'UNAVAILABLE'})
    .then(() => this.props.toggleOnline());
  }

  _renderButton = () => {
    const {
      online,
      requestId,
      toggleOnline,
      acceptDispatch,
      dispatched,
      arrived,
      cancelDispatch,
      confirmPickup,
      pickedUp,
      confirmComplete,
      submitUserUpdate,
    } = this.props;

    if (!online) {
      return (
        <Button
          block
          success
          onPress={toggleOnline}
          style={styles.button}>
          <Text>{"Go Online"}</Text>
        </Button>
      );
    } else if (!requestId) {
      return (
        <Button
          block
          danger
          onPress={toggleOnline}
          style={styles.button}>
          <Text>{"Go Offline"}</Text>
        </Button>
      );
    } else if (requestId && !dispatched) {
      return (
        <Button
          block
          info
          onPress={acceptDispatch}
          style={styles.button}>
          <Text>{"Acknowledge"}</Text>
        </Button>
      );
    } else if (dispatched && !arrived) {
      return (<View/>);
    } else if (arrived && !pickedUp) {
      return (
        <View style={{flexDirection: 'row'}}>
          <Button
            danger
            block
            onPress={cancelDispatch}
            style={{margin: 16, flex: 1}}>
            <Text>{"Cancel"}</Text>
          </Button>
          <Button
            success
            block
            onPress={confirmPickup}
            style={{margin: 16, flex: 1}}>
            <Text>{"Met Requestor"}</Text>
          </Button>
        </View>
      );
    } else if (pickedUp) {
      return (
        <Button
          block
          success
          onPress={confirmComplete}
          style={styles.button}>
          <Text>{"Complete"}</Text>
        </Button>
      );
    }
  }

  render() {
    const {
      width: windowWidth,
      height: windowHeight,
    } = this.props;

    const containerHeader = 175;

    const style = {
      top: windowHeight - containerHeader - 30,
      height: containerHeader + 30,
      paddingTop: 30
    }

    return (
      <Animatable.View
        style={[styles.container, style]}
        duration={250}
        easing="ease-out"
        transition={["top"]}>
        {this._renderIcon()}
        <View style={[styles.innerContainer, {height: containerHeader, width: windowWidth - 32}]}>
          {this._renderContent()}
          <View style={styles.separator} />
          {this._renderButton()}
        </View>
      </Animatable.View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    zIndex: 1,
    alignItems: 'center',
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    elevation: 12,
    marginLeft: 16,
    marginRight: 16,
    justifyContent: 'center',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: 'white',
  },
  button: {
    margin: 16,
  },
  thumbnailBorder: {
    position: 'absolute',
    top: 0,
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    elevation: 12,
    width: 64,
    height: 64,
    borderRadius: 32
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    width: '100%',
    height: 2,
    backgroundColor: '#EDEDED',
  }
};

const withUpdateWalkerMutation = graphql(
  gql`
    mutation($input: UpdateUserInput!) {
      updateUser(input: $input) {
        changedUser {
          id
          currentState
          latitude
          longitude
        }
      }
    }
  `,
  {
    name: 'updateUser',
    props: ({ownProps, updateUser}) => ({
      submitUserUpdate: ({ id, currentState }) => {
        return updateUser({
          variables: { input: { id, currentState }}
        });
      }
    }),
  }
);

const REQUEST_SUBSCRIPTION = gql`
  subscription onNewRequest($filter: RequestSubscriptionFilter, $mutations: [RequestMutationEvent]!) {
    subscribeToRequest(filter: $filter, mutations: $mutations) {
      value {
        id
        requestor {
          id
          name
        }
        source {
          name
          latitude
          longitude
        }
        destination {
          name
          latitude
          longitude
        }
      }
    }
  }
`;

const withRequestsQuery = graphql(
  gql`
    query getLocalRequests($where: RequestWhereArgs) {
      viewer {
        id
        allRequests(where: $where) {
          edges {
            node {
              id
              requestor {
                id
                name
              }
              source {
                name
                latitude
                longitude
              }
              destination {
                name
                latitude
                longitude
              }
            }
          }
        }
      }
    }
  `,
  {
    name: 'localRequests',
    skip: (ownProps) => ownProps.currentLocation ? false : true,
    options: (ownProps) => {

      const SEARCH_RADIUS = 0.05;
      const { latitude, longitude } = ownProps.currentLocation;

      const lowerLatBound = latitude - SEARCH_RADIUS;
      const upperLatBound = latitude + SEARCH_RADIUS;

      const latBetween = [lowerLatBound, upperLatBound];

      const lowerLngBound = longitude - SEARCH_RADIUS;
      const upperLngBound = longitude + SEARCH_RADIUS;

      const lngBetween = [lowerLngBound, upperLngBound];

      return {
        variables: { where: {
          status: {eq: "UNASSIGNED"},
          srcLat: {between: latBetween},
          srcLng: {between: lngBetween},
        }}
      }
    },
    props: ({ownProps, localRequests}) => {
      return {
        localRequests,
        subscribeToLocalRequests: ({currentLocation}) => {
          return localRequests.subscribeToMore({
            document: REQUEST_SUBSCRIPTION,
            variables: {
              filter: {
                status: {eq: "UNASSIGNED"},
                srcLat: {between: [53, 54]},
                srcLng: {between: [-113, -114]}
              },
              mutations: ["createRequest"]
            },
            updateQuery: (prev, {subscriptionData}) => {
              if (!subscriptionData.data) {
                return prev;
              }

              console.log(subscriptionData);

              return prev
            }
          })
        }
      }
    }
  }
);

export default compose(
  withUpdateWalkerMutation,
  withRequestsQuery
)(Request);
