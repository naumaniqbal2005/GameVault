-- ============================================================
-- GAME RENTAL & PURCHASE SYSTEM — DATABASE SCHEMA
-- ============================================================

-- ============================================================
-- MEMBERSHIP TIERS & USER MEMBERSHIPS
-- ============================================================

-- Stores each available membership plan and the savings rate it grants.
-- DiscountPercent is applied to both physical and digital prices when
-- a transaction is recorded.
CREATE TABLE MembershipTiers (
    TierID          INT PRIMARY KEY,
    TierName        VARCHAR(30) NOT NULL,
    DiscountPercent DECIMAL(5,2) NOT NULL,
    Description     VARCHAR(100)
);

-- Ties a specific user to a membership plan for a defined period.
-- Users with no record in this table receive no discount.
-- Status: 'Active' | 'Expired' | 'Cancelled'
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

-- ============================================================
-- USERS & ADMINS
-- ============================================================

-- Registered customers who can rent or purchase games.
CREATE TABLE Users (
    UserID        INT PRIMARY KEY,
    FullName      VARCHAR(50)  NOT NULL,
    Email         VARCHAR(100) UNIQUE NOT NULL,
    AccountStatus VARCHAR(20)
);

-- Staff accounts with elevated system privileges.
CREATE TABLE Admins (
    AdminID      INT PRIMARY KEY,
    FullName     VARCHAR(50)  NOT NULL,
    Email        VARCHAR(100) UNIQUE NOT NULL,
    AccessLevel  VARCHAR(20)
);

-- ============================================================
-- GAME CATALOG
-- ============================================================

-- Top-level groupings used to organize games.
CREATE TABLE Categories (
    CategoryID   INT PRIMARY KEY,
    CategoryName VARCHAR(50) NOT NULL
);

-- Master catalog of all available titles.
-- PhysicalPrice      = buy-to-own cost (permanent ownership, higher price point)
-- DigitalRentalPrice = per-session fee (time-limited access, lower price point)
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

-- Placeholder entries for titles not yet publicly released.
-- GameID remains NULL until the game goes live and is added to Games.
CREATE TABLE UpcomingCatalog (
    UpcomingID      INT PRIMARY KEY,
    GameID          INT NULL,
    GameTitle       VARCHAR(100) NOT NULL,
    ExpectedRelease DATE,
    FOREIGN KEY (GameID) REFERENCES Games(GameID)
);

-- ============================================================
-- WISHLIST & REVIEWS
-- ============================================================

-- Lets users express interest in unreleased titles from UpcomingCatalog.
CREATE TABLE Wishlist (
    WishlistID  INT PRIMARY KEY,
    UserID      INT NOT NULL,
    UpcomingID  INT NOT NULL,
    RequestTime DATETIME,
    FOREIGN KEY (UserID)     REFERENCES Users(UserID),
    FOREIGN KEY (UpcomingID) REFERENCES UpcomingCatalog(UpcomingID)
);

-- Stores user-submitted ratings and feedback for games they have rented.
-- RentalID acts as proof-of-play; a review cannot exist without a linked rental.
CREATE TABLE Reviews (
    ReviewID    INT PRIMARY KEY,
    UserID      INT NOT NULL,
    GameID      INT NOT NULL,
    RentalID    INT NOT NULL,
    Rating      INT,
    ReviewText  TEXT,
    FOREIGN KEY (UserID)   REFERENCES Users(UserID),
    FOREIGN KEY (GameID)   REFERENCES Games(GameID),
    FOREIGN KEY (RentalID) REFERENCES Rentals(RentalID)
);

-- ============================================================
-- PHYSICAL COPIES  (Buy-to-Own)
-- ============================================================

-- Inventory record for every individual physical disc or cartridge.
-- Availability: 'Available' | 'Sold'
CREATE TABLE PhysicalCopies (
    CopyID        INT PRIMARY KEY,
    GameID        INT NOT NULL,
    CopyCondition VARCHAR(20),
    Availability  VARCHAR(20),
    FOREIGN KEY (GameID) REFERENCES Games(GameID)
);

