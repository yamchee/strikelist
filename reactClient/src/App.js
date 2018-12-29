// /client/App.js
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import React, { Component } from "react";
import axios from "axios";
import { Grid, Row, Col, Thumbnail, Button, Badge, Navbar, Nav, NavItem } from 'react-bootstrap';
import Modal from 'react-modal';
import Admin from './Admin';
import Dialog from 'react-bootstrap-dialog';

const customStyles = {
    content : {
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)'
    }
};

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement(document.getElementById('root'));

class App extends Component {

    constructor() {
        super();
        // initialize our state
        this.state = this.getInitialState();
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    openModal() {
        this.setState({ modalIsOpen: true });
    }
    closeModal() {
        this.setState({ modalIsOpen: false });
    }

    getInitialState = () => {
        return {
            data: [],
            products: [],
            users: [],
            userOrders: [],
            orderCache: [],
            id: 0,
            message: null,
            intervalIsSet: true,
            idToDelete: null,
            idToUpdate: null,
            objectToUpdate: null,
            modalIsOpen: true,
            shouldCloseModal: false,
            userName: '',
            password: '',
            isAdmin: false,
            adminText: 'Admin',
            canLogin: false,
            loggedInUserName: '',
            userLoggedIn: false,
            changesMade: false
        };
    };
    handleUserName = (e) => {
        let gp = document.getElementById("userGroupId");
        if (gp == null) {
            return;
        }
        if (e.target.value === ""){
            gp.classList.add("has-error");
            this.setState({canLogin: false});
        }
        else {
            gp.classList.remove("has-error");
            this.setState({canLogin: true});
        }
        this.setState({userName: e.target.value});
    };

    handlePassword = (e) => {
        this.setState({password: e.target.value});
    };

    toggleAdmin = () => {
        this.setState({isAdmin: !this.state.isAdmin});
        let inp = document.getElementById("inputEmail");
        if (!this.state.isAdmin){
            this.setState({adminText: 'Nicht-Admin'});
            inp.placeholder = 'UserName';
        }
        else {
            this.setState({adminText: 'Admin'});
            inp.placeholder = 'Kürzel';
        }
    };

    handleLoginResponse = (response) => {
        let gp = document.getElementById("userGroupId");
        if (!response.data.success) {
            gp.classList.add("has-error");
            this.setState({userLoggedIn: false});
        }
        else {
            gp.classList.remove("has-error");
            this.setState({loggedInUserName: response.data.data.shortName, shouldCloseModal: true, userLoggedIn: true});
            this.closeModal();
        }
    };

    loginAttempt = () => {
        if (!this.state.isAdmin) {
            axios.post("/api/login", {
                userId: this.state.userName
            }).then(this.handleLoginResponse);
        }
        else {
            axios.post("/api/loginAdmin", {
                userName: this.state.userName,
                password: this.state.password
            }).then(this.handleLoginResponse);
        }
    };

    logout = () => {
        // save to DB from cache.
        if (this.state.orderCache.length > 0){
            this.dialog.show({
                title: 'Save Changes',
                body: 'Changes have been made. Save?',
                actions: [
                    Dialog.CancelAction(() => {
                        this.dialog.hide();
                        this.setState(this.getInitialState());
                        this.openModal();
                    }),
                    Dialog.OKAction(() => {
                        this.state.orderCache.forEach(order =>
                            axios.post("/api/putUserOrder", {userId: this.state.userName, productId: order.productId}));
                        this.dialog.hide();
                        this.setState(this.getInitialState());
                        this.openModal();
                    })
                ],
                bsSize: 'small',
                onHide: (dialog) => {
                    dialog.hide();
                    console.log('closed by clicking background.');
                }
            });
        }
    };

    isEmpty = (obj) => {
        for(var prop in obj){
            return false;
        }
        return true;
    };

    componentWillUpdate(nextprops, nextState) {
        if (!this.state.userLoggedIn && this.state.userLoggedIn !== nextState.userLoggedIn){
            this.getProductsForUserFromDb(this.state.userName);
            this.getProductsFromDb();
            this.getUsersFromDb();
        }
    }

    // when component mounts, first thing it does is fetch all existing data in our db
    // then we incorporate a polling logic so that we can easily see if our db has
    // changed and implement those changes into our UI
    componentDidMount() {
        //this.getDataFromDb();
        //this.getProductsFromDb();
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

    getUsersFromDb = () => {
        fetch("/api/getUsers")
            .then(d => d.json())
            .then(res => this.setState({ users: res.data }));
    };

    getProductsForUserFromDb = (userId) => {
        fetch("/api/getSpecificUserOrders?userId="+userId)
            .then(d => d.json())
            .then(res => {
                if (res.data.length > 0) {
                    this.setState({userOrders: res.data[0].orders});
                }
            });
    };

    addOrder = (order) => {
        this.setState(prevState => ({
            orderCache: [...prevState.orderCache, order]
        }));
        let orders = [...this.state.userOrders];
        let index = orders.findIndex(uo => uo.productId === order.productId);
        if (index < 0){
            this.setState(prevState => ({
                userOrders: [...prevState.userOrders, {productId: order.productId, count: 1}]
            }));
        }
        else {
            let userOrdersCopy = JSON.parse(JSON.stringify(this.state.userOrders));
            let c = this.state.userOrders[index].count;
            userOrdersCopy[index].count = c +1;
            this.setState({ userOrders: userOrdersCopy });
        }
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
        const { products, users, userOrders } = this.state;
        return (
            <div>
                <Navbar>
                    <Nav pullRight>
                        <NavItem><p className="loginName">{this.state.loggedInUserName}</p></NavItem>
                        <NavItem><Button bsStyle="primary" className="logout" onClick={this.logout}>Abmelden</Button></NavItem>
                    </Nav>
                </Navbar>
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    shouldCloseOnOverlayClick={this.state.shouldCloseModal}
                    closeOnEscape={this.state.shouldCloseModal}
                    style={customStyles}
                    contentLabel="Login">
                    <div>
                        <Button className="pull-right" bsStyle="link" onClick={this.toggleAdmin}>{this.state.adminText}</Button><br/>
                        <form className="form-signin" noValidate={true}>
                            <div className="form-group" id="userGroupId">
                                <label htmlFor="inputEmail" className="sr-only">Email address</label>
                                <input type="email" id="inputEmail" className="form-control"
                                       value={this.state.userName} onChange={this.handleUserName}
                                       placeholder="Kürzel" required autoFocus={true}/>
                            </div>
                            <div className={this.state.isAdmin ? '' : 'hidden'}>
                                <label htmlFor="inputPassword" className="sr-only">Password</label>
                                <input type="password" id="inputPassword" className="form-control" value={this.state.password}
                                       onChange={this.handlePassword}
                                       placeholder="Password"/>
                                <div className="checkbox">
                                <label>
                                    <input type="checkbox" value="remember-me"/> Remember me
                                </label>
                                </div>
                            </div>
                            <Button className="btn btn-lg btn-primary btn-block" bsStyle="primary"
                                    disabled={!this.state.canLogin}
                                    onClick={this.loginAttempt}>Anmelden</Button>
                        </form>
                    </div>
                </Modal>
                <Dialog ref={(el) => { this.dialog = el }} />
                <Grid hidden={this.state.isAdmin === true}>
                    <Row> {
                        products.map(product => {
                            let userOrder = userOrders.find(uo => uo.productId === product.productId);
                            return <Col xs={6} md={3} key={product.productId}>
                                <Thumbnail src={product.picture} alt="242x200">
                                    <h3>{product.displayName}</h3>
                                    <h4>
                                        {product.price.toFixed(2)} CHF
                                        <Badge className={'pull-right'}>{userOrder === undefined ? 0: userOrder.count}</Badge>
                                    </h4>
                                    <Button bsStyle="primary" onClick={() => this.addOrder(product)}>Hinzufügen</Button>
                                </Thumbnail>
                            </Col>
                            }
                        )
                    }
                    </Row>
                </Grid>
                {
                    this.state.modalIsOpen || !this.state.isAdmin || !this.state.userLoggedIn
                    ? null : <Admin products={products} users={users}/>
                }
            </div>

        );
    }
}

export default App;
