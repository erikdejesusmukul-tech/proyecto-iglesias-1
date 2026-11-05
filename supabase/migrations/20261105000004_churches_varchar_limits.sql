-- Expand church text fields so all catalog values fit without truncation.
-- The current catalog contains contact phone strings up to 63 characters.

alter table public.churches
  alter column name type varchar(255),
  alter column slug type varchar(255),
  alter column legal_registration_number type varchar(255),
  alter column contact_phone type text;
