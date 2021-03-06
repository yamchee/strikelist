import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import React, { Component } from "react";
//import axios from "axios";
import { Row, Col, Nav, NavItem, Tab } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';
import moment from 'moment';

const dateFormatter = (cell, row) => {
    if (cell === undefined){
        return cell;
    }
    return (moment(cell).format('DD.MM.YYYY hh:mm'));
};

const pictureFormatter = (cell, row) => {
    return (
        <img src={cell} alt="example"/>
    );
};

const orderFormatter = (cell, row) => {
    let str = "";
    cell.forEach(pdt => str += "(" + pdt.productId + ", " + pdt.count + "), ");
    return (
        <p>{str}</p>
    );
}

const productColumns = [{
    dataField: 'createdAt',
    text: 'Created at',
    visibleColumnSize: 1,
    formatter: dateFormatter
}, {
    dataField: 'productId',
    text: 'Product ID',
    visibleColumnSize: 1
}, {
    dataField: 'name',
    text: 'Product Name',
    visibleColumnSize: 6
}, {
    dataField: 'displayName',
    text: 'Display Name',
    editor: {
        type: Type.TEXTAREA
    },
    visibleColumnSize: 3
}, {
    dataField: 'price',
    text: 'Product Price (CHF)',
    visibleColumnSize: 2
}, {
    dataField: 'picture',
    text: 'Product Picture',
    visibleColumnSize: 2,
    formatter: pictureFormatter
}];

const userColumns = [{
    dataField: 'createdAt',
    text: 'Created at',
    visibleColumnSize: 1,
    formatter: dateFormatter
}, {
    dataField: 'userId',
    text: 'User ID',
    visibleColumnSize: 1
}, {
    dataField: 'shortName',
    text: 'Short Name',
    visibleColumnSize: 3
}, {
    dataField: 'fullName',
    text: 'Full Name',
    visibleColumnSize: 3
}, {
    dataField: 'isAdmin',
    text: 'Is Admin?',
    visibleColumnSize: 2
}, {
    dataField: 'photo',
    text: 'User Picture',
    visibleColumnSize: 2,
    formatter: pictureFormatter
}];

const userOrderColumns = [{
    dataField: 'createdAt',
    text: 'Created at',
    visibleColumnSize: 1,
    formatter: dateFormatter
}, {
    dataField: 'updatedAt',
    text: 'Updated at',
    visibleColumnSize: 1,
    formatter: dateFormatter
}, {
    dataField: 'userId',
    text: 'User ID',
    visibleColumnSize: 1
}, {
    dataField: 'orders',
    text: 'All orders',
    visibleColumnSize: 6,
    formatter: orderFormatter
}];


class Admin extends Component {

    constructor() {
        super();

        this.state = {
          userOrders: [],
          products:[]
        };
    }

    componentDidMount() {
        fetch("/api/getUserOrders")
        .then(d => d.json())
        .then(res => this.setState({userOrders: res.data}));
    }

    render() {
        return (
            <div>
                <Tab.Container id="left-tabs-example" defaultActiveKey="first">
                    <Row className="clearfix">
                        <Col sm={2}>
                            <Nav bsStyle="pills" stacked>
                                <NavItem eventKey="first">User Orders</NavItem>
                                <NavItem eventKey="second">Users</NavItem>
                                <NavItem eventKey="third">Products</NavItem>
                            </Nav>
                        </Col>
                        <Col sm={10}>
                            <Tab.Content animation>
                                <Tab.Pane eventKey="first">
                                    <BootstrapTable
                                        keyField="userId"
                                        data={this.state.userOrders}
                                        columns={userOrderColumns}
                                    />
                                </Tab.Pane>
                                <Tab.Pane eventKey="second">
                                    <BootstrapTable
                                        keyField="userId"
                                        data={this.props.users}
                                        columns={userColumns}
                                        cellEdit={cellEditFactory({mode: 'click', blurToSave: true})}
                                        insertRow={true}
                                    />
                                </Tab.Pane>
                                <Tab.Pane eventKey="third">
                                    <BootstrapTable
                                        keyField="productId"
                                        data={this.props.products}
                                        columns={productColumns}
                                        cellEdit={cellEditFactory({mode: 'click', blurToSave: true})}
                                        insertRow={true}
                                    />
                                </Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>
            </div>
        );
    }
}

export default Admin;