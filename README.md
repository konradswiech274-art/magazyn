# Wspólny magazyn — podgląd publiczny + wspólny administrator

Aplikacja React + Supabase. Każdy odwiedzający może przeglądać i wyszukiwać produkty. Dodawanie, zmiana ilości i usuwanie są dostępne wyłącznie po zalogowaniu do wspólnego konta administratora. Zmiany synchronizują się na żywo.

## 1. Zaktualizuj zabezpieczenia Supabase

1. Otwórz swój projekt Supabase.
2. Wejdź w **SQL Editor → New query**.
3. Otwórz plik `supabase.sql` z tego ZIP-a, skopiuj całą zawartość i uruchom ją przyciskiem **Run**.
4. Ten SQL zachowuje tabelę `items`, usuwa stare otwarte polityki edycji i wprowadza reguły: publiczny odczyt, zapis tylko dla zalogowanych.

## 2. Utwórz wspólne konto administratora

1. W Supabase otwórz **Authentication → Users**.
2. Wybierz **Add user** (czasem „Create new user”).
3. Wpisz adres e-mail, który będzie wspólnym loginem, oraz ustaw hasło.
4. Jeśli pojawi się opcja potwierdzenia e-mail, wybierz utworzenie użytkownika jako potwierdzonego / **Auto Confirm User**.
5. Nie włączaj publicznej rejestracji dla odwiedzających. Konto tworzy administrator ręcznie w panelu Supabase.
6. Przekaż koledze ten sam adres e-mail i hasło. Oboje będziecie logować się tym samym kontem.

**Ważne:** To jest wspólne konto, więc oboje używacie tego samego loginu i hasła. Każdy, kto pozna te dane, będzie mógł edytować magazyn. Nie umieszczaj hasła w repozytorium ani w kodzie strony.

## 3. Ustawienia Vercel

W Vercel → projekt → **Settings → Environment Variables** ustaw:
- `VITE_SUPABASE_URL` — Project URL z Supabase → Settings → API
- `VITE_SUPABASE_ANON_KEY` — publiczny anon/publishable key z tego samego miejsca

Nie używaj klucza `service_role` ani `secret` w Vercel jako zmiennej `VITE_...` ani w kodzie przeglądarki.

Następnie wgraj pliki tego projektu do repozytorium GitHub (zastępując stare pliki) i wykonaj nowy Deploy w Vercel. Po wdrożeniu otwórz produkcyjny adres strony.

## 4. Jak działa strona

- Bez logowania: oglądanie i wyszukiwanie.
- Po zalogowaniu wspólnym kontem: dodawanie produktów, zmiana ilości i usuwanie.
- Przycisk „Wyloguj” wraca do publicznego podglądu.
- Supabase Row Level Security egzekwuje uprawnienia również po stronie bazy, a nie tylko przez ukrycie przycisków w interfejsie.

Jeśli wcześniej włączono inne, własne polityki RLS dla tabeli `items`, sprawdź je w Supabase. Polityki RLS są łączone regułą OR; dodatkowa polityka dopuszczająca zapis dla `anon` mogłaby ponownie otworzyć edycję.
