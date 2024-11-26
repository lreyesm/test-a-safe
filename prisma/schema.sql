-- Users Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'User') THEN
        CREATE TABLE "User" (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            "profilePicture" VARCHAR(255)
        );
    END IF;
END $$;

-- Posts Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Post') THEN
        CREATE TABLE "Post" (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            authorId INT NOT NULL,
            CONSTRAINT fk_author FOREIGN KEY (authorId) REFERENCES "User"(id)
        );
    END IF;
END $$;

-- Messages Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Message') THEN
        CREATE TABLE "Message" (
            id SERIAL PRIMARY KEY,
            content TEXT NOT NULL,
            senderId INT NOT NULL,
            receiverId INT NOT NULL,
            createdAt TIMESTAMP DEFAULT NOW(),
            read BOOLEAN DEFAULT FALSE,
            CONSTRAINT fk_sender FOREIGN KEY (senderId) REFERENCES "User"(id),
            CONSTRAINT fk_receiver FOREIGN KEY (receiverId) REFERENCES "User"(id)
        );
    END IF;
END $$;
