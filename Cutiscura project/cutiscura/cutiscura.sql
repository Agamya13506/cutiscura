CREATE DATABASE IF NOT EXISTS cutiscura;
USE cutiscura;

CREATE TABLE skin_type (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE skin_concern (
    concern_id INT AUTO_INCREMENT PRIMARY KEY,
    concern_name VARCHAR(100) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE p_category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
);

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    age INT,
    gender ENUM('Male','Female','Other'),
    type_id INT,
    FOREIGN KEY (type_id) REFERENCES skin_type(type_id)
);

CREATE TABLE dermat (
    derm_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(150),
    contact_info VARCHAR(255)
);

CREATE TABLE product (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    brand VARCHAR(100),
    price DECIMAL(8,2) NOT NULL,
    category_id INT,
    type_id INT,
    concern_id INT,
    FOREIGN KEY (category_id) REFERENCES p_category(category_id),
    FOREIGN KEY (type_id) REFERENCES skin_type(type_id),
    FOREIGN KEY (concern_id) REFERENCES skin_concern(concern_id)
);

CREATE TABLE routines (
    routine_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    routine_name VARCHAR(150) NOT NULL,
    time_of_day ENUM('Morning','Night','Any') DEFAULT 'Any',
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE routine_product (
    routine_id INT NOT NULL,
    product_id INT NOT NULL,
    step_order INT NOT NULL,
    PRIMARY KEY (routine_id, product_id),
    FOREIGN KEY (routine_id) REFERENCES routines(routine_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id)
);

CREATE TABLE user_concern (
    user_id INT NOT NULL,
    concern_id INT NOT NULL,
    PRIMARY KEY (user_id, concern_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (concern_id) REFERENCES skin_concern(concern_id)
);

CREATE TABLE appointment (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    derm_id INT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    notes VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (derm_id) REFERENCES dermat(derm_id)
);

CREATE TABLE quiz_question (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    question_text VARCHAR(255) NOT NULL,
    question_type ENUM('multiple_choice','scale','text') DEFAULT 'multiple_choice'
);

CREATE TABLE quiz_option (
    option_id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    option_text VARCHAR(200) NOT NULL,
    score_value INT,
    FOREIGN KEY (question_id) REFERENCES quiz_question(question_id)
);

CREATE TABLE quiz_response (
    response_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    question VARCHAR(255) NOT NULL,
    answer VARCHAR(255),
    option_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (option_id) REFERENCES quiz_option(option_id)
);

CREATE TABLE wishlist (
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id)
);

CREATE TABLE quiz_recommendation (
    recommendation_id INT AUTO_INCREMENT PRIMARY KEY,
    concern_id INT,
    type_id INT,
    min_score INT,
    max_score INT,
    product_id INT NOT NULL,
    FOREIGN KEY (concern_id) REFERENCES skin_concern(concern_id),
    FOREIGN KEY (type_id) REFERENCES skin_type(type_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id)
);

INSERT INTO skin_type (type_name, description) VALUES
('Oily','Shiny skin and enlarged pores'),
('Dry','Flaky and tight skin'),
('Combination','Oily T-zone and dry cheeks'),
('Sensitive','Reactive or redness-prone skin');

INSERT INTO skin_concern (concern_name, description) VALUES
('Acne','Breakouts and clogged pores'),
('Hyperpigmentation','Dark spots and uneven tone'),
('Ageing','Wrinkles and fine lines'),
('Dehydration','Lack of moisture'),
('Sun Damage','UV-related darkening');

INSERT INTO p_category (category_name) VALUES
('Cleanser'),
('Toner'),
('Serum'),
('Moisturiser'),
('Sunscreen');

INSERT INTO users (name, email, password, age, gender, type_id) VALUES
('Aisha Mehta','aisha@example.com','password1',23,'Female',4),
('Rahul Singh','rahul@example.com','password2',27,'Male',1),
('Neha Sharma','neha@example.com','password3',31,'Female',3),
('Karan Patel','karan@example.com','password4',19,'Male',2);

INSERT INTO dermat (name, specialization, contact_info) VALUES
('Dr. Ananya Kapoor','Acne Specialist','ananya@clinic.com'),
('Dr. Rohan Deshpande','Pigmentation Expert','rohan@clinic.com'),
('Dr. Meera Iyer','Anti-ageing Specialist','meera@clinic.com');

INSERT INTO product (name, brand, price, category_id, type_id, concern_id) VALUES
('Gentle Foam Cleanser','Cutiscura',399,1,1,1),
('Hydra Calm Cleanser','Cutiscura',449,1,4,4),
('Balancing Toner','Cutiscura',350,2,1,1),
('Brightening Vitamin C Serum','Cutiscura',799,3,3,2),
('Anti-Acne Niacinamide Serum','Cutiscura',699,3,1,1),
('Hydra Lock Gel Moisturiser','Cutiscura',549,4,1,4),
('Ceramide Barrier Cream','Cutiscura',599,4,4,4),
('Ultra Shield SPF 50','Cutiscura',649,5,3,5),
('Salicylic Acid Cleanser','Cutiscura',499,1,1,1),
('AHA BHA Exfoliating Toner','Cutiscura',799,2,1,1),
('Hyaluronic Acid Serum','Cutiscura',899,3,2,4),
('Retinol 1% Anti-Age Serum','Cutiscura',999,3,3,3),
('Aloe Gel Moisturiser','Cutiscura',599,4,4,4),
('Mineral Zinc Sunscreen SPF 50','Cutiscura',749,5,4,5),
('Peptide Night Cream','Cutiscura',899,4,3,3),
('Azelaic Acid 10% Serum','Cutiscura',950,3,3,2);

INSERT INTO user_concern (user_id, concern_id) VALUES
(1,4),
(1,5),
(2,1),
(3,2),
(4,1),
(4,4);

INSERT INTO routines (user_id, routine_name, time_of_day) VALUES
(1,'Aisha Morning Routine','Morning'),
(1,'Aisha Night Routine','Night'),
(2,'Rahul Acne Control','Morning'),
(3,'Neha Brightening Routine','Night');

INSERT INTO routine_product (routine_id, product_id, step_order) VALUES
(1,2,1),(1,3,2),(1,4,3),(1,8,4),
(2,2,1),(2,5,2),(2,7,3),
(3,1,1),(3,5,2),(3,6,3),(3,8,4),
(4,1,1),(4,3,2),(4,4,3),(4,7,4);

INSERT INTO appointment (user_id, derm_id, date, time, notes) VALUES
(2,1,'2025-11-20','11:00:00','Acne consultation'),
(1,2,'2025-11-22','17:30:00','Pigmentation check'),
(3,3,'2025-11-25','15:00:00','Anti-ageing review');

INSERT INTO quiz_question (question_text, question_type) VALUES
('How does your skin feel after washing?','multiple_choice'),
('How often do you get breakouts?','multiple_choice'),
('Does your skin feel dehydrated?','multiple_choice'),
('How oily is your T-zone?','multiple_choice'),
('Do you experience pigmentation?','multiple_choice');

INSERT INTO quiz_option (question_id, option_text, score_value) VALUES
(1,'Tight and dry',2),(1,'Normal',0),(1,'Slightly oily',1),(1,'Very oily',3),
(2,'Never',0),(2,'Sometimes',1),(2,'Weekly',2),(2,'Daily',3),
(3,'Severe',3),(3,'Occasional',2),(3,'Rare',1),(3,'Never',0),
(4,'Dry',0),(4,'Normal',1),(4,'Oily later',2),(4,'Oily afternoon',3),
(5,'None',0),(5,'Mild',1),(5,'Moderate',2),(5,'Severe',3);

INSERT INTO wishlist (user_id, product_id) VALUES
(1,8),(2,4),(3,6),(4,2);

INSERT INTO quiz_recommendation (concern_id, type_id, min_score, max_score, product_id) VALUES
(1,1,6,15,(SELECT product_id FROM product WHERE name='Salicylic Acid Cleanser')),
(1,1,6,15,(SELECT product_id FROM product WHERE name='Anti-Acne Niacinamide Serum')),
(2,NULL,4,15,(SELECT product_id FROM product WHERE name='Brightening Vitamin C Serum')),
(2,NULL,4,15,(SELECT product_id FROM product WHERE name='Azelaic Acid 10% Serum')),
(4,2,4,15,(SELECT product_id FROM product WHERE name='Hyaluronic Acid Serum')),
(4,4,4,15,(SELECT product_id FROM product WHERE name='Ceramide Barrier Cream')),
(3,NULL,5,15,(SELECT product_id FROM product WHERE name='Retinol 1% Anti-Age Serum')),
(3,3,5,15,(SELECT product_id FROM product WHERE name='Peptide Night Cream'));

show databases;
use cutiscura;
show tables;
alter user 'root'@'localhost' IDENTIFIED with mysql_native_password by '123456789';
flush privileges;