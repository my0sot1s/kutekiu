
import React, { Component } from 'react';
import Image from "./Image"
import Head from './components/helmet'
import ImageUpload from './ImageUpload'
import Header from './components/Header'
import Footer from './components/Footer'
import Modal from "./components/modal"
// const bus = _bus.bus({ url: "amqp://wugaruqk:1WfsfZum9rQKHhBiq5Z4OvJ6ZkFqn9Gc@rhino.rmq.cloudamqp.com/wugaruqk" });

// var Stomp = require('stomp-client');
// var destination = '/queue/notifyQueue';
// var client = new Stomp({
//     vhost: 'rhino.rmq.cloudamqp.com',
//     user: 'wugaruqk',
//     pass: '1WfsfZum9rQKHhBiq5Z4OvJ6ZkFqn9Gc'
// });


class AppBase extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
        }
    }
    componentDidMount() {
        // document.title = "Kutekiu - Amazing Page";
        // client.connect(function (sessionId) {
        //     client.subscribe(destination, function (body, headers) {
        //         console.log('This is the body of a message on the subscribed queue:', body);
        //     });

        //     // client.publish(destination, 'Oh herrow');
        // });
    }
    showModal() {
        this.setState({ showModal: true });
    }
    render() {
        return (
            <div id="app">
                <button onClick={() => this.setState({ showModal: !this.state.showModal })}>Show modal</button>
                <Head />
                <Header />
                <Image />
                <ImageUpload showModal={this.state.showModal} />
                <Footer showModal={this.showModal.bind(this)} />
            </div >
        );
    }
}

export default AppBase;