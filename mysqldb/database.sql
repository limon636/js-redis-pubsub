DROP DATABASE IF EXISTS poridhi_exam;

CREATE DATABASE poridhi_exam;

USE poridhi_exam;

DROP TABLE IF EXISTS example;

CREATE TABLE example ( 
  id INT NOT NULL AUTO_INCREMENT, 
  data LONGTEXT NOT NULL, 
  PRIMARY KEY (id) 
);


INSERT INTO example (data) VALUES('first value');