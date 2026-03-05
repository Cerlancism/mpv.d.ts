# mpv.d.ts

TypeScript definitions for [mpv](https://mpv.io) scripting (JavaScript).

## Install

```sh
npm install @types/mpv@https://github.com/Cerlancism/mpv.d.ts
```

## Coverage

### Global types
- `MPVEvent` — 12 active events, plus `idle` (deprecated) and `queue-overflow` (internal)
- `MPVHookType` — all 6 hook types
- `MPVProperty` — 40+ built-in properties with `string & {}` fallback for custom names
- `MPVTimerObject`, `MPVOSDOverlay`, `MPVOSDSize`
- `MPVKeyBindingEvent`, `MPVSubprocessResult`, `MPVFileInfo`
- Event payload interfaces: `MPVBaseEvent`, `MPVLogMessageEvent`, `MPVStartFileEvent`, `MPVEndFileEvent`, `MPVPropertyChangeEvent`, `MPVClientMessageEvent`, `MPVHookEvent`

### `mp`
`register_event`, `unregister_event`, `get_property`, `get_property_number`, `get_property_osd`, `get_property_bool`, `get_property_native`, `set_property`, `set_property_bool`, `set_property_number`, `set_property_native`, `del_property`, `observe_property`, `unobserve_property`, `command`, `commandv`, `command_native`, `command_native_async`, `abort_async_command`, `register_script_message`, `unregister_script_message`, `add_key_binding`, `add_forced_key_binding`, `remove_key_binding`, `add_timeout` (Lua), `add_periodic_timer` (Lua), `get_time`, `get_time_ms`\*, `get_opt`, `get_script_name`, `get_script_directory`, `get_script_file`, `register_idle`, `unregister_idle`, `enable_messages`, `osd_message`, `create_osd_overlay`, `get_osd_size`, `add_hook`, `last_error`\*, `wait_event`, `dispatch_event`\*, `process_timers`\*, `notify_idle_observers`\*, `peek_timers_wait`\*, `keep_running`\*, `module_paths`\*, `get_wakeup_pipe` (deprecated), `get_next_timeout` (Lua), `dispatch_events` (Lua)

### `mp.msg`
`log`, `fatal`, `error`, `warn`, `info`, `verbose`, `v`, `debug`, `trace`

### `mp.utils`
`write_file`\*, `read_file`\*, `getcwd`, `readdir`, `file_info`, `split_path`, `join_path`, `subprocess`, `subprocess_detached`, `getpid`, `get_env_list`, `parse_json`, `format_json`†, `to_string`†, `getenv`\*, `get_user_path`\*, `append_file`\*, `compile_js`\*

### `mp.options`
`read_options`

### `mp.input`
`get`, `select`, `terminate`, `log`, `set_log`

### Globals
`print`, `dump`\*, `setTimeout`\*, `setInterval`\*, `clearTimeout`\*, `clearInterval`\*, `exit`\*

\* JavaScript only

† Lua only

## Usage

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "types": ["mpv.d.ts"]
  }
}
```

Or reference directly in your script file:

```ts
/// <reference types="mpv.d.ts" />
```


