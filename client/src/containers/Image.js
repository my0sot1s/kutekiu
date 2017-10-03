import React, { Component } from 'react';
import { connect, bindActionCreators } from 'redux';
import * as actions from '../actions/image'
class Image extends Component {
    componentDidMount() {

    }
    render() {
        return (
            <div>

            </div>
        );
    }
}
export default connect(
    // mapStateToProps
    state => ({ image: state.image }),
    // mapDispatchToProps
    dispatch => ({ actions: bindActionCreators(...actions, dispatch) })
)(Image)