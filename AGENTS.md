<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Supabase: új táblákhoz kötelező a GRANT

2026. október 30-tól a Supabase a `public` sémában létrehozott új táblákhoz nem ad automatikusan Data API hozzáférést. Minden migrációban, amely új táblát hoz létre (`create table`), ugyanott meg kell adni a jogosultságokat is, különben a supabase-js / PostgREST „permission denied” hibát ad:

```sql
grant select on public.<tabla> to anon;                                        -- csak ha kijelentkezve is olvasható kell legyen
grant select, insert, update, delete on public.<tabla> to authenticated;       -- csak ha a böngészőből (bejelentkezett felhasználóként) is elérjük
grant select, insert, update, delete on public.<tabla> to service_role;        -- mindig: a szerveroldali API route-ok ezzel érik el
```

Csak annyi jogot adj az `anon` és `authenticated` szerepkörnek, amennyit a tábla használata megkövetel; a tényleges sor-szintű védelmet továbbra is az RLS policy-k adják. Meglévő táblákhoz oszlopot hozzáadni (`alter table … add column`) nem igényel új grantot.
