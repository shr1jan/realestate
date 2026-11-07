DELETE FROM saved_homes WHERE user_id = 'local_seedy';
DELETE FROM inquiries WHERE email IN ('qa-flow@stillwell.test','browser-qa@stillwell.test');
DELETE FROM listings WHERE id = '0e6bb6c7-a515-48ae-8f82-4ccbe5799a78' AND title = 'QA lifecycle home';
