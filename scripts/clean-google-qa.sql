-- Local QA identities only. Run against local D1 after authentication checks.
DELETE FROM saved_homes WHERE user_id IN ('google:local_seedy','google:qa_second_visitor');
DELETE FROM admins WHERE user_id IN ('google:local_seedy','google:qa_second_visitor');
