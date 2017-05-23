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

  componentWillReceiveProps(nextProps) {

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

  setRequestId = (requestId) => {
    this.setState({requestId});
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
      // online,
      requestId,
      // dispatched,
      arrived,
      pickedUp,
    } = this.state;

    const {
      online,
      dispatched
    } = this.props;

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
          setRequestId={this.setRequestId}
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

const ASSIGNED_SUBSCRIPTION = gql`
  subscription($id: ID) {
    subscribeToPendingAssignment(filter: {
      safewalkerId: { eq: $id },
      status: { eq: PENDING }
    },
    mutations: [createPendingAssignment]) {
      value {
        id
        status
        request {
          id
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
`

const withUserData = graphql(
  gql`
    query($id: ID!) {
      getUser(id: $id) {
        id
        name
        currentState
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
  `,
  {
    name: "user",
    options: {
      variables: {
        id: "VXNlcjoy"
      }
    },
    props: ({ownProps, user}) => {
      return {
        ...mappedState,
        subscribeToAssigned: ({id}) => {
          return user.subscribeToMore({
            document: ASSIGNED_SUBSCRIPTION,
            variables: {
              id
            },
            updateQuery: (prev, {subscriptionData}) => {
              if (!subscriptionData.data) {
                return prev
              }

              console.log(subscriptionData.data);
              console.log(prev);

              return prev;
            }
          })
        }
      }
    }
  }
);

// export default compose(
//   withUserData
// )(MapScreen);

export default MapScreen;
