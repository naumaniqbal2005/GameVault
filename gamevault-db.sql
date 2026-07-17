
CREATE TABLE Users (
    UserID        VARCHAR(255) PRIMARY KEY,
    FullName      VARCHAR(50)  NOT NULL,
    Email         VARCHAR(100) UNIQUE NOT NULL,
    AccountStatus VARCHAR(20) DEFAULT 'Active',
    isAdmin       BOOLEAN DEFAULT FALSE
);

CREATE TABLE Categories (
    CategoryID   INT PRIMARY KEY,
    CategoryName VARCHAR(50) NOT NULL
);

-- 2. Depends on Categories
CREATE TABLE Games (
    GameID             INT PRIMARY KEY,
    GameTitle          VARCHAR(100) NOT NULL,
    Platform           VARCHAR(50),
    Genre              VARCHAR(50),
    CategoryID         INT,
    PhysicalPrice      DECIMAL(10,2),
    DigitalRentalPrice DECIMAL(10,2),
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);

-- 3. Depends on Games
CREATE TABLE PhysicalCopies (
    CopyID        INT PRIMARY KEY,
    GameID        INT NOT NULL,
    CopyCondition VARCHAR(20),
    Availability  VARCHAR(20),
    FOREIGN KEY (GameID) REFERENCES Games(GameID)
);

CREATE TABLE DigitalCopies (
    CopyID       INT PRIMARY KEY,
    GameID       INT NOT NULL,
    Availability VARCHAR(20),
    FOREIGN KEY (GameID) REFERENCES Games(GameID)
);

-- 4. Depends on Users + DigitalCopies
CREATE TABLE Rentals (
    RentalID     INT PRIMARY KEY,
    UserID       INT NOT NULL,
    CopyID       INT NOT NULL,
    DateIssued   DATE,
    DateDue      DATE,
    DateReturned DATE NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (CopyID) REFERENCES DigitalCopies(CopyID)
);

-- 5. Depends on Users + Games + Rentals
CREATE TABLE Reviews (
    ReviewID   INT PRIMARY KEY,
    UserID     INT NOT NULL,
    GameID     INT NOT NULL,
    RentalID   INT NULL,
    Rating     INT,
    ReviewText TEXT,
    FOREIGN KEY (UserID)   REFERENCES Users(UserID),
    FOREIGN KEY (GameID)   REFERENCES Games(GameID),
    FOREIGN KEY (RentalID) REFERENCES Rentals(RentalID)
);

-- 6. Depends on Users + Rentals + PhysicalCopies
CREATE TABLE Transactions (
    TransactionID   INT PRIMARY KEY,
    UserID          INT NOT NULL,
    RentalID        INT NULL,
    CopyID          INT NULL,
    AdminID         INT NOT NULL,
    Amount          DECIMAL(10,2),
    TransactionDate DATE,
    DiscountApplied DECIMAL(5,2) DEFAULT 0.00,
    FOREIGN KEY (UserID)     REFERENCES Users(UserID),
    FOREIGN KEY (RentalID)   REFERENCES Rentals(RentalID),
    FOREIGN KEY (CopyID)     REFERENCES PhysicalCopies(CopyID)
);
