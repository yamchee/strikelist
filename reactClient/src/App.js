// /client/App.js
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import React, { Component } from "react";
import axios from "axios";
import {Grid, Row, Col, Thumbnail, Button, Badge, Navbar} from 'react-bootstrap';
import Modal from './Modal';

class App extends Component {
    // initialize our state
    state = {
        data: [],
        products: [],
        id: 0,
        message: null,
        intervalIsSet: true,
        idToDelete: null,
        idToUpdate: null,
        objectToUpdate: null,
        isOpen: false
    };

    toggleModal = () => {
        console.log(this.state.isOpen);
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    // when component mounts, first thing it does is fetch all existing data in our db
    // then we incorporate a polling logic so that we can easily see if our db has
    // changed and implement those changes into our UI
    componentDidMount() {
        this.getDataFromDb();
        this.getProductsFromDb();
        if (!this.state.intervalIsSet) {
            let interval = setInterval(this.getDataFromDb, 1000);
            this.setState({ intervalIsSet: interval });
        }
    }

    // never let a process live forever
    // always kill a process everytime we are done using it
    componentWillUnmount() {
        if (this.state.intervalIsSet) {
            clearInterval(this.state.intervalIsSet);
            this.setState({ intervalIsSet: null });
        }
    }

    // just a note, here, in the front end, we use the id key of our data object
    // in order to identify which we want to Update or delete.
    // for our back end, we use the object id assigned by MongoDB to modify
    // data base entries

    // our first get method that uses our backend api to
    // fetch data from our data base
    getDataFromDb = () => {
        fetch("/api/getData")
            .then(d => d.json())
            .then(res => this.setState({ data: res.data }));
    };

    getProductsFromDb = () => {
        fetch("/api/getProducts")
            .then(d => d.json())
            .then(res => this.setState({ products: res.data }));
    };

    // our put method that uses our backend api
    // to create new query into our data base
    putDataToDB = message => {
        let currentIds = this.state.data.map(data => data.id);
        let idToBeAdded = 0;
        while (currentIds.includes(idToBeAdded)) {
            ++idToBeAdded;
        }

        axios.post("/api/putData", {
            id: idToBeAdded,
            message: message
        });
    };


    // our delete method that uses our backend api
    // to remove existing database information
    deleteFromDB = idTodelete => {
        let objIdToDelete = null;
        this.state.data.forEach(dat => {
            if (dat.id === idTodelete) {
                objIdToDelete = dat._id;
            }
        });

        axios.delete("/api/deleteData", {
            data: {
                id: objIdToDelete
            }
        });
    };


    // our update method that uses our backend api
    // to overwrite existing data base information
    updateDB = (idToUpdate, updateToApply) => {
        let objIdToUpdate = null;
        this.state.data.forEach(dat => {
            if (dat.id === idToUpdate) {
                objIdToUpdate = dat._id;
            }
        });

        axios.post("/api/updateData", {
            id: objIdToUpdate,
            update: { message: updateToApply }
        });
    };


    // here is our UI
    // it is easy to understand their functions when you
    // see them render into our screen
    render() {
        const { products } = this.state;
        return (
        <div>
            {/*
        <ul>
        {data.length <= 0
            ? "NO DB ENTRIES YET"
            : data.map(dat => (
                <li style={{ padding: "10px" }} key={data.message}>
    <span style={{ color: "gray" }}> id: </span> {dat.id} <br />
        <span style={{ color: "gray" }}> data: </span>
        {dat.message}
    </li>
    ))}
    </ul>
        <div style={{ padding: "10px" }}>
    <input
        type="text"
        onChange={e => this.setState({ message: e.target.value })}
        placeholder="add something in the database"
        style={{ width: "200px" }}
        />
        <button onClick={() => this.putDataToDB(this.state.message)}>
        ADD
        </button>
        </div>
        <div style={{ padding: "10px" }}>
    <input
        type="text"
        style={{ width: "200px" }}
        onChange={e => this.setState({ idToDelete: e.target.value })}
        placeholder="put id of item to delete here"
            />
            <button onClick={() => this.deleteFromDB(this.state.idToDelete)}>
        DELETE
        </button>
        </div>
        <div style={{ padding: "10px" }}>
    <input
        type="text"
        style={{ width: "200px" }}
        onChange={e => this.setState({ idToUpdate: e.target.value })}
        placeholder="id of item to update here"
            />
            <input
        type="text"
        style={{ width: "200px" }}
        onChange={e => this.setState({ updateToApply: e.target.value })}
        placeholder="put new value of the item here"
            />
            <button
        onClick={() =>
        this.updateDB(this.state.idToUpdate, this.state.updateToApply)
    }
    >
        UPDATE
        </button>
        </div>
*/}
        <Navbar>
        </Navbar>
            <button onClick={this.toggleModal}>
                Open the modal
            </button>
            <Modal show={this.state.isOpen}
                   onClose={this.toggleModal}>
                Here's some content for the modal
            </Modal>
            <Grid>
                <Row> {
                    products.map(product => (
                        <Col xs={6} md={3}>
                            <Thumbnail src={product.picture} alt="242x200">
                                <h3>{product.displayName}</h3>
                                <h4>{product.price}<Badge className={'pull-right'}>0</Badge></h4>
                                <Button bsStyle="primary">Hinzufügen</Button>
                            </Thumbnail>
                        </Col>
                    ))
                }
                    <Col xs={6} md={3}>
                        <Thumbnail src="https://via.placeholder.com/242x200" alt="242x200">
                            <h3>Kaffee</h3>
                            <h4>0.50 CHF<Badge className={'pull-right'}>0</Badge></h4>
                            <Button bsStyle="primary">Hinzufügen</Button>
                        </Thumbnail>
                    </Col>
                    <Col xs={6} md={3}>
                        <Thumbnail src="https://via.placeholder.com/242x200" alt="242x200">
                            <h3>Tee</h3>
                                <h4>0.40 CHF<Badge className={'pull-right'}>0</Badge></h4>
                                <Button bsStyle="primary">Hinzufügen</Button>
                        </Thumbnail>
                    </Col>
                    <Col xs={6} md={3}>
                        <Thumbnail src="https://via.placeholder.com/242x200" alt="242x200">
                            <h3>Chips</h3>
                            <h4>1.20 CHF<Badge className={'pull-right'}>0</Badge></h4>
                            <Button bsStyle="primary">Hinzufügen</Button>
                        </Thumbnail>
                    </Col>
                    <Col xs={6} md={3}>
                        <Thumbnail src="https://via.placeholder.com/242x200" alt="242x200">
                            <h3>Frucht</h3>
                            <h4>1.00 CHF<Badge className={'pull-right'}>0</Badge></h4>
                            <Button bsStyle="primary">Hinzufügen</Button>
                        </Thumbnail>
                    </Col>
                </Row>
            </Grid>
        </div>

    );
    }
}

export default App;
