CREATE TABLE IF NOT EXISTS Person (
    id         INTEGER  PRIMARY KEY AUTO_INCREMENT,
    version    INTEGER NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    age        INTEGER  NOT NULL
);

CREATE TABLE IF NOT EXISTS House (
    id         INTEGER  PRIMARY KEY AUTO_INCREMENT,
    version    INTEGER NOT NULL,
    address    VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS Person_House (
    person_id   INTEGER  NOT NULL,
    house_id    INTEGER  NOT NULL
);

CREATE INDEX IX_Person_House_Id ON Person_House (house_id);
ALTER TABLE Person_House ADD FOREIGN KEY (house_id) REFERENCES House(id);

CREATE INDEX IX_House_Person_Id ON Person_House (person_id);
ALTER TABLE Person_House ADD FOREIGN KEY (person_id) REFERENCES Person(id);