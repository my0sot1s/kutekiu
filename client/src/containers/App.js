
import React, { Component } from 'react';
import Container from "./content"
// import Container from "./image"
import Head from './components/helmet'
// import ImageUpload from './ImageUpload'
import Nav from './components/nav'
// import Footer from './components/Footer'
// import Modal from "./components/modal"

class AppBase extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
        }
    }
    componentDidMount() {
    }
    showModal() {
        this.setState({ showModal: true });
    }
    render() {
        return (
            <div id="app">
                {/* <button onClick={() => this.setState({ showModal: !this.state.showModal })}>Show modal</button> */}
                <Head />
                {/* <Nav /> */}
                <Container />
                {/* <ImageUpload showModal={this.state.showModal} /> */}
                {/* <Footer showModal={this.showModal.bind(this)} /> */}
            </div >
        );
    }
}

export default AppBase;