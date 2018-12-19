const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const Data = require("./dbModels/data");
const Product = require("./dbModels/product");
const User = require("./dbModels/user");
const Order = require("./dbModels/order");
const UserOrder = require("./dbModels/userOrders");
// LDAP library, documented at http://ldapjs.org/client.html
const ldap = require('ldapjs');

const API_PORT = 3001;
const app = express();
const router = express.Router();

// this is our MongoDB database
const dbRoute = "mongodb://localhost:27017/testdb";

// connects our back end code with the database
mongoose.connect(
    dbRoute,
    { useNewUrlParser: true }
);

let db = mongoose.connection;

db.once("open", () => console.log("connected to the database"));

// checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));

router.post("/login", (req, res) => {
    const url = "ldap://hapa.ch";
    let client = ldap.createClient({url: url});
    let result = "";
    const adSuffix = "dc=hapa,dc=ch";

    client.bind(req.body.userName, req.body.password, err => {
        if (err) {
            console.log(err);
			return ;
        }
        console.log("login works");
    });

    // Search AD for user
    const searchOptions = {
        scope: "sub",
        filter: `(userPrincipalName=${req.body.userName})`
    };

    client.search(adSuffix,searchOptions,(err,res) => {
        if (err) {
			result += "Search failed " + err;
			res.send(result);
			return;
        }
    
        res.on('searchEntry', entry => {
            console.log(entry.object.name);
        });
        res.on('searchReference', referral => {
            console.log('referral: ' + referral.uris.join());
        });
        res.on('error', err => {
            console.error('error: ' + err.message);
        });
        res.on('end', result => {
            console.log(result);
        });
    });
    
    // Wrap up
    client.unbind( err => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true });
    });
});

// this is our get method
// this method fetches all available data in our database
router.get("/getData", (req, res) => {
    getData("data", req, res);
});

router.get("/getProducts", (req, res) => {
    getData("product", req, res);
});

router.get("/getUsers", (req, res) => {
    getData("user", req, res);
});

router.get("/getUserOrders", (req, res) => {
    getData("userOrder", req, res);
});

getData = (which, req, res) => {
    var resultsLambda = (err, data) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data: data });
    };
    switch (which) {
        case "data":
            Data.find(resultsLambda);
            break;
        case "product":
            Product.find(resultsLambda);
            break;
        case "user":
            User.find(resultsLambda);
            break;
        case "userOrder":
            UserOrder.find(resultsLambda);
            break;
    }
};

// this is our update method
// this method overwrites existing data in our database
router.post("/updateData", (req, res) => {
    const { id, update } = req.body;
    Data.findOneAndUpdate(id, update, err => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true });
    });
});

// this is our delete method
// this method removes existing data in our database
router.delete("/deleteData", (req, res) => {
    deleteData("data", req, res);
});

router.delete("/deleteProduct", (req, res) => {
    deleteData("product", req, res);
});

router.delete("/deleteUser", (req, res) => {
    deleteData("user", req, res);
});

router.delete("/deleteUserOrder", (req, res) => {
    deleteData("userOrder", req, res);
});

deleteData = (which, req, res) => {
    const { userId, productId } = req.body;
    switch (which) {
        case "data":
            Data.findOneAndDelete(userId, err => {
                if (err) return res.send(err);
                return res.json({ success: true });
            });
            break;
        case "product":
            Product.findOneAndDelete({productId: productId}, err => {
                if (err) return res.send(err);
                return res.json({ success: true });
            });
            break;
        case "user":
            User.findOneAndDelete({userId: userId}, err => {
                if (err) return res.send(err);
                return res.json({ success: true });
            });
            break;
        case "userOrder":
            UserOrder.findOne({userId: userId}, (err, userOrder) => {
                const index = userOrder.orders.findIndex(order => order.productId == productId);
                if (index >= 0){
                    userOrder.orders.splice(index, 1);
                }
				else {
					UserOrder.deleteOne({userId: userId}, err => {
						
					});
					return;
				}
				userOrder.save(err => {
					if (err) return res.json({ success: false, error: err });
					return res.json({ success: true });
				});
			});
            break;
    }
};

// this is our create methid
// this method adds new data in our database
router.post("/putData", (req, res) => {
    putData("data", req, res);
});

putData = (which, req, res) => {
    var data;
    var userId, productId, fullName, shortName, picture, isAdmin;
    switch(which) {
        case "data":
            data = new Data();
            const { id, message } = req.body;
            if ((!id && id !== 0) || !message) {
                return res.json({
                    success: false,
                    error: "INVALID INPUTS"
                });
            }
            data.message = message;
            data.id = id;
            break;
        case "product":
            data = new Product();
            productId = req.body.productId, name = req.body.name, displayName = req.body.displayName;
            price = req.body.price, picture = req.body.picture;
            if ((!productId && productId !== 0) || !name) {
                return res.json({
                    success: false,
                    error: "INVALID INPUTS"
                });
            }
            data.productId = productId;
            data.name = name;
            data.displayName = displayName;
            data.price = price;
            data.picture = picture;
            break;
        case "user":
            data = new User();
            userId = req.body.userId, fullName = req.body.fullName, shortName = req.body.shortName;
            isAdmin = req.body.isAdmin, photo = req.body.photo;
            if ((!userId && userId !== 0)) {
                return res.json({
                    success: false,
                    error: "INVALID INPUTS"
                });
            }
            data.userId = userId;
            data.fullName = fullName;
            data.shortName = shortName;
            data.isAdmin = isAdmin;
            data.photo = photo;
            break;
        case "userOrder":
            data = new UserOrder();
            userId = req.body.userId;
            productId = req.body.productId;
            if ((!userId && userId !== 0) || (!productId && productId !== 0)) {
                return res.json({
                    success: false,
                    error: "INVALID INPUTS"
                });
            }
            data.userId = userId;
            UserOrder.findOne({userId: userId}, (err, user) => {
                if (user == null){
                    data.orders = [];
                    data.orders.push({productId: productId, count: 1});
                }
                else {
					if (user.orders == null || user.orders.length == 0){
						console.log("user.orders null");
						data.orders = [];
						data.orders.push({productId: productId, count: 1});
					}
					else {
						console.log("user.orders non-null");
						data.orders = user.orders;
					
						const index = user.orders.findIndex(order => order.productId == productId);
						console.log(index);
						if (index < 0){
							data.orders.push({productId: productId, count: 1});
						}
						else {
							data.orders[index].count += 1;
							console.log(data.orders);
						}
					}
                }
            });
    }
    data.save(err => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true });
    });
};
// this is our create methid
// this method adds new product in our database -- admin
router.post("/putProduct", (req, res) => {
    putData("product", req, res);
});

// this method adds new product in our database -- admin
router.post("/putUser", (req, res) => {
    putData("user", req, res);
});

router.post("/putUserOrder", (req, res) => {
    putData("userOrder", req, res);
});

// append /api for our http requests
app.use("/api", router);

// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
