-- Seed data for local development.
--
-- 27 real books across the problem categories Tayad matches against: stress,
-- procrastination, focus, habits, confidence, self-worth, relationships,
-- communication, career, purpose, money, health, grief, resilience.
--
-- Every row has a real ISBN-13, real author, and a plausible published page
-- count (spot-checked against Open Library). Titles and ISBNs should still be
-- re-verified against Google Books / Open Library before anything ships to
-- production -- the curated catalogue is the source of truth and the match
-- function only ever recommends from it.
--
-- No fake user data is seeded here. Recommendations, plans, logs, and streaks
-- are created by exercising the real app flow.

insert into public.books (title, author, isbn, page_count, cover_url, description, free_source_url, problem_tags) values

('Atomic Habits', 'James Clear', '9780735211292', 320,
 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
 'A practical system for building good habits and breaking bad ones, one small change at a time.',
 null, array['habits','procrastination','discipline','change','focus']),

('Deep Work', 'Cal Newport', '9781455586691', 296,
 'https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg',
 'Why the ability to focus without distraction is rare, valuable, and learnable.',
 null, array['focus','procrastination','career','distraction']),

('The Power of Now', 'Eckhart Tolle', '9781577314806', 236,
 'https://covers.openlibrary.org/b/isbn/9781577314806-L.jpg',
 'A guide to stepping out of anxious, ruminating thought and into the present moment.',
 null, array['anxiety','stress','overwhelm']),

('Man''s Search for Meaning', 'Viktor E. Frankl', '9780807014295', 184,
 'https://covers.openlibrary.org/b/isbn/9780807014295-L.jpg',
 'A psychiatrist''s account of surviving the camps and the case that meaning is found even in suffering.',
 null, array['purpose','grief','resilience','meaning']),

('The Subtle Art of Not Giving a F*ck', 'Mark Manson', '9780062457714', 224,
 'https://covers.openlibrary.org/b/isbn/9780062457714-L.jpg',
 'A counterintuitive argument for choosing what to care about instead of trying to feel good all the time.',
 null, array['anxiety','self-worth','overwhelm','values']),

('Mindset', 'Carol S. Dweck', '9780345472328', 320,
 'https://covers.openlibrary.org/b/isbn/9780345472328-L.jpg',
 'The difference between a fixed and a growth mindset, and how the latter changes what you attempt.',
 null, array['confidence','career','change','self-worth']),

('Daring Greatly', 'Brené Brown', '9781592408412', 320,
 'https://covers.openlibrary.org/b/isbn/9781592408412-L.jpg',
 'How the willingness to be vulnerable is the root of courage, connection, and creativity.',
 null, array['confidence','self-worth','relationships','vulnerability']),

('Why We Sleep', 'Matthew Walker', '9781501144325', 368,
 'https://covers.openlibrary.org/b/isbn/9781501144325-L.jpg',
 'The science of sleep and what losing it does to mood, focus, and health.',
 null, array['health','stress','focus']),

('Feeling Good', 'David D. Burns', '9780380810338', 736,
 'https://covers.openlibrary.org/b/isbn/9780380810338-L.jpg',
 'The classic self-help introduction to cognitive behavioural techniques for low mood and anxiety.',
 null, array['anxiety','self-worth','stress']),

('The Four Agreements', 'Don Miguel Ruiz', '9781878424310', 160,
 'https://covers.openlibrary.org/b/isbn/9781878424310-L.jpg',
 'Four simple commitments for freeing yourself from self-limiting beliefs.',
 null, array['self-worth','relationships','anxiety']),

('Essentialism', 'Greg McKeown', '9780804137386', 272,
 'https://covers.openlibrary.org/b/isbn/9780804137386-L.jpg',
 'The disciplined pursuit of less: doing fewer things, better.',
 null, array['overwhelm','focus','career','procrastination']),

('Digital Minimalism', 'Cal Newport', '9780525536512', 304,
 'https://covers.openlibrary.org/b/isbn/9780525536512-L.jpg',
 'A philosophy for using technology on purpose instead of by reflex.',
 null, array['distraction','focus','overwhelm','habits']),

