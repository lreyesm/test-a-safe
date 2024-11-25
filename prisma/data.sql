-- Insert users only if the "User" table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "User") THEN
        -- Insert users into the "User" table
        INSERT INTO "User" (email, name, password, role, "profilePicture")
        VALUES
        -- Admin user with an encrypted password and a profile picture
        ('admin@example.com', 'Admin User', '$2a$10$1K5esEJx1/Ey3Q9SkZawnOKQapnQ75DbnEr7gVze0l/nXahDBqizm', 'admin', NULL),
        -- Regular user John Doe with an encrypted password and no profile picture
        ('john.doe@example.com', 'John Doe', '$2a$10$1K5esEJx1/Ey3Q9SkZawnOKQapnQ75DbnEr7gVze0l/nXahDBqizm', 'user', NULL),
        -- Regular user Jane Smith with an encrypted password and a profile picture
        ('jane.smith@example.com', 'Jane Smith', '$2a$10$1K5esEJx1/Ey3Q9SkZawnOKQapnQ75DbnEr7gVze0l/nXahDBqizm', 'user', NULL);
    END IF;
END $$;


-- Insert posts only if the "Post" table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Post") THEN
        -- Insert posts into the "Post" table using emails to fetch the author ID
        INSERT INTO "Post" (title, content, "authorId")
        VALUES
        -- First Post: Created by admin@example.com
        ('First Post', 'This is the content of the first post.',
            (SELECT id FROM "User" WHERE email = 'admin@example.com')),

        -- Second Post: Another post created by admin@example.com
        ('Second Post', 'This is another post created by admin.',
            (SELECT id FROM "User" WHERE email = 'admin@example.com')),

        -- User's First Post: Created by john.doe@example.com
        ('User’s First Post', 'Content created by John Doe.',
            (SELECT id FROM "User" WHERE email = 'john.doe@example.com'));
    END IF;
END $$;


-- Insert messages only if the "Message" table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Message") THEN
        -- Insert messages into the "Message" table using emails to fetch sender and receiver IDs
        INSERT INTO "Message" (content, "senderId", "receiverId", "createdAt", read)
        VALUES
        -- Message from John Doe to Jane Smith
        ('Hello, Jane!',
            (SELECT id FROM "User" WHERE email = 'john.doe@example.com'),
            (SELECT id FROM "User" WHERE email = 'jane.smith@example.com'),
            '2024-11-01 10:30:00', TRUE),

        -- Message from Jane Smith to John Doe
        ('Hey John, how are you?',
            (SELECT id FROM "User" WHERE email = 'jane.smith@example.com'),
            (SELECT id FROM "User" WHERE email = 'john.doe@example.com'),
            '2024-11-01 11:00:00', FALSE),

        -- Message from Admin to John Doe
        ('Welcome to the platform!',
            (SELECT id FROM "User" WHERE email = 'admin@example.com'),
            (SELECT id FROM "User" WHERE email = 'john.doe@example.com'),
            '2024-11-01 09:00:00', TRUE),

        -- Message from John Doe to Admin
        ('Thanks for the message!',
            (SELECT id FROM "User" WHERE email = 'john.doe@example.com'),
            (SELECT id FROM "User" WHERE email = 'admin@example.com'),
            '2024-11-01 12:00:00', FALSE);
    END IF;
END $$;