-- Captures the completed sale of a physical copy, linking buyer, item, and admin.
-- The corresponding payment entry is stored in Transactions via PurchaseID.
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

-- Holds users waiting to purchase a physical title that is currently sold out.
CREATE TABLE PhysicalWaitlist (
    WaitlistID  INT PRIMARY KEY,
    UserID      INT NOT NULL,
    GameID      INT NOT NULL,
    RequestTime DATETIME,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (GameID) REFERENCES Games(GameID)
);

-- ============================================================
-- DIGITAL COPIES  (Rent-to-Play)
-- ============================================================

-- Each row represents one concurrent rental slot for a digital title.
-- The total slot count per game sets the simultaneous-user cap.
-- Availability: 'Available' | 'Rented'
CREATE TABLE DigitalCopies (
    CopyID      INT PRIMARY KEY,
    GameID      INT NOT NULL,
    Availability VARCHAR(20),
    FOREIGN KEY (GameID) REFERENCES Games(GameID)
);

-- Records every digital rental session. DateReturned stays NULL while
-- the game is still checked out.
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

-- Queue for users waiting on a digital title with no free slots.
CREATE TABLE DigitalWaitlist (
    WaitlistID  INT PRIMARY KEY,
    UserID      INT NOT NULL,
    GameID      INT NOT NULL,
    RequestTime DATETIME,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (GameID) REFERENCES Games(GameID)
);

-- ============================================================
-- TRANSACTIONS & PENALTIES
-- ============================================================

-- Single payment ledger covering both rental fees and physical purchases.
-- Exactly one of RentalID or PurchaseID will be populated per row; the other is NULL.
CREATE TABLE Transactions (
    TransactionID   INT PRIMARY KEY,
    UserID          INT NOT NULL,
    RentalID        INT NULL,
    PurchaseID      INT NULL,
    AdminID         INT NOT NULL,
    Amount          DECIMAL(10,2),
    TransactionDate DATE,
    DiscountApplied DECIMAL(5,2) DEFAULT 0.00
    FOREIGN KEY (UserID)     REFERENCES Users(UserID),
    FOREIGN KEY (RentalID)   REFERENCES Rentals(RentalID),
    FOREIGN KEY (PurchaseID) REFERENCES Purchases(PurchaseID),
    FOREIGN KEY (AdminID)    REFERENCES Admins(AdminID)
);

-- Financial penalties issued to users for late returns or damaged items.
-- PaidStatus: 'Unpaid' | 'Paid'
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

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

-- Delivers alerts when a waitlisted slot opens up or a wishlisted game releases.
-- ReferenceID points to the originating row in PhysicalWaitlist, DigitalWaitlist,
-- or Wishlist depending on NotificationType.
-- Status: 'Pending' | 'Sent' | 'Claimed' | 'Expired'
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

-- ============================================================
-- ADMIN ACTIVITY LOG
-- ============================================================

-- Append-only audit trail of every action performed by admin accounts.
-- Channel differentiates between actions taken in-store versus through
-- the online platform.
-- ActionType examples: 'ProcessRental', 'IssuePenalty', 'SuspendUser',
--                      'MarkCopySold', 'UpdateStock', 'SettlePenalty'
-- Channel: 'InStore' | 'Online'
CREATE TABLE AdminActivityLog (
    LogID        INT PRIMARY KEY,
    AdminID      INT NOT NULL,
    ActionType   VARCHAR(50) NOT NULL,
    TargetTable  VARCHAR(50),
    TargetID     INT,
    Notes        VARCHAR(255),
    Channel      VARCHAR(10) NOT NULL,
    ActionTime   DATETIME NOT NULL,
    FOREIGN KEY (AdminID) REFERENCES Admins(AdminID)
);