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

    this.userSubscription = null;
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);

    if (nextProps.user && !nextProps.requestId && nextProps.user.assignments.edges.length > 0){
      const { request } = nextProps.user.assignments.edges[0].node;

      if (!_.includes(["CANCELLED", "COMPLETED"], request.status)) {
        nextProps.setRequestId(request.id);
      }
    }

    if (nextProps.currentState == "PENDINGASSIGNED") {
      nextProps.setRequestId(nextProps.user.pendingAssignments.edges[0].node.request.id);
    }

    if (nextProps.currentState == "AVAILABLE" && this.props.currentState == "ASSIGNED") {
      nextProps.setRequestId(null);
    }

    if (nextProps.currentState != "UNAVAILABLE" && nextProps.currentState != "LOADING") {
      this._startUserSubscription(nextProps.user.id);
    }
  }

  _renderIcon = () => {
    const {
      currentState,
      requestState,
      user,
      request
    } = this.props;

    let icon;

    if (currentState == "PENDINGASSIGNED" && user.pendingAssignments.edges[0].node.request.requestor.name == "Tigger") {
      icon = require('../../static/tigger.jpg');
    } else {
      icon = require('../../static/piglet.jpg');
    }

    switch (currentState) {
      case "LOADING":
      case "AVAILABLE":
        return (<View/>);
      case "UNAVAILABLE":
        return (
          <View style={styles.thumbnailBorder}>
            <Thumbnail size={56} source={require('../../static/pooh.jpg')}/>
          </View>
        );
      case "PENDINGASSIGNED":
        return (
          <View style={styles.thumbnailBorder}>
            <Thumbnail size={56} source={icon}/>
          </View>
        );
      case "ASSIGNED":
        switch (requestState){
          case "LOADING":
          case "UNASSIGNED":
          case "ASSIGNED":
          case "ARRIVED":
            return (
              <View style={styles.thumbnailBorder}>
                <Thumbnail size={56} source={require('../../static/piglet.jpg')}/>
              </View>
            );
          case "INPROGRESS":
          case "COMPLETED":
            return (
              <View/>
            );
        }
    }
    return (<View/>);
  }

  _renderContent = () => {
    const {
      user,
      request,
      currentState,
      requestState,
    } = this.props;

    switch (currentState) {
      case "LOADING":
        return (<View/>);
      case "UNAVAILABLE":
        return (
          <View style={styles.content}>
            <Text style={{textAlign: 'center'}}>Hi there, {user.name}</Text>
          </View>
        );
      case "AVAILABLE":
        return (
          <View style={styles.content}>
            <Text style={{textAlign: 'center'}}>Awaiting assignment</Text>
            <ActivityIndicator
              style={{marginTop: 12}}
              size="large"
              color="#4CAF50"
              animating/>
          </View>
        );
      case "PENDINGASSIGNED":
        return (
          <View style={styles.content}>
            <Text style={{textAlign: 'center'}}>
              New Request from {user.pendingAssignments.edges[0].node.request.requestor.name}
            </Text>
          </View>
        );
      case "ASSIGNED":
        switch (requestState) {
          case "UNASSIGNED":
          case "ASSIGNED":
            return (
              <View style={styles.content}>
                <Text style={{textAlign: 'center'}}>
                  On way to {request.requestor.name}
                </Text>
              </View>
            );
          case "ARRIVED":
            return (
              <View style={styles.content}>
                <Text style={{textAlign: 'center'}}>Confirm Pickup</Text>
              </View>
            );
          case "INPROGRESS":
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
    return (<View/>);
  }

  _teardownUserSubscription = () => {
    console.log('tearingdown');
    this.userSubscription && this.userSubscription();
    this.userSubscription = null;
  }

  _startUserSubscription = (id) => {
    if (this.props.user || id) {
      console.log('startingup');
      this.userSubscription = this.props.subscribeToUserUpdate({id: id ? id : this.props.user.id});
    }
  }

  _setUserActive = () => {
    this._startUserSubscription();
    this.props.submitUserUpdate({id: 'VXNlcjoy', currentState: 'AVAILABLE'})
  }

  _setUserInactive = () => {
    this._teardownUserSubscription();
    this.props.submitUserUpdate({id: 'VXNlcjoy', currentState: 'UNAVAILABLE'})
  }

  _acceptPendingAssignment = () => {
    const { id } = this.props.user.pendingAssignments.edges[0].node;

    this.props.submitPendingAssignmentUpdate({ id, status: "ACCEPTED"})
    .then(({data}) => {
      this.props.setRequestId(data.updatePendingAssignment.changedPendingAssignment.request.id)
    });
  }

  _rejectPendingAssignment = () => {
    const { id } = this.props.user.pendingAssignments.edges[0].node;

    this.props.submitPendingAssignmentUpdate({ id, status: "REJECTED"})
    .then(() => this.props.setRequestId(null));
  }

  _confirmArrival = () => {
    const { id } = this.props.request;

    this.props.updateRequest({ id , status: "ARRIVED"});
  }

  _cancelRequest = () => {
    const { id } = this.props.request;

    this.props.updateRequest({ id , status: "CANCELLED"})
    .then(() => this.props.setRequestId(null));
  }

  _confirmPickup = () => {
    const { id } = this.props.request;

    this.props.updateRequest({ id , status: "INPROGRESS"});
  }

  _confirmDropoff = () => {
    const { id } = this.props.request;

    this.props.updateRequest({ id , status: "COMPLETED"})
    .then(() => this.props.setRequestId(null));
  }

  componentWillUnmount() {
    this._teardownUserSubscription();
  }

  _renderButton = () => {
    const {
      currentState,
      requestState,
    } = this.props;

    switch (currentState) {
      case "LOADING":
        return (
          <View/>
        );
      case "UNAVAILABLE":
        return (
          <Button
            block
            success
            onPress={this._setUserActive}
            style={styles.button}>
            <Text>{"Go Online"}</Text>
          </Button>
        );
      case "AVAILABLE":
        return (
          <Button
            block
            danger
            onPress={this._setUserInactive}
            style={styles.button}>
            <Text>{"Go Offline"}</Text>
          </Button>
        );
      case "PENDINGASSIGNED":
        return (
          <View style={{flexDirection: 'row'}}>
            <Button
              danger
              block
              onPress={this._rejectPendingAssignment}
              style={{margin: 16, flex: 1}}>
              <Text>{"Reject"}</Text>
            </Button>
            <Button
              success
              block
              onPress={this._acceptPendingAssignment}
              style={{margin: 16, flex: 1}}>
              <Text>{"Accept"}</Text>
            </Button>
          </View>
        );
      case "ASSIGNED":
        switch (requestState) {
          case "UNASSIGNED":
          case "ASSIGNED":
            return (
              <Button
                block
                info
                onPress={this._confirmArrival}
                style={styles.button}>
                <Text>{"Confirm Arrival"}</Text>
              </Button>
            );
          case "ARRIVED":
            return (
              <View style={{flexDirection: 'row'}}>
                <Button
                  danger
                  block
                  onPress={this._cancelRequest}
                  style={{margin: 16, flex: 1}}>
                  <Text>{"Cancel"}</Text>
                </Button>
                <Button
                  success
                  block
                  onPress={this._confirmPickup}
                  style={{margin: 16, flex: 1}}>
                  <Text>{"Confirm Pickup"}</Text>
                </Button>
              </View>
            );
          case "INPROGRESS":
            return (
              <Button
                block
                success
                onPress={this._confirmDropoff}
                style={styles.button}>
                <Text>{"Confirm Dropoff"}</Text>
              </Button>
            );
        }
    }

    return (<View/>);
  }

  render() {
    const {
      width: windowWidth,
      height: windowHeight,
      currentState
    } = this.props;

    const containerHeader = 175;

    const style = {
      top: currentState == "LOADING" ? windowHeight : windowHeight - containerHeader - 30,
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

const USER_SUBSCRIPTION = gql`
  subscription($id: ID) {
    subscribeToUser(filter: {
      id: { eq: $id },
      currentState: { in: [AVAILABLE, PENDINGASSIGNED, ASSIGNED] }
    },
    mutations: [updateUser]) {
      value {
        id
        name
        currentState
        assignments(where: {
          request: {
            status: { notIn: [CANCELLED, COMPLETED] }
          }
        }) {
          edges {
            node {
              id
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
        safewalker {
          id
          currentState
        }
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
`;

const USER_QUERY = gql`
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
      assignments(where: {
        request: {
          status: { notIn: [CANCELLED, COMPLETED] }
        }
      }) {
        edges {
          node {
            id
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
`;

const withUserData = graphql(
  USER_QUERY,
  {
    name: "user",
    options: {
      variables: {
        id: "VXNlcjoy"
      }
    },
    props: ({ownProps, user}) => {
      const mappedState = {};

      if (!user.loading && !user.error) {
        const { getUser: userData } = user;

        mappedState.user = userData;
        mappedState.currentState = userData.currentState;
      } else {
        mappedState.currentState = "LOADING";
      }

      return {
        ...mappedState,
        subscribeToUserUpdate: ({ id }) => {
          return user.subscribeToMore({
            document: USER_SUBSCRIPTION,
            variables: { id },
            updateQuery: (prev, {subscriptionData}) => {
              if (!subscriptionData.data) {
                return prev;
              }

              const nextState = { getUser: subscriptionData.data.subscribeToUser.value };

              return nextState;
            }
          })
        }
      }
    }
  }
);

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
      requestor {
        id
        name
      }
    }
  }
`;

const REQUEST_SUBSCRIPTION = gql`
  subscription onRequestChanged($filter: RequestSubscriptionFilter, $mutations: [RequestMutationEvent]!) {
    subscribeToRequest(filter: $filter, mutations: $mutations) {
      value {
        status
        id
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

      return {
        ...mappedState,
        subscribeToRequestUpdates: ({requestId}) => {
          return request.subscribeToMore({
            document: REQUEST_SUBSCRIPTION,
            variables: {
              filter: { id: { eq: requestId }},
              mutations: ["updateRequest"]
            },
            updateQuery: (prev, {subscriptionData}) => {
              if (!subscriptionData.data) {
                return prev;
              }

              const nextState = Object.assign({}, prev);
              nextState.getRequest.status = subscriptionData.data.subscribeToRequest.value.status;

              return nextState;
            }
          })
        }
      }
    }
  }
);

const withUpdateWalkerMutation = graphql(
  gql`
    mutation($input: UpdateUserInput!) {
      updateUser(input: $input) {
        changedUser {
          id
          currentState
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

const withUpdatePendingAssignmentMutation = graphql(
  gql`
    mutation($input: UpdatePendingAssignmentInput!) {
      updatePendingAssignment(input: $input) {
        changedPendingAssignment {
          id
          status
          request {
            id
          }
        }
      }
    }
  `,
  {
    name: 'updatePendingAssignment',
    props: ({ownProps, updatePendingAssignment}) => ({
      submitPendingAssignmentUpdate: ({ id, status }) => {
        return updatePendingAssignment({
          variables: { input: { id, status } }
        });
      }
    }),
  }
);

const withUpdateRequestMutation = graphql(
  gql`
    mutation($input: UpdateRequestInput!) {
      updateRequest(input: $input) {
        changedRequest {
          id
          status
        }
      }
    }
  `,
  {
    props: ({ownProps, mutate}) => ({
      updateRequest: ({ id, status }) => {
        return mutate({
          variables: { input: { id, status }}
        });
      }
    }),
  }
);

export default compose(
  withUpdateWalkerMutation,
  withUpdatePendingAssignmentMutation,
  withUpdateRequestMutation,
  withUserData,
  withRequestData,
)(Request);