('The War of Art', 'Steven Pressfield', '9781936891023', 190,
 'https://covers.openlibrary.org/b/isbn/9781936891023-L.jpg',
 'A short, blunt book about the internal resistance that stops creative work, and how to beat it.',
 null, array['procrastination','discipline','creativity']),

('Grit', 'Angela Duckworth', '9781501111112', 352,
 'https://covers.openlibrary.org/b/isbn/9781501111112-L.jpg',
 'The research case that sustained passion and perseverance matter more than raw talent.',
 null, array['discipline','purpose','career','confidence']),

('The Psychology of Money', 'Morgan Housel', '9780857197689', 256,
 'https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg',
 'Short essays on how behaviour, not math, drives financial outcomes.',
 null, array['money','anxiety']),

('I Will Teach You to Be Rich', 'Ramit Sethi', '9781523505746', 352,
 'https://covers.openlibrary.org/b/isbn/9781523505746-L.jpg',
 'A six-week, automation-first program for spending, saving, and investing without guilt.',
 null, array['money','habits']),

('Your Money or Your Life', 'Vicki Robin', '9780143115762', 368,
 'https://covers.openlibrary.org/b/isbn/9780143115762-L.jpg',
 'A nine-step program for changing your relationship with money and reclaiming your time.',
 null, array['money','purpose','overwhelm']),

('Quiet', 'Susan Cain', '9780307352156', 352,
 'https://covers.openlibrary.org/b/isbn/9780307352156-L.jpg',
 'The strengths of introverts in a culture built for extroverts.',
 null, array['confidence','self-worth','career','relationships']),

('Option B', 'Sheryl Sandberg', '9781524732684', 240,
 'https://covers.openlibrary.org/b/isbn/9781524732684-L.jpg',
 'Building resilience and finding meaning after loss and adversity.',
 null, array['grief','resilience','change']),

('When Things Fall Apart', 'Pema Chödrön', '9781611803433', 176,
 'https://covers.openlibrary.org/b/isbn/9781611803433-L.jpg',
 'Buddhist guidance for staying present with pain, fear, and uncertainty instead of running.',
 null, array['grief','anxiety','change','stress']),

('How to Win Friends and Influence People', 'Dale Carnegie', '9780671027032', 288,
 'https://covers.openlibrary.org/b/isbn/9780671027032-L.jpg',
 'The enduring handbook on listening, appreciation, and dealing with people.',
 null, array['relationships','communication','career','confidence']),

('Attached', 'Amir Levine', '9781585429134', 304,
 'https://covers.openlibrary.org/b/isbn/9781585429134-L.jpg',
 'Attachment theory applied to adult romantic relationships: anxious, avoidant, and secure styles.',
 null, array['relationships','anxiety','self-worth']),

('Nonviolent Communication', 'Marshall B. Rosenberg', '9781892005281', 264,
 'https://covers.openlibrary.org/b/isbn/9781892005281-L.jpg',
 'A method for expressing needs and hearing others without blame or demand.',
 null, array['relationships','communication']),

('The 7 Habits of Highly Effective People', 'Stephen R. Covey', '9781982137274', 464,
 'https://covers.openlibrary.org/b/isbn/9781982137274-L.jpg',
 'A principle-centred framework for personal and interpersonal effectiveness.',
 null, array['career','habits','purpose']),

('So Good They Can''t Ignore You', 'Cal Newport', '9781455509126', 304,
 'https://covers.openlibrary.org/b/isbn/9781455509126-L.jpg',
 'The argument that skill comes before passion, and how to build a career you love.',
 null, array['career','purpose','confidence']),

('Can''t Hurt Me', 'David Goggins', '9781544512280', 364,
 'https://covers.openlibrary.org/b/isbn/9781544512280-L.jpg',
 'A memoir and challenge about pushing past the mind''s self-imposed limits.',
 null, array['discipline','confidence','resilience']),

('Meditations', 'Marcus Aurelius', '9780812968255', 256,
 'https://covers.openlibrary.org/b/isbn/9780812968255-L.jpg',
 'The private notebook of a Roman emperor practising Stoic calm under pressure.',
 'https://standardebooks.org/ebooks/marcus-aurelius/meditations',
 array['stress','purpose','resilience','anxiety']);
