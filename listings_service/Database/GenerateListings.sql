DROP TABLE listings;

CREATE TABLE listings (
    id          		SERIAL PRIMARY KEY,
    availability		BOOLEAN NOT NULL,
    isInterior         	BOOLEAN NOT NULL,
    city				VARCHAR(255) NOT NULL
);

INSERT INTO listings (select generate_series(1,10), random() > 0.5, random() > 0.5, 'New York');

COPY listings (availability, isinterior, city) FROM '/Users/christinayu/Desktop/hrsf83-thesis/listings.csv' WITH (FORMAT csv, HEADER true);