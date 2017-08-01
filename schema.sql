DROP DATABASE IF EXISTS bamazon_db;
CREATE database bamazon_db;

USE bamazon_db;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(45) NOT NULL,
  department_name VARCHAR(45) NOT NULL,
  cust_price DECIMAL(10,2) NULL,
  stock_quantity INT NULL,
  PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, cust_price, stock_quantity)
VALUES ("Football", "Sporting Goods", 21.50, 50), ("Basketball", "Sporting Goods", 17.99, 120), ("Baseball", "Sporting Goods", 11.99, 75), ("Baseball Bat", "Sporting Goods", 71.99, 120), ("Nike Air Force One", "Shoes", 81.99, 12), ("AirMax 95", "Shoes", 121.99, 30), ("Black Polo Shirt", "Men's Clothing", 41.99, 15), ("White Polo Shirt", "Men's Clothing", 41.99, 15), ("No Show Socks", "Men's Clothing", 7.99, 25), ("Jordan Retro 12", "Shoes", 151.99, 35);
