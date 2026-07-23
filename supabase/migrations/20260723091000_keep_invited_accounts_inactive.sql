-- Undangan belum boleh memperoleh akses sebelum penerima menyelesaikan aktivasi akun.
update public.profiles as profile
set is_active = false
from auth.users as account
where profile.id = account.id
  and account.invited_at is not null
  and account.last_sign_in_at is null;