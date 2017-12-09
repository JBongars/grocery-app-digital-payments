//Load libraries
const path = require("path");
const q = require("q");
const express = require("express");
const mysql = require("mysql");
var bodyParser = require("body-parser");

//Create an instance of express
const app = express();

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({limit: '50mb'}));

//Configure MySQL
const pool = mysql.createPool({
	host: "localhost", port: 3306,
	user: "superadmin", password: "password",
	database: "assignment2",
	connectionLimit: 4
});

//use q from promise
const mkQQuery = function(sql, connPool) {

	const sqlQuery = function() {
		const defer = q.defer();

		console.log("Using q package");
		//
		//Collect the arguments
		var sqlParams = [];
		for (var i in arguments){
			console.log(i);
			sqlParams.push(arguments[i])
		}
		connPool.getConnection(function(err, conn) {
			if (err) {
				defer.reject(err);
				return;
			}
			conn.query(sql, sqlParams, function(err, result) {
				if (err)
					defer.reject(err);
				else
					defer.resolve(result);
				conn.release();
			})
		});

		return (defer.promise);
	}

	return (sqlQuery);
}

const SEARCH_GROCERIES = "SELECT * FROM grocery_list ";
const GRANDTOTAL_GROCERIES = "SELECT count(*) as sum FROM grocery_list ";
const GROCERY_EXIST_BY_UPC12 = "SELECT count(*) as sum FROM grocery_list where upc12=? ";
const GET_GROCERY = "SELECT id, upc12, brand, name FROM grocery_list WHERE id=?";
const UPDATE_GROCERY = "UPDATE grocery_list SET upc12 = ?, brand = ?, name=? WHERE id=?";
const INSERT_GROCERY = "INSERT INTO grocery_list (upc12, brand, name) VALUES (?, ?, ?)";
const DELETE_GROCERY = "DELETE FROM grocery_list WHERE id=?";

const getGrocery = mkQQuery(GET_GROCERY, pool);
const updateGrocery = mkQQuery(UPDATE_GROCERY, pool);
const insertGrocery = mkQQuery(INSERT_GROCERY, pool);
const deleteGrocery = mkQQuery(DELETE_GROCERY, pool);
const sumOfGrocery = mkQQuery(GRANDTOTAL_GROCERIES, pool);
const isUPC12Exist = mkQQuery(GROCERY_EXIST_BY_UPC12, pool);

const handleError = function(err, resp) {
	resp.status(500);
	resp.type("application/json");
	resp.json(err);
}

app.get("/api/products", function(req, resp) {
	console.log("search Groceries");
	var whereCondition = "";
    var page = parseInt(req.query.page) || 1;
    var items = parseInt(req.query.items) || 10;
    var offset = (page - 1) * items;
    var limit = items;
    var sortBy = req.query.sortBy || 'ASC';
    var brand = '';
    var name = '';
    var order = 'name '+sortBy;

    if((typeof req.query.searchType !== 'undefined')) {
        if(typeof req.query.searchType === 'string'){
            if(req.query.searchType=='Brand') {
                brand = req.query.keyword;
                order = 'brand '+sortBy;
            }
            if(req.query.searchType=='Name') {
                name = req.query.keyword;
            }
        } else {
            brand = req.query.keyword;
            name = req.query.keyword;
        }
    }

	if(brand && name) {
		whereCondition = " WHERE brand like '%" 
						+ brand + "%' OR name like '%" 
						+ name + "%' " + " ORDER BY " + order + " LIMIT " + limit 
						+ ' OFFSET ' + offset;
    } else {
        if(brand) {
			whereCondition = " WHERE brand like '%" 
			+ brand + "%'" + " ORDER BY " + order + " LIMIT " + limit 
			+ ' OFFSET ' + offset;
        }
        else if(name) {
            whereCondition = " WHERE name like '%" 
			+ name + "%'" + " ORDER BY " + order + " LIMIT " + limit 
			+ ' OFFSET ' + offset;
        }
        else {
            whereCondition = " ORDER BY " + order + " LIMIT " + limit 
			+ ' OFFSET ' + offset;
        }
	}
	console.log(SEARCH_GROCERIES + whereCondition);
	const searchGroceries = mkQQuery(SEARCH_GROCERIES + whereCondition, pool);
	searchGroceries().then(function(result){
		resp.json(result);
	}).catch(function(error){
		console.log(error);
	});

	
});

app.get("/api/products/sum", function(req,res){
	console.log("sum of all Groceries");
	sumOfGrocery().then(function(result){
		console.log(result[0]);
		res.json(result[0]);
	}).catch(function(error){
		console.log(error);
	});
});

app.get("/api/products/exist/:upc12", function(req,res){
	console.log(" is exist Grocery");
	isUPC12Exist(parseInt(req.params.upc12)).then(function(result){
		console.log(result[0]);
		res.json(result[0]);
	}).catch(function(error){
		console.log(error);
	});
});

app.get("/api/products/:productId", function(req, resp) {
	console.log(" get Grocery  ");
	getGrocery(parseInt(req.params.productId)).then(function(result){
		console.log(result);
		resp.json(result[0]);
	}).catch(function(error){
		console.log(error);
	});
});

app.put("/api/products/:productId", function(req, resp) {
	console.log(" update Grocery  ");
	updateGrocery(parseInt(req.body.upc12), req.body.brand, req.body.name, 
				parseInt(req.params.productId)).then(function(result){
		console.log(result);
		resp.json(result[0]);
	}).catch(function(error){
		console.log(error);
	});

});

app.post("/api/products/", function(req, resp) {
	console.log(" add Grocery ");
	insertGrocery(parseInt(req.body.upc12), req.body.brand, req.body.name).then(function(result){
		console.log(result);
		resp.json(result[0]);
	}).catch(function(error){
		console.log(error);
	});

});

app.delete("/api/products/:productId", function(req, resp) {
	console.log(" delete Grocery ");
	console.log(req.params.productId);
	deleteGrocery(parseInt(req.params.productId)).then(function(result){
	console.log(result);
	resp.json(result[0]);
	}).catch(function(error){
	console.log(error);
	});

});

//Static routes
app.use(express.static(path.join(__dirname, "../client")));

//Configure the server
const port = process.env.APP_PORT || 3000;
app.listen(port, function() {
	console.info("Application started on port %d", port);
});
