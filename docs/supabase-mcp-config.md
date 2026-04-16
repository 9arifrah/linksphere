# Supabase MCP Server Configuration

## Project Details
- **Project ID**: `jrokjtylgagfzjflzwjy`
- **Server URL**: `https://mcp.supabase.com/mcp`
- **Date**: 2025-04-16

---

## Konfigurasi OpenCode

Tambahkan konfigurasi berikut ke file settings OpenCode Anda:

### Option 1: Read-Only + Project Scoped (Recommended)

**Keamanan tinggi - hanya bisa read, scoped ke project spesifik**

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=jrokjtylgagfzjflzwjy&read_only=true"
    }
  }
}
```

**Fitur yang tersedia:**
- ✅ Query database (SELECT only)
- ✅ List tables dan schema
- ✅ Generate TypeScript types
- ✅ View logs dan advisors
- ❌ Tidak bisa: INSERT, UPDATE, DELETE, CREATE, DROP, ALTER
- ❌ Tidak bisa: Pause/restore project, deploy functions, manage branches

---

### Option 2: Project Scoped dengan Write Access

**Bisa read dan write, tapi scoped ke project spesifik**

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=jrokjtylgagfzjflzwjy"
    }
  }
}
```

**Fitur yang tersedia:**
- ✅ Semua fitur Option 1
- ✅ Execute SQL (INSERT, UPDATE, DELETE)
- ✅ Apply migrations
- ✅ Deploy Edge Functions
- ✅ Manage branches (create, merge, delete, reset, rebase)
- ✅ Update storage config
- ❌ Tidak bisa: Create/pause/restore project (account-level)

---

### Option 3: Limited Features - Database Only

**Hanya fitur database dan docs, sangat aman**

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=jrokjtylgagfzjflzwjy&read_only=true&features=database,docs"
    }
  }
}
```

**Fitur yang tersedia:**
- ✅ Query database (SELECT only)
- ✅ List tables dan extensions
- ✅ List migrations
- ✅ Search Supabase documentation
- ❌ Tidak bisa: Logs, advisors, functions, storage, branching, development tools

---

## Cara Install di OpenCode

### Step 1: Buka Settings

Di OpenCode, buka settings melalui:
- Menu: `Settings` → `Configuration`
- Atau shortcut: `Ctrl/Cmd + ,`

### Step 2: Tambahkan MCP Configuration

Cari bagian "MCP Servers" atau "Model Context Protocol" di settings.

Tambahkan entry baru:

**Name**: `supabase`
**Type**: `http`
**URL**: Pilih salah satu dari URL di atas (disarankan Option 1)

### Step 3: Restart OpenCode

Setelah menambahkan konfigurasi:
1. Save settings
2. **Restart OpenCode** (close dan buka lagi)
3. Saat pertama kali connect, akan muncul prompt untuk login ke Supabase
4. Login dengan akun Supabase Anda dan authorize access

---

## Tools yang Tersedia

Setelah terhubung, AI akan bisa menggunakan tools berikut:

### Database Tools
- `list_tables` - List semua tables dalam schema
- `list_extensions` - List PostgreSQL extensions
- `list_migrations` - List database migrations
- `apply_migration` - Apply SQL migration (non-read-only only)
- `execute_sql` - Execute raw SQL queries

### Development Tools
- `get_project_url` - Get API URL untuk project
- `get_publishable_keys` - Get anon/publishable API keys
- `generate_typescript_types` - Generate TypeScript types dari schema

### Debugging Tools
- `get_logs` - Get logs by service type (api, postgres, edge functions, etc)
- `get_advisors` - Get advisory notices (security/performance)

### Edge Functions
- `list_edge_functions` - List semua Edge Functions
- `get_edge_function` - Get Edge Function contents
- `deploy_edge_function` - Deploy/update Edge Function

### Branching (Paid Plan)
- `create_branch` - Create development branch
- `list_branches` - List all branches
- `delete_branch` - Delete development branch
- `merge_branch` - Merge branch ke production
- `reset_branch` - Reset branch ke version sebelumnya
- `rebase_branch` - Rebase branch on production

### Documentation
- `search_docs` - Search Supabase documentation

---

## Security Best Practices

### ✅ Do:
- Gunakan **read_only mode** untuk production data
- Scope ke **project spesifik** (gunakan project_ref)
- Enable **manual approval** untuk setiap tool call (jika tersedia di client)
- Gunakan **development branch** untuk testing
- Review setiap query sebelum execute

### ❌ Don't:
- Connect ke production database dengan write access
- Berikan access ke customers/end users
- Jalankan query tanpa review terlebih dahulu
- Skip OAuth approval saat pertama kali connect

---

## Testing Konfigurasi

Setelah setup, test dengan bertanya ke AI:

```
"List all tables in my Supabase database"
"Show me the schema for table users"
"Generate TypeScript types for my database"
"Search Supabase docs about Row Level Security"
```

Jika konfigurasi benar, AI akan bisa menjalankan query ke database Anda.

---

## Troubleshooting

### Issue: "Cannot connect to MCP server"
- Pastikan URL benar (check project_ref)
- Pastikan sudah login dan authorize di browser
- Check internet connection

### Issue: "Permission denied"
- Jika menggunakan read_only, tidak bisa execute write queries
- Check Supabase project permissions di dashboard

### Issue: "Project not found"
- Pastikan project_ref benar: `jrokjtylgagfzjflzwjy`
- Pastikan project masih aktif di Supabase dashboard

---

## Link Penting

- **Supabase Dashboard**: https://supabase.com/dashboard/project/jrokjtylgagfzjflzwjy
- **MCP Connection Tab**: https://supabase.com/dashboard/project/jrokjtylgagfzjflzwjy?showConnect=true&connectTab=mcp
- **Project Settings**: https://supabase.com/dashboard/project/jrokjtylgagfzjflzwjy/settings/general
- **MCP Documentation**: https://supabase.com/docs/guides/getting-started/mcp

---

## Next Steps

Setelah MCP terhubung, saya bisa membantu Anda:

1. **Setup Supabase untuk LinkSphere**:
   - Create tables sesuai schema project
   - Apply migrations
   - Setup Row Level Security (RLS)
   - Generate TypeScript types

2. **Database Management**:
   - Query data
   - Optimize performance
   - Debug issues

3. **Development**:
   - Create Edge Functions
   - Manage branches
   - Deploy changes

Ready to connect! 🚀
