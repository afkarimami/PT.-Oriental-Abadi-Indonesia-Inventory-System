-- Seed sederhana: kantor hanya menggunakan pembagian Rak.
insert into public.racks (code, name)
values
  ('A', 'Rak A'), ('B', 'Rak B'), ('C', 'Rak C'), ('D', 'Rak D'),
  ('E', 'Rak E'), ('F', 'Rak F'), ('G', 'Rak G'), ('H', 'Rak H'),
  ('J', 'Rak J'), ('K', 'Rak K'), ('T', 'Rak T'), ('U', 'Rak U')
on conflict (code) do update
set name = excluded.name, is_active = true;