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
  promptUser();
});

function promptUser() {
	//asks if user has another order
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
			// movie();
			break;

			case "Add New Product":
			// doThis();
			break;

			default:
			console.log("Have a nice day.");
		}

    })
}

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
				if(res[i].stock_quantity < 20) {
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
	});
}

