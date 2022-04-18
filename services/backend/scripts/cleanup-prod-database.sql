-- The following cleanup script is only relevant for the database snapshot taken on December 22, 2020.

-- -- Select all user IDs
-- SELECT id FROM users WHERE email NOT IN ('devin@devinsit.com', 'test@test.com');

-- -- Select all account IDs
-- SELECT id FROM accounts WHERE "userId" in (SELECT id FROM users WHERE email NOT IN ('devin@devinsit.com', 'test@test.com'));

-- -- Select all transaction IDs
-- SELECT id FROM transactions WHERE "creditAccountId" IN (
--     SELECT id FROM accounts WHERE "userId" in (SELECT id FROM users WHERE email NOT IN ('devin@devinsit.com', 'test@test.com'))
-- ) OR "debitAccountId" IN (
--     SELECT id FROM accounts WHERE "userId" in (SELECT id FROM users WHERE email NOT IN ('devin@devinsit.com', 'test@test.com'))
-- );

-- -- Select all import profile IDs
-- SELECT id FROM "importProfiles" WHERE "userId" in (SELECT id FROM users WHERE email NOT IN ('devin@devinsit.com', 'test@test.com'));

-- -- Select all import profile mapping IDs
-- SELECT id FROM "importProfileMappings" WHERE "importProfileId" IN (
--     SELECT id FROM "importProfiles" WHERE "userId" in (SELECT id FROM users WHERE email NOT IN ('devin@devinsit.com', 'test@test.com'))
-- );

-- Delete all import profile mappings
DELETE FROM "importProfileMappings" WHERE id IN (
    SELECT id FROM "importProfileMappings" WHERE "importProfileId" IN (
        SELECT id FROM "importProfiles" WHERE "userId" in (SELECT id FROM users WHERE email NOT IN ('devin@devinsit.com', 'test@test.com'))
    )
);

-- Delete all import profiles
DELETE FROM "importProfiles" WHERE id IN (
    SELECT id FROM "importProfiles" WHERE "userId" in (SELECT id FROM users WHERE email NOT IN ('devin@devinsit.com', 'test@test.com'))
);

-- Delete all transactions
DELETE FROM transactions WHERE id in (
    SELECT id FROM transactions WHERE "creditAccountId" IN (
        SELECT id FROM accounts WHERE "userId" in (SELECT id FROM users WHERE email NOT IN ('devin@devinsit.com', 'test@test.com'))
    ) OR "debitAccountId" IN (
        SELECT id FROM accounts WHERE "userId" in (SELECT id FROM users WHERE email NOT IN ('devin@devinsit.com', 'test@test.com'))
    )
);

-- Delete all accounts
DELETE FROM accounts WHERE id IN (
    SELECT id FROM accounts WHERE "userId" in (
        SELECT id FROM users WHERE email NOT IN ('devin@devinsit.com', 'test@test.com')
    )
);

-- Delete all users
DELETE FROM users WHERE id IN (
    SELECT id FROM users WHERE email NOT IN ('devin@devinsit.com', 'test@test.com')
);

-- Create subscription for me
INSERT INTO subscriptions (
    id, status, "isLifetime", "createdAt", "updatedAt", "userId"
) VALUES (
    '809f93f2-5db3-4637-813b-9f115d74b9be', 'active', true, '2020-12-23 02:43:45.711+00', '2020-12-23 02:43:45.711+00', 'a582bb59-e2fd-4888-b513-370c57f6c0d3'
);