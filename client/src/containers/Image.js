import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../actions/image'
import Loader from './components/loader'
import _ from 'lodash';
import Modal from "./components/modal"
// require("./image.css")


class Image extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            page: 0, limit: 9,
            doUpdate: false,
            noItem: false,
            showModal: false,


            img: "", tag: ""
        }
    }
    /**
     * 
     * @param {number} limit 
     * @param {number} page 
     */
    fetchAction(page) {
        if (!page) page = 0;
        this.props.dsac.getImages(
            `https://kutekiu.herokuapp.com/api/Image/getImage?limit=${this.state.limit}&page=${page}`);
    }
    componentDidMount() {
        this.fetchAction();
        window.addEventListener('scroll', this.handleScroll.bind(this));
    }
    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll.bind(this));
    }
    handleScroll(e) {

        var scrollTop = document.documentElement.scrollTop,
            scrollHeight = document.documentElement.scrollHeight,
            possion = scrollHeight - document.documentElement.clientHeight;
        if (scrollTop / possion > 0.75 && !this.state.doUpdate) {
            this.setState((prevState) => ({
                page: prevState.page + 1,
                doUpdate: true,
                showModal: false
            }), () => {
                this.fetchAction(this.state.page);
            });
        }
    }
    showModal(image, tag) {
        this.setState({ image, tag, showModal: true })
    }
    componentWillReceiveProps(nextProps) {
        let _src = []
        if (nextProps.image.data.length === 0) { alert("Éo còn item.Liên Lạc Tể để get more Auto scroll limit"); return; }
        nextProps.image.data.map(value => _src.push({ src: value.data, thumbnail: value.data }))
        let _temp = _.chunk(_src, Math.floor(_src.length / 3));
        if (this.state.page === 0 && (!this.state.data || this.state.data.length === 0)) {
            this.setState({
                data: _temp
            })
        } else {
            this.setState((prevState) => {
                return {
                    data: [
                        [...prevState.data[0], ..._temp[0]],
                        [...prevState.data[1], ..._temp[1]],
                        [...prevState.data[2], ..._temp[2]]
                    ],
                    doUpdate: false
                }
            })
        }
    }

    renderItem(src, tag, key) {
        return (
            <div className="item" key={key}
                onClick={() => this.showModal(src, tag)}>
                <img src={src} tag={tag} />
                <div className="wrapper">
                    <div className="btn"></div>
                </div>
            </div>)
    }
    renderContent(array) {
        return (
            <div className="content" ref="scroller">
                {array.map((value, key) => { return this.renderItem(value.src, value.src, key) })}
            </div>
        )
    }
    render() {
        if (!this.state.data) {
            return <Loader />;
        }
        let pim = [];
        for (var i = 0; i < 3; i++) {
            pim.push(this.renderContent(this.state.data[i]));
        }
        return (

            <div className="container">
                {pim}
                <Modal showModal={this.state.showModal}>
                    <img src={this.state.image} tag={this.state.tag} />
                </Modal>
            </div>
        );
    }
}
export default connect(
    // mapStateToProps
    state => ({ image: state.image }),
    // mapDispatchToProps
    dispatch => ({ dsac: bindActionCreators(actions, dispatch) })
)(Image)