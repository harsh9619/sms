import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { AppState } from "../../saga/rootReducer";
import {
  fetchSchoolsRequest,
  fetchUsersRequest,
  createUserRequest,
  updateUserRequest,
  deleteUserRequest,
} from "../../saga";
import { UsersUI } from "../../components/modules/users/UsersUI";

const mapStateToProps = (state: AppState) => ({
  schools: state.school.schools,
  users: state.users.users,
  loading: state.users.loading,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchSchoolsRequest: () => dispatch(fetchSchoolsRequest()),
  fetchUsersRequest: (payload?: any) => dispatch(fetchUsersRequest(payload)),
  createUserRequest: (user: any) => dispatch(createUserRequest(user)),
  updateUserRequest: (payload: { id: string; user: any }) => dispatch(updateUserRequest(payload)),
  deleteUserRequest: (id: string) => dispatch(deleteUserRequest(id)),
});

const mapper = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof mapper>;

function UsersContainerComponent(props: PropsFromRedux) {
  return <UsersUI {...props} />;
}

export const UsersContainer = mapper(UsersContainerComponent);
export default UsersContainer;
