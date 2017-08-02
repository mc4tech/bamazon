//require inquirer, mysql and cli-table
var inquirer = require('inquirer');
var mysql = require('mysql');
var Table = require('cli-table');
//for validation
var Joi = require('joi');

//establish connection to mysql
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "letmein",
	database: "bamazon_db"
});

connection.connect(function(err) {
  if (err) throw err;
  promptUser();
});

//prompts the manager for which option they'd like to execute
function promptUser() {

	inquirer.prompt([
		{
			name: "menu",
			type: "list",
			message: "What would you like to do?",
			choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
	    }
    ])
    .then(function(answer) {
    	switch (answer.menu) {
			case "View Products for Sale":
			displayProducts(answer.menu);
			break;

			case "View Low Inventory":
			displayProducts(answer.menu);
			break;

			case "Add to Inventory":
			addInventory();
			break;

			case "Add New Product":
			addNewProd()
			break;

			default:
			console.log("Have a nice day.");
		}

    })
}


//displays table of products
function displayProducts(choice) {
	connection.query("SELECT * FROM products", function(err, res) {
		if (err) throw err;
		// console.log(res);

		// instantiate 
		var table = new Table({
			head: ['Item Id', 'Product', 'Department', 'Customer Price', 'Stock Qty']
			, colWidths: [20, 20, 20, 10, 10]
		});

		if(choice === "View Low Inventory") {
			//low qty
			for(var i = 0; i < res.length; i++) {
				if(res[i].stock_quantity < 5) {
					table.push(
				    [res[i].item_id, res[i].product_name, res[i].department_name, "$" + res[i].cust_price, res[i].stock_quantity]
				);
				}
			}
		}else {
			//loops through the response and pushes product info to the table 
			for (var i = 0; i < res.length; i++) {
				// table is an Array, so you can `push`, `unshift`, `splice` and friends 
				table.push(
				    [res[i].item_id, res[i].product_name, res[i].department_name, "$" + res[i].cust_price, res[i].stock_quantity]
				);
			}
		}
		console.log("\n" + table.toString() + "\n");
		console.log("-----------------------------------");
		anyMore();
	});
}

function addNewProd() {
	//asks if user has another order
	inquirer.prompt([
		{
			name: "addname",
			type: "input",
			message: "Please enter the product name.",
			validate: validateName 
	    },
	    {
			name: "adddept",
			type: "input",
			message: "Please enter the department name.",
			validate: validateName
	    },
	    {
			name: "addprice",
			type: "input",
			message: "Please enter the customer price.",
			validate: validateNum
	    },
	    {
			name: "addqty",
			type: "input",
			message: "Please enter the quantity.",
			validate: validateNum
	    },
    ])
    .then(function(answer) {
    	// console.log(answer);
    	var price = parseFloat(answer.addprice);
    	var qty = parseInt(answer.addqty);
    	updateNewProd(answer.addname, answer.adddept, price, qty);

    })
}

function addInventory() {
	//asks if user has another order
	inquirer.prompt([
		{
			name: "item",
			type: "input",
			message: "Please enter the product id.",
			validate: validateNum 
	    },
	    {
			name: "addqty",
			type: "input",
			message: "Please enter the quantity.",
			validate: validateNum
	    },
    ])
    .then(function(answer) {
    	connection.query("SELECT * FROM products", function(err, res) {
			if (err) throw err;
			var prod; 
			var qty = parseInt(answer.addqty);
			// console.log("qty : " + typeof(qty));
			// console.log(typeof(answer.item));
			// console.log(typeof(res[1].item_id));

			for(var i = 0; i < res.length; i ++) {
				if(parseInt(answer.item) === res[i].item_id) {
					prod = res[i].item_id;
					qty += res[i].stock_quantity;
					updateQty(prod, qty);
				};
			}
		})
    })
}

function updateQty(prodId, prodQty) {
	console.log("Updating all prod quantities...\n");
	var query = connection.query(
		"UPDATE products SET ? WHERE ?",
		[
			{
				stock_quantity: prodQty
			},
			{
				item_id: prodId
			}
		],
		function(err, res) {
			if (err) throw err;
			anyMore();
		}
	);
	 // logs the actual query being run
  	// console.log(query.sql);
}

function updateNewProd(name, dept, price, qty) {
	var query = connection.query(
		"INSERT INTO products SET ?",
		{
			product_name: name,
			department_name: dept,
			cust_price: price,
			stock_quantity: qty
		},
		function (err, res) {
			if(err) throw err;
			anyMore();
		}
	)
}

function anyMore() {
	//asks if user has another order
	inquirer.prompt([
		{
			name: "finished",
			type: "list",
			message: "Are you finished?",
			choices: ["yes", "no"],
	    }
    ])
    .then(function(answer) {
    	if(answer.finished === "no") {
    		promptUser();
    	} else {
    		console.log("Tasks complete!\nHave a great day!")
    		connection.end();
    	}
    })
}

//function is used to throw an err if data is !valid
function onValidation(err,val){
    if(err){
        console.log(err.message);
        return err.message;         
    }
    else{
        return true;            
    }
}

//this function validates the name
function validateName(name) {
       var schema = Joi.string().required();
       return Joi.validate(name, schema, onValidation);
}

//this function validates the num
function validateNum(num) {
       var schema = Joi.number().required().min(1).max(100);
       return Joi.validate(num, schema , onValidation);
}