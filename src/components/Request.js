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
  componentWillReceiveProps(nextProps) {
    console.log("nextProps: ", nextProps);
  }

  _renderIcon = () => {
    const {
      online,
      requestId,
      dispatched,
      arrived,
      pickedUp,
      currentState,
      requestState
    } = this.props;

    switch (currentState) {
      case "LOADING":
      case "AVAILABLE":
        return (<View/>);
      case "UNAVAILABLE":
        return (
          <View style={styles.thumbnailBorder}>
            <Thumbnail size={56} source={{uri: 'https://avatars3.githubusercontent.com/u/7960861?v=3&s=460'}}/>
          </View>
        );
      case "PENDINGASSIGNED":
        return (
          <View style={styles.thumbnailBorder}>
            <Thumbnail size={56} source={{uri: 'https://avatars0.githubusercontent.com/u/15644165?v=3&s=460'}}/>
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
                <Thumbnail size={56} source={{uri: 'https://avatars0.githubusercontent.com/u/15644165?v=3&s=460'}}/>
              </View>
            );
          case "INPROGRESS":
          case "COMPLETED":
            return (
              <View/>
            );
        }
    }

    // } else if (pickedUp) {
    //   return (
    //     <View/>
    //   );
    // }
  }

  _renderContent = () => {
    const {
      online,
      requestId,
      dispatched,
      arrived,
      pickedUp,
      currentState,
      requestState,
    } = this.props;

    switch (currentState) {
      case "LOADING":
        return (<View/>);
      case "UNAVAILABLE":
        return (
          <View style={styles.content}>
            <Text style={{textAlign: 'center'}}>Hi there, Nicholas L.</Text>
          </View>
        );
      case "AVAILABLE":
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
      case "PENDINGASSIGNED":
        return (
          <View style={styles.content}>
            <Text style={{textAlign: 'center'}}>New Request from Christopher R.</Text>
          </View>
        );
      case "ASSIGNED":
        switch (requestState) {
          case "UNASSIGNED":
          case "ASSIGNED":
            return (
              <View style={styles.content}>
                <Text style={{textAlign: 'center'}}>On way to Christopher R.</Text>
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
    // } else if (arrived && !pickedUp) {
    //   return (
    //     <View style={styles.content}>
    //       <Text style={{textAlign: 'center'}}>Confirm Pickup</Text>
    //     </View>
    //   );
    // } else if (pickedUp) {
    //   return (
    //     <View style={styles.content}>
    //       <Text style={{textAlign: 'center'}}>In Progress</Text>
    //       <ActivityIndicator
    //         style={{marginTop: 12}}
    //         size="large"
    //         color="#4CAF50"
    //         animating/>
    //     </View>
    //   );
    // }
  }

  _setUserActive = () => {
    // if (!this.assignedSubscription)
    //   this.assignedSubscription = this.props.subscribeToAssigned({id: this.props.user.id});
    this.props.submitUserUpdate({id: 'VXNlcjoy', currentState: 'AVAILABLE'})
    // .then(() => this.props.toggleOnline());
  }

  _setUserInactive = () => {
    // this.assignedSubscription && this.assignedSubscription();
    // this.assignedSubscription = null;
    this.props.submitUserUpdate({id: 'VXNlcjoy', currentState: 'UNAVAILABLE'})
    // .then(() => this.props.toggleOnline());
  }

  _acceptPendingAssignment = () => {
    console.log(this.props.user);

    const { id } = this.props.user.pendingAssignments.edges[0].node;

    this.props.submitPendingAssignmentUpdate({ id, status: "ACCEPTED"})
    .then(({data}) => {
      console.log(data);
      this.props.setRequestId(data.updatePendingAssignment.changedPendingAssignment.request.id)
    });
  }

  _rejectPendingAssignment = () => {
    const { id } = this.props.user.pendingAssignments.edges[0].node;

    this.props.submitPendingAssignmentUpdate({ id, status: "REJECTED"});
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
    // this.assignedSubscription && this.assignedSubscription();
    // this.assignedSubscription = null;
  }

  _setRequestId = () => {
    this.props.submitPendingAssignmentUpdate({})
    .then(result => console.log(result));
    // sets the request id when walker accepts pendingAssignment
  }

  _renderButton = () => {
    const {
      online,
      requestId,
      request,
      toggleOnline,
      acceptDispatch,
      dispatched,
      arrived,
      cancelDispatch,
      confirmPickup,
      pickedUp,
      confirmComplete,
      submitUserUpdate,
      currentState,
      requestState,
    } = this.props;

    console.log(requestState);

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
    // } else if (dispatched && !arrived) {
    //   return (<View/>);
    // } else if (arrived && !pickedUp) {
    //   return (
    //     <View style={{flexDirection: 'row'}}>
    //       <Button
    //         danger
    //         block
    //         onPress={cancelDispatch}
    //         style={{margin: 16, flex: 1}}>
    //         <Text>{"Cancel"}</Text>
    //       </Button>
    //       <Button
    //         success
    //         block
    //         onPress={confirmPickup}
    //         style={{margin: 16, flex: 1}}>
    //         <Text>{"Met Requestor"}</Text>
    //       </Button>
    //     </View>
    //   );
    // } else if (pickedUp) {
    //   return (
    //     <Button
    //       block
    //       success
    //       onPress={confirmComplete}
    //       style={styles.button}>
    //       <Text>{"Complete"}</Text>
    //     </Button>
    //   );
    // }
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
        ...mappedState
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

      console.log('YOU SHOULD BE EXECUTING...');

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
