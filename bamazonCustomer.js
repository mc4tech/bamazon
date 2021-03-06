var inquirer = require('inquirer');
var mysql = require('mysql');
var Table = require('cli-table');
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "letmein",
	database: "bamazon_db"
});

connection.connect(function(err) {
  if (err) throw err;
  displayProducts();
});

function displayProducts() {
	connection.query("SELECT * FROM products", function(err, res) {
		if (err) throw err;
		// console.log(res);

		// instantiate 
		var table = new Table({
			head: ['Item Id', 'Product', 'Price']
			, colWidths: [20, 20, 10]
		});

		//loops through the response and pushes product info to the table 
		for (var i = 0; i < res.length; i++) {
			// table is an Array, so you can `push`, `unshift`, `splice` and friends 
			table.push(
			    [res[i].item_id, res[i].product_name, "$" + res[i].cust_price]
			);
		}
		console.log("\n" + table.toString() + "\n");
		console.log("-----------------------------------");
		buyItem(res);
	});

}

function buyItem(res) {
	
	//prompt user for which product and how many
	inquirer.prompt([
		{
			name: "ItemId",
			type: "input",
			message: "Please enter the product id you would like to purchase.",
			validate: function(value) {
	            if (isNaN(value) === false && parseInt(value) <= res.length && parseInt(value) > 0) {
	                // prodId = parseInt(value);
					// console.log("\nvalue " + prodId);
	                return true;
	            } else {
	                console.log("\nplease enter a valid ID Item")
	                return false;

	            }
	        }
	    }, {
	    	name: "ItemQty",
	    	type: "input",
	    	message: "How many would you like?",
	    	validate: function(value) {
	            if (isNaN(value) === false) {
	                return true;
	            } else {
	                console.log("\nplease enter a valid QTY Item")
	                return false;
	            }
	        }

    	}
    ])
    .then(function(answer) {
    	var choice;
    	var prodId;
    	var prodQty;
    	var price;
    	var total;
    	var orderQty = parseInt(answer.ItemQty);
    	//loops through the res.item_id to match with the users choice
    	for (var i = 0; i < res.length; i++) {
          if (res[i].item_id === parseInt(answer.ItemId)) {
            choice = res[i];
            prodId = res[i].item_id;
            price = choice.cust_price;
            prodQty = choice.stock_quantity - parseInt(answer.ItemQty)
            // console.log(prodQty);
             // console.log(prodId.product_name);
          }
        }

        if(orderQty < choice.stock_quantity) {
        	total = price * orderQty;
        	updateProduct(prodId, prodQty);
        	console.log("Your order has processed.\nYour total is : $" + total.toFixed(2));
        	promptUser();
        }else {
        	console.log("Insufficient quantity. The max quantity available is currently " + choice.stock_quantity);
        }
    });

}

function updateProduct(prodId, prodQty) {
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
			// console.log(res.affectedRows + " products updated!\n");
		}
	);
	 // logs the actual query being run
  	// console.log(query.sql);
}

function promptUser() {
	//asks if user has another order
	inquirer.prompt([
		{
			name: "contShopping",
			type: "list",
			message: "Would you like to continue shopping?",
			choices: ["yes", "no"],
	    }
    ])
    .then(function(answer) {
    	if(answer.contShopping === "yes") {
    		displayProducts();
    	} else {
    		console.log("Thank You for shopping with us!\nHave a great day!")
    		connection.end();
    	}
    })
}