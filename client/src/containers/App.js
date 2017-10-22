
import React, { Component } from 'react';
import Container from "./content"
// import Container from "./image"
import Head from './components/helmet'
import ImageUpload from './ImageUpload'
import Nav from './components/nav'
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom';
import Profile from './profile'
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
            <BrowserRouter>
                <div id="app">
                    <Head />
                    <ImageUpload />
                    <Switch>
                        <Route path="/profile/:user_id" component={Profile} />
                        <Route path="/" component={Container} />
                    </Switch>
                    <code>v - 1.0.2</code>

                </div>
            </BrowserRouter>

        );
    }
}

export default AppBase;