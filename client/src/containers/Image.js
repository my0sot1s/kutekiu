import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../actions/image'

class Image extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null
        }
    }

    componentDidMount() {
        this.props.dsac.getImages("https://kutekiu.herokuapp.com/api/Blog/getBlog?limit=5")
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.image.data
        })
    }

    render() {
        if (!this.state.data) {
            return <div>loading...</div>;
        }
        return (
            <div></div>
        );
    }
}
export default connect(
    // mapStateToProps
    state => ({ image: state.image }),
    // mapDispatchToProps
    dispatch => ({ dsac: bindActionCreators(actions, dispatch) })
)(Image)