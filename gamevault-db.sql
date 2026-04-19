-- ============================================================
-- GAME RENTAL & PURCHASE SYSTEM — DATABASE SCHEMA (FIXED ORDER)
-- ============================================================

-- 1. No dependencies
CREATE TABLE MembershipTiers (
    TierID          INT PRIMARY KEY,
    TierName        VARCHAR(30) NOT NULL,
    DiscountPercent DECIMAL(5,2) NOT NULL,
    Description     VARCHAR(100)
);

CREATE TABLE Users (
    UserID        INT PRIMARY KEY,
    FullName      VARCHAR(50)  NOT NULL,
    Email         VARCHAR(100) UNIQUE NOT NULL,
    PasswordHash  VARCHAR(255),
    Phone         VARCHAR(20),
    Address       VARCHAR(255),
    AccountStatus VARCHAR(20) DEFAULT 'Active'
);

CREATE TABLE Admins (
    AdminID      INT PRIMARY KEY,
    FullName     VARCHAR(50)  NOT NULL,
    Email        VARCHAR(100) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255),
    AccessLevel  VARCHAR(20)
);

CREATE TABLE Categories (
    CategoryID   INT PRIMARY KEY,
    CategoryName VARCHAR(50) NOT NULL
);

-- 2. Depends on Users + MembershipTiers
CREATE TABLE UserMemberships (
    MembershipID INT PRIMARY KEY,
    UserID       INT NOT NULL,
    TierID       INT NOT NULL,
    StartDate    DATE NOT NULL,
    EndDate      DATE NOT NULL,
    Status       VARCHAR(20) DEFAULT 'Active',
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (TierID) REFERENCES MembershipTiers(TierID)
);

-- 3. Depends on Categories
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

-- 4. Depends on Games
CREATE TABLE UpcomingCatalog (
    UpcomingID      INT PRIMARY KEY,
    GameID          INT NULL,
    GameTitle       VARCHAR(100) NOT NULL,
    ExpectedRelease DATE,
    FOREIGN KEY (GameID) REFERENCES Games(GameID)
);

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

CREATE TABLE PhysicalWaitlist (
    WaitlistID  INT PRIMARY KEY,
    UserID      INT NOT NULL,
    GameID      INT NOT NULL,
    RequestTime DATETIME,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (GameID) REFERENCES Games(GameID)
);

CREATE TABLE DigitalWaitlist (
    WaitlistID  INT PRIMARY KEY,
    UserID      INT NOT NULL,
    GameID      INT NOT NULL,
    RequestTime DATETIME,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (GameID) REFERENCES Games(GameID)
);

-- 5. Depends on Users + DigitalCopies
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

-- 6. Depends on Users + PhysicalCopies + Admins
CREATE TABLE Purchases (
    PurchaseID   INT PRIMARY KEY,
    UserID       INT NOT NULL,
    CopyID       INT NOT NULL,
    AdminID      INT NOT NULL,
    PurchaseDate DATE,
    FOREIGN KEY (UserID)  REFERENCES Users(UserID),
    FOREIGN KEY (CopyID)  REFERENCES PhysicalCopies(CopyID),
    FOREIGN KEY (AdminID) REFERENCES Admins(AdminID)
);

-- 7. Depends on Users + Games + Rentals
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

-- 8. Depends on Users + UpcomingCatalog
CREATE TABLE Wishlist (
    WishlistID  INT PRIMARY KEY,
    UserID      INT NOT NULL,
    UpcomingID  INT NOT NULL,
    RequestTime DATETIME,
    FOREIGN KEY (UserID)     REFERENCES Users(UserID),
    FOREIGN KEY (UpcomingID) REFERENCES UpcomingCatalog(UpcomingID)
);

-- 9. Depends on Users + Rentals + Purchases + Admins
CREATE TABLE Transactions (
    TransactionID   INT PRIMARY KEY,
    UserID          INT NOT NULL,
    RentalID        INT NULL,
    PurchaseID      INT NULL,
    AdminID         INT NOT NULL,
    Amount          DECIMAL(10,2),
    TransactionDate DATE,
    DiscountApplied DECIMAL(5,2) DEFAULT 0.00,
    FOREIGN KEY (UserID)     REFERENCES Users(UserID),
    FOREIGN KEY (RentalID)   REFERENCES Rentals(RentalID),
    FOREIGN KEY (PurchaseID) REFERENCES Purchases(PurchaseID),
    FOREIGN KEY (AdminID)    REFERENCES Admins(AdminID)
);

CREATE TABLE Penalties (
    PenaltyID     INT PRIMARY KEY,
    UserID        INT NOT NULL,
    RentalID      INT NOT NULL,
    PenaltyAmount DECIMAL(10,2),
    PenaltyReason VARCHAR(100),
    PaidStatus    VARCHAR(10) DEFAULT 'Unpaid',
    FOREIGN KEY (UserID)   REFERENCES Users(UserID),
    FOREIGN KEY (RentalID) REFERENCES Rentals(RentalID)
);

CREATE TABLE Notifications (
    NotificationID   INT PRIMARY KEY,
    UserID           INT NOT NULL,
    NotificationType VARCHAR(30) NOT NULL,
    ReferenceID      INT NOT NULL,
    Message          VARCHAR(255),
    Status           VARCHAR(20) DEFAULT 'Pending',
    CreatedAt        DATETIME,
    SentAt           DATETIME NULL,
    ExpiresAt        DATETIME NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE AdminActivityLog (
    LogID       INT PRIMARY KEY,
    AdminID     INT NOT NULL,
    ActionType  VARCHAR(50) NOT NULL,
    TargetTable VARCHAR(50),
    TargetID    INT,
    Notes       VARCHAR(255),
    Channel     VARCHAR(10) NOT NULL,
    ActionTime  DATETIME NOT NULL,
    FOREIGN KEY (AdminID) REFERENCES Admins(AdminID)
);
