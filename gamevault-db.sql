
CREATE TABLE public.users (
    UserID        TEXT PRIMARY KEY,
    FullName      TEXT  NOT NULL,
    Email         TEXT UNIQUE NOT NULL,
    AccountStatus TEXT DEFAULT 'Active',
    isAdmin       BOOLEAN DEFAULT FALSE,
    Password      TEXT DEFAULT NULL
);

CREATE TABLE public.categories (
    CategoryID   INT PRIMARY KEY,
    CategoryName TEXT NOT NULL
);

-- 2. Depends on Categories
CREATE TABLE public.games (
    GameID             INT PRIMARY KEY,
    GameTitle          TEXT NOT NULL,
    Platform           TEXT,
    Genre              TEXT,
    CategoryID         INT,
    PhysicalPrice      NUMERIC,
    DigitalRentalPrice NUMERIC,
    Image              TEXT
    FOREIGN KEY (CategoryID) REFERENCES public.categories(CategoryID)
);

-- 3. Depends on Games
CREATE TABLE public.physicalcopies (
    CopyID        INT PRIMARY KEY,
    GameID        INT NOT NULL,
    CopyCondition TEXT,
    Availability  TEXT,
    FOREIGN KEY (GameID) REFERENCES public.games(GameID)
);

CREATE TABLE public.digitalcopies (
    CopyID       INT PRIMARY KEY,
    GameID       INT NOT NULL,
    Availability TEXT,
    FOREIGN KEY (GameID) REFERENCES public.games(GameID)
);

-- 4. Depends on Users + DigitalCopies
CREATE TABLE public.rentals (
    RentalID     INT PRIMARY KEY,
    UserID       TEXT NOT NULL,
    CopyID       INT NOT NULL,
    DateIssued   DATE,
    DateDue      DATE,
    DateReturned DATE NULL,
    FOREIGN KEY (UserID) REFERENCES public.users(UserID),
    FOREIGN KEY (CopyID) REFERENCES public.digitalcopies(CopyID)
);

-- 5. Depends on Users + Games + Rentals
CREATE TABLE public.reviews (
    ReviewID   INT PRIMARY KEY,
    UserID     TEXT NOT NULL,
    GameID     INT NOT NULL,
    RentalID   INT NULL,
    Rating     INT,
    ReviewText TEXT,
    FOREIGN KEY (UserID)   REFERENCES public.users(UserID),
    FOREIGN KEY (GameID)   REFERENCES public.games(GameID),
    FOREIGN KEY (RentalID) REFERENCES public.rentals(RentalID)
);

-- 6. Depends on Users + Rentals + PhysicalCopies
CREATE TABLE public.transactions (
    TransactionID   INT PRIMARY KEY,
    UserID          TEXT NOT NULL,
    RentalID        INT NULL,
    CopyID          INT NULL,
    AdminID         TEXT NOT NULL,
    Amount          NUMERIC,
    TransactionDate DATE,
    DiscountApplied NUMERIC DEFAULT 0.00,
    FOREIGN KEY (UserID)     REFERENCES public.users(UserID),
    FOREIGN KEY (AdminID)    REFERENCES public.users(UserID),
    FOREIGN KEY (RentalID)   REFERENCES public.rentals(RentalID),
    FOREIGN KEY (CopyID)     REFERENCES public.physicalcopies(CopyID)
);
