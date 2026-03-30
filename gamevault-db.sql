-- ============================================================
-- GAME RENTAL & PURCHASE SYSTEM — DATABASE SCHEMA
-- ============================================================

-- ============================================================
-- USERS & ADMINS
-- ============================================================

CREATE TABLE Users (
    UserID        INT PRIMARY KEY,
    FullName      VARCHAR(50)  NOT NULL,
    Email         VARCHAR(100) UNIQUE NOT NULL,
    AccountStatus VARCHAR(20)
);

CREATE TABLE Admins (
    AdminID      INT PRIMARY KEY,
    FullName     VARCHAR(50)  NOT NULL,
    Email        VARCHAR(100) UNIQUE NOT NULL,
    AccessLevel  VARCHAR(20)
);

-- ============================================================
-- GAME CATALOG
-- ============================================================

CREATE TABLE Categories (
    CategoryID   INT PRIMARY KEY,
    CategoryName VARCHAR(50) NOT NULL
);

-- PhysicalPrice    = one-time buy-to-own (higher, permanent ownership)
-- DigitalRentalPrice = per-rental fee (lower, time-limited access)
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

-- Upcoming games not yet in the catalog.
-- GameID links back to Games once the title is officially released.
CREATE TABLE UpcomingCatalog (
    UpcomingID      INT PRIMARY KEY,
    GameID          INT NULL,               -- Populated on release day
    GameTitle       VARCHAR(100) NOT NULL,
    ExpectedRelease DATE,
    FOREIGN KEY (GameID) REFERENCES Games(GameID)
);

-- ============================================================
-- PHYSICAL COPIES  (Buy-to-Own)
-- ============================================================

-- Each row = one physical disc/cartridge in inventory.
-- Availability: 'Available' | 'Sold'
CREATE TABLE PhysicalCopies (
    CopyID        INT PRIMARY KEY,
    GameID        INT NOT NULL,
    CopyCondition VARCHAR(20),
    Availability  VARCHAR(20),
    FOREIGN KEY (GameID) REFERENCES Games(GameID)
);

-- Records the sale of a physical copy to a user, processed by an admin.
-- Payment details live in Transactions (PurchaseID FK).
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

-- Users queued to buy a physical copy that is currently out of stock.
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

-- Each row = one concurrent digital account slot.
-- Slot count per game implicitly defines how many users can rent simultaneously.
-- Availability: 'Available' | 'Rented'
CREATE TABLE DigitalCopies (
    CopyID      INT PRIMARY KEY,
    GameID      INT NOT NULL,
    Availability VARCHAR(20),
    FOREIGN KEY (GameID) REFERENCES Games(GameID)
);

-- Records a digital rental. DateReturned is NULL until the user returns the game.
CREATE TABLE Rentals (
    RentalID     INT PRIMARY KEY,
    UserID       INT NOT NULL,
    CopyID       INT NOT NULL,             -- References a DigitalCopies slot
    DateIssued   DATE,
    DateDue      DATE,
    DateReturned DATE NULL,                -- NULL = still rented
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (CopyID) REFERENCES DigitalCopies(CopyID)
);

-- Users queued to rent a game that has no available digital slots.
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

-- Unified payment record for both rentals and physical purchases.
-- RentalID is NULL for purchases; PurchaseID is NULL for rentals.
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

-- Fines charged to users (e.g. late returns, damaged copies).
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
-- WISHLIST & REVIEWS
-- ============================================================

-- Users express interest in upcoming (unreleased) games.
CREATE TABLE Wishlist (
    WishlistID  INT PRIMARY KEY,
    UserID      INT NOT NULL,
    UpcomingID  INT NOT NULL,
    RequestTime DATETIME,
    FOREIGN KEY (UserID)     REFERENCES Users(UserID),
    FOREIGN KEY (UpcomingID) REFERENCES UpcomingCatalog(UpcomingID)
);

-- Users may only review games they have an associated rental for,
-- preventing reviews from users who never played the game.
CREATE TABLE Reviews (
    ReviewID    INT PRIMARY KEY,
    UserID      INT NOT NULL,
    GameID      INT NOT NULL,
    RentalID    INT NOT NULL,              -- Enforces: must have rented to review
    Rating      INT,
    ReviewText  TEXT,
    FOREIGN KEY (UserID)   REFERENCES Users(UserID),
    FOREIGN KEY (GameID)   REFERENCES Games(GameID),
    FOREIGN KEY (RentalID) REFERENCES Rentals(RentalID)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

-- Tracks alerts sent to users when a waitlisted game becomes
-- available or a wishlisted upcoming game officially releases.
-- Status: 'Pending' | 'Sent' | 'Claimed' | 'Expired'
CREATE TABLE Notifications (
    NotificationID   INT PRIMARY KEY,
    UserID           INT NOT NULL,
    NotificationType VARCHAR(30) NOT NULL,  -- e.g. 'WaitlistReady', 'GameReleased'
    ReferenceID      INT NOT NULL,          -- ID of the Waitlist or Wishlist row that triggered this
    Message          VARCHAR(255),
    Status           VARCHAR(20) DEFAULT 'Pending',
    CreatedAt        DATETIME,
    SentAt           DATETIME NULL,         -- NULL until actually dispatched
    ExpiresAt        DATETIME NULL,         -- NULL if no claim deadline applies
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- ============================================================
-- ADMIN ACTIVITY LOG
-- ============================================================

-- Immutable audit trail of every admin action.
-- Since the system is both in-store and online, Channel distinguishes
-- where the action was performed.
-- ActionType examples: 'ProcessRental', 'IssuePenalty', 'SuspendUser',
--                      'MarkCopySold', 'UpdateStock', 'SettlePenalty'
-- Channel: 'InStore' | 'Online'
CREATE TABLE AdminActivityLog (
    LogID        INT PRIMARY KEY,
    AdminID      INT NOT NULL,
    ActionType   VARCHAR(50) NOT NULL,
    TargetTable  VARCHAR(50),               -- e.g. 'Users', 'Penalties', 'PhysicalCopies'
    TargetID     INT,                       -- The PK of the affected row
    Notes        VARCHAR(255),
    Channel      VARCHAR(10) NOT NULL,      -- 'InStore' | 'Online'
    ActionTime   DATETIME NOT NULL,
    FOREIGN KEY (AdminID) REFERENCES Admins(AdminID)
);

-- ============================================================
-- MEMBERSHIP TIERS & USER MEMBERSHIPS
-- ============================================================

-- Defines each membership level and the discount it provides.
-- DiscountPercent applies to both PhysicalPrice and DigitalRentalPrice
-- at transaction time.
CREATE TABLE MembershipTiers (
    TierID          INT PRIMARY KEY,
    TierName        VARCHAR(30) NOT NULL,   -- e.g. 'Basic', 'Silver', 'Gold'
    DiscountPercent DECIMAL(5,2) NOT NULL,  -- e.g. 10.00 = 10% off
    Description     VARCHAR(100)
);

-- Links a user to their current membership tier with validity dates.
-- A user with no row here is treated as non-member (no discount).
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