#DROP DATABASE IF EXISTS test;
CREATE DATABASE IF NOT EXISTS test CHARACTER SET utf8 COLLATE utf8_general_ci;

USE test;

#DROP TABLE IF EXISTS part;
CREATE TABLE part
(
  id INT AUTO_INCREMENT
    PRIMARY KEY ,
  component VARCHAR(100) NULL,
  quantity INT NULL,
  is_necessary TINYINT NULL,
  CONSTRAINT id_UNIQUE
  UNIQUE (id)
)
  ENGINE = innoDB
  DEFAULT CHARACTER SET = utf8
;

INSERT INTO part (component, quantity, is_necessary) VALUES
  ('Материнская плата', 20, TRUE );

INSERT INTO part (component, quantity, is_necessary) VALUES
  ('Звуковая карта', 2, FALSE );

INSERT INTO part (component, quantity, is_necessary) VALUES
  ('Процессор', 10, TRUE );

INSERT INTO part (component, quantity, is_necessary) VALUES
  ('USB разветвитель', 12, FALSE );

INSERT INTO part (component, quantity, is_necessary) VALUES
  ('Подсветка корпуса', 2, FALSE );

INSERT INTO part (component, quantity, is_necessary) VALUES
  ('Корпус', 12, TRUE );

INSERT INTO part (component, quantity, is_necessary) VALUES
  ('Память', 200, TRUE );

INSERT INTO part (component, quantity, is_necessary) VALUES
  ('SSD диск', 27, TRUE );

INSERT INTO part (component, quantity, is_necessary) VALUES
  ('Видеокарта', 8, TRUE );

INSERT INTO part (component, quantity, is_necessary) VALUES
  ('HHD диск', 18, TRUE );

INSERT INTO part (component, quantity, is_necessary) VALUES
  ('Клавиатуа', 40, TRUE );

INSERT INTO part (component, quantity, is_necessary) VALUES
  ('Мышь', 140, TRUE );

INSERT INTO part (component, quantity, is_necessary) VALUES
  ('Кулер для процессора', 77, TRUE );

INSERT INTO part (component, quantity, is_necessary) VALUES
  ('Блок питания', 19, TRUE );

INSERT INTO part (component, quantity, is_necessary) VALUES
  ('Вентилятор для корпуса', 41, FALSE );

INSERT INTO part (component, quantity, is_necessary) VALUES
  ('Оптический привод', 11, FALSE );

INSERT INTO part (component, quantity, is_necessary) VALUES
  ('Внешний жесткий диск', 27, FALSE );

INSERT INTO part (component, quantity, is_necessary) VALUES
  ('Салазки для накопителей', 4, FALSE );

INSERT INTO part (component, quantity, is_necessary) VALUES
  ('Термоклей', 18, FALSE );

INSERT INTO part (component, quantity, is_necessary) VALUES
  ('Веб-камера', 28, FALSE );

INSERT INTO part (component, quantity, is_necessary) VALUES
  ('Шлейф SATA', 31, FALSE );
