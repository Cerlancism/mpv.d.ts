type TypesInString = "none" | "native" | "bool" | "number" | "string" | null | undefined
type ActualType<T extends TypesInString>
    = T extends null | undefined | "none" ? null
    : T extends "native" ? unknown
    : T extends "bool" ? boolean
    : T extends "number" ? number
    : T extends "string" ? string : never

type MPVEvent
    = "start-file"
    | "end-file"
    | "file-loaded"
    | "seek"
    | "playback-restart"
    | "shutdown"
    | "log-message"
    | "hook"
    | "client-message"
    | "video-reconfig"
    | "audio-reconfig"
    | "property-change"
    /** Returned by wait_event() when the queue is empty and the timeout expires. */
    | "none"
    /** @internal Not in the official event list; internal C API event. */
    | "queue-overflow"
    /** @deprecated Removed from mpv; do not use. */
    | "idle"

type MPVHookType
    = "on_load"
    | "on_load_fail"
    | "on_preloaded"
    | "on_unload"
    | "on_before_start_file"
    | "on_after_end_file"

type MPVProperty
    = "time-pos"
    | "fullscreen"
    | "filename"
    | "filename/no-ext"
    | "pause"
    | "volume"
    | "mute"
    | "duration"
    | "chapter"
    | "playlist-count"
    | "playlist-pos"
    | "playlist-pos-1"
    | "speed"
    | "loop"
    | "loop-file"
    | "loop-playlist"
    | "aid"
    | "vid"
    | "sid"
    | "sub-delay"
    | "sub-scale"
    | "audio-delay"
    | "video-zoom"
    | "video-pan-x"
    | "video-pan-y"
    | "video-rotate"
    | "osd-width"
    | "osd-height"
    | "path"
    | "media-title"
    | "chapter-list"
    | "track-list"
    | "playlist"
    | "vo-configured"
    | "seeking"
    | "idle-active"
    | "percent-pos"
    | "time-remaining"
    | "audio-pts"
    | "stream-pos"
    | "stream-end"
    | "demuxer-cache-time"
    | "demuxer-cache-idle"
    | (string & {})

/** Opaque handle returned by command_native_async; pass to abort_async_command. */
type MPVAsyncCommandHandle = object & { readonly __brand: unique symbol }

interface MPVTimerObject {
    stop(): void
    kill(): void
    resume(): void
    is_enabled(): boolean
    timeout: number
    oneshot: boolean
}

interface MPVOSDOverlay {
    /** Unique id for this overlay */
    id: number
    /** ASS or "none" */
    format: "ass-events" | "none"
    /** ASS event text */
    data: string
    /** Reference resolution width (default 0 = use video resolution) */
    res_x: number
    /** Reference resolution height */
    res_y: number
    /** Z layer order */
    z: number
    /** Whether the overlay is hidden */
    hidden: boolean
    /** Commit overlay changes to the screen */
    update(): void
    /** Remove the overlay */
    remove(): void
}

interface MPVOSDSize {
    width: number
    height: number
    aspect: number
}

interface MPVKeyBindingEvent {
    /** "down" | "up" | "repeat" | "press" */
    event: "down" | "up" | "repeat" | "press"
    is_mouse: boolean
    canceled: boolean
    key_name: string | undefined
    key_text: string | undefined
    /** Analog scale (e.g. for mouse wheel) */
    scale: number
    /** User-provided argument string from a script-binding command */
    arg: string | undefined
}

interface MPVSubprocessResult {
    /** Exit status code, or -1 on error */
    status: number
    stdout: string
    stderr: string
    /** Human-readable error, empty string on success */
    error_string: string
    /** True if terminated by mpv abort */
    killed_by_us: boolean
}

interface MPVFileInfo {
    /** Unix permission bits (Lua only) */
    mode: number
    size: number
    atime: number
    mtime: number
    ctime: number
    is_file: boolean
    is_dir: boolean
}

interface MPVBaseEvent {
    event: MPVEvent
    /** The reply_userdata value. Only present if non-zero. */
    id?: number
    error?: string
}

interface MPVLogMessageEvent extends MPVBaseEvent {
    event: "log-message"
    prefix: string
    level: "fatal" | "error" | "warn" | "info" | "v" | "debug" | "trace"
    text: string
}

interface MPVStartFileEvent extends MPVBaseEvent {
    event: "start-file"
    playlist_entry_id: number
}

interface MPVEndFileEvent extends MPVBaseEvent {
    event: "end-file"
    reason: "eof" | "stop" | "quit" | "error" | "redirect" | "unknown"
    playlist_entry_id: number
    /** @deprecated Since mpv 0.33.0. The top-level `error` field supersedes this. */
    file_error?: string
    playlist_insert_id?: number
    playlist_insert_num_entries?: number
}

interface MPVPropertyChangeEvent extends MPVBaseEvent {
    event: "property-change"
    /** The name of the observed property. */
    name: string
    data: unknown
}

interface MPVClientMessageEvent extends MPVBaseEvent {
    event: "client-message"
    args: string[]
}

interface MPVHookEvent extends MPVBaseEvent {
    event: "hook"
    hook_id: number
}

/**
    ## JAVASCRIPT
    JavaScript support in mpv is near identical to its Lua support. Use this section as reference on differences and availability of APIs, but otherwise you should refer to the Lua documentation for API details and general scripting in mpv.

    ### Example
    ```
    function on_pause_change(name, value) {
        if (value == true)
            mp.set_property("fullscreen", "no");
    }
    mp.observe_property("pause", "bool", on_pause_change);
    ```
    ### Similarities with Lua

    mpv tries to load a script file as JavaScript if it has a .js extension, but otherwise, the documented Lua options, script directories, loading, etc apply to JavaScript files too.

    Script initialization and lifecycle is the same as with Lua, and most of the Lua functions in the modules mp, mp.utils, mp.msg, mp.options and mp.input are available to JavaScript with identical APIs - including running commands, getting/setting properties, registering events/key-bindings/hooks, etc.

    ### Differences from Lua

    No need to load modules. mp, mp.utils, mp.msg, mp.options and mp.input are preloaded, and you can use e.g. var cwd = mp.utils.getcwd(); without prior setup.

    Errors are slightly different. Where the Lua APIs return nil for error, the JavaScript ones return undefined. Where Lua returns something, error JavaScript returns only something - and makes error available via mp.last_error(). Note that only some of the functions have this additional error value - typically the same ones which have it in Lua.

    Standard APIs are preferred. For instance setTimeout and JSON.stringify are available, but mp.add_timeout and mp.utils.format_json are not.

    No standard library. This means that interaction with anything outside of mpv is limited to the available APIs, typically via mp.utils. However, some file functions were added, and CommonJS require is available too - where the loaded modules have the same privileges as normal scripts.

    ### Language features - ECMAScript 5

    The scripting backend which mpv currently uses is MuJS - a compatible minimal ES5 interpreter. As such, String.substring is implemented for instance, while the common but non-standard String.substr is not. Please consult the MuJS pages on language features and platform support - https://mujs.com .

 */
declare namespace mp
{
    /**
        Call a specific function when an event happens. The event name is a string, and the function fn is a Lua function value.

        Some events have associated data. This is put into a Lua table and passed as argument to fn. The Lua table by default contains an event field, which is a string containing the event name. If the event has an error associated, the error field is set to a string describing the error, on success it's not set.

        If multiple functions are registered for the same event, they are run in registration order, which the first registered function running before all the other ones.
     * @param event name of the event. See https://mpv.io/manual/master/#list-of-events
     * @param fn 
     * @returns Returns true if such an event exists, false otherwise.
    */
    function register_event<T extends MPVEvent>(event: T, fn: (event: MPVBaseEvent & Record<string, unknown>) => void): boolean

    /**
     * Undo mp.register_event(..., fn). This removes all event handlers that are equal to the fn parameter. This uses normal Lua == comparison, so be careful when dealing with closures.
     * @param fn 
     */
    function unregister_event(fn: (event: MPVBaseEvent & Record<string, unknown>) => void): void

    /**
     * Return the value of the given property as a string, formatted like `${=name}` in input.conf.
     * Returns `def` (default `undefined`) on error.
     * @see https://mpv.io/manual/master/#properties
     */
    function get_property(name: MPVProperty, def?: string): string | undefined
    /**
     * Like `get_property`, but returns the property value as a number.
     * mpv internally requests a double float; integer properties are converted automatically.
     * Returns `def` (default `undefined`) on error.
     */
    function get_property_number(name: MPVProperty, def?: number): number | undefined

    /**
     * Register a handler for `script-message` / `script-message-to` with the given `name`.
     * All extra parameters from the message call are passed as arguments to `fn`.
     * Overwrites any previously registered handler for the same name.
     * Note: also used internally by `add_key_binding` — avoid name collisions.
     */
    function register_script_message(name: string, fn: (...args: string[]) => void): void
    /**
     * Watch a property for changes. When `name` changes, `fn(name, value)` is called.
     * `value` is retrieved using `get_property_<type>`; if unavailable or on error it is `null`.
     * An initial change notification is always delivered to seed the handler's state.
     * Rapid successive changes are coalesced — only the last triggers the callback.
     * Avoid `type: "none"` / `null` — the callback may fire even without an actual change.
     */
    function observe_property<P extends MPVProperty, T extends TypesInString>(name: P, type: T, fn: (name: P, value: ActualType<T>) => void): void

    /**
     * Show an OSD message on screen.
     * @param duration Seconds to display the message (defaults to `--osd-duration`).
     */
    function osd_message(text: any, duration?: number): void
    /**
     * Run an mpv command, passing each argument separately (no quoting/escaping needed).
     * Properties are **not** expanded — use `get_property` or the `expand-properties` prefix.
     * Does not use OSD by default (unlike `command()`).
     * Returns `true` on success.
     * @example mp.commandv("loadfile", filename, "append")
     */
    function commandv(command: string, ...args: any[]): boolean

    /** Run a string mpv command. Returns true on success. */
    function command(str: string): boolean

    /**
     * Run a command given as a native table. On error returns `def` if provided,
     * otherwise returns `undefined` (JS) / `nil` (Lua) and sets last_error().
     */
    function command_native<T = unknown>(table: { name: string; [key: string]: any } | any[], def?: T): T | undefined

    /**
     * Async variant of command_native. Calls fn(success, result, error) when done.
     * Returns an opaque handle that can be passed to abort_async_command().
     */
    function command_native_async(table: { name: string; [key: string]: any } | any[], fn?: (success: boolean, result: unknown, error: string) => void): MPVAsyncCommandHandle

    /** Abort a pending async command by its handle. */
    function abort_async_command(handle: MPVAsyncCommandHandle): void

    /** Get a property as an OSD-formatted string. Returns def on error. */
    function get_property_osd(name: MPVProperty, def?: string): string | undefined

    /** Get a property as a boolean. Returns def on error. */
    function get_property_bool(name: MPVProperty, def?: boolean): boolean | undefined

    /** Get a property in its native type. Returns def on error. */
    function get_property_native(name: MPVProperty, def?: unknown): unknown

    /** Set a property to a string value. Returns true on success. */
    function set_property(name: MPVProperty, value: string): boolean

    /** Set a property to a boolean value. Returns true on success. */
    function set_property_bool(name: MPVProperty, value: boolean): boolean

    /** Set a property to a number value. Returns true on success. */
    function set_property_number(name: MPVProperty, value: number): boolean

    /** Set a property to a native value. Returns true on success. */
    function set_property_native(name: MPVProperty, value: unknown): boolean

    /** Delete (unset) a property. Returns true on success. */
    function del_property(name: MPVProperty): boolean

    /** Remove all observe_property handlers matching fn. */
    function unobserve_property(fn: (name: string, value: unknown) => void): void

    /**
     * Bind a key to a function or named binding.
     * @param flags Optional flags object, e.g. `{ repeatable: true, complex: true }`
     */
    function add_key_binding(key: string, name_or_fn: string | ((event?: MPVKeyBindingEvent) => void), fn?: (event?: MPVKeyBindingEvent) => void, flags?: { repeatable?: boolean; complex?: boolean; scalable?: boolean; [key: string]: any }): void

    /**
     * Like add_key_binding but overrides built-in mpv key bindings.
     */
    function add_forced_key_binding(key: string, name_or_fn: string | ((event?: MPVKeyBindingEvent) => void), fn?: (event?: MPVKeyBindingEvent) => void, flags?: { repeatable?: boolean; complex?: boolean; scalable?: boolean; [key: string]: any }): void

    /** Remove a named key binding. */
    function remove_key_binding(name: string): void

    /**
     * Call fn once after `seconds`. Returns a timer object.
     * @luaonly Use setTimeout() instead in JavaScript.
     */
    function add_timeout(seconds: number, fn: () => void, disabled?: boolean): MPVTimerObject

    /**
     * Call fn every `seconds`. Returns a timer object.
     * @luaonly Use setInterval() instead in JavaScript.
     */
    function add_periodic_timer(seconds: number, fn: () => void, disabled?: boolean): MPVTimerObject

    /** Return the current playback time in seconds. */
    function get_time(): number

    /**
     * Return the current playback time in milliseconds.
     * @jsonly
     */
    function get_time_ms(): number

    /** Return the value of a script option (from --script-opts). */
    function get_opt(key: string): string | undefined

    /** Return the name of the current script. */
    function get_script_name(): string

    /** Return the directory containing the current script, or undefined. */
    function get_script_directory(): string | undefined

    /**
     * Return the file name of the current script.
     * @jsonly
     */
    function get_script_file(): string

    /** Register a function to be called when mpv becomes idle. */
    function register_idle(fn: () => void): void

    /** Remove an idle handler registered with register_idle. */
    function unregister_idle(fn: () => void): void

    /**
     * Set the minimum log level for log-message events.
     * @param level One of: "fatal", "error", "warn", "info", "v", "debug", "trace", "no"
     */
    function enable_messages(level: "fatal" | "error" | "warn" | "info" | "v" | "debug" | "trace" | "no"): void

    /** Unregister a script message handler by name. */
    function unregister_script_message(name: string): void

    /**
     * Create an OSD overlay object.
     * @param format Currently only "ass-events" is supported.
     */
    function create_osd_overlay(format: "ass-events" | "none"): MPVOSDOverlay

    /** Return the current OSD/window size and aspect ratio. */
    function get_osd_size(): MPVOSDSize | undefined

    /**
     * Register a hook. fn receives a hook object; call hook.cont() to continue
     * or hook.defer() to defer continuation (advanced, Lua only).
     * @param type Hook type, e.g. "on_load"
     * @param priority Numeric priority; lower runs first
     */
    function add_hook(type: MPVHookType, priority: number, fn: (hook: { cont(): void; defer(): void }) => void): void

    /**
     * Return the last error string from a JS API call.
     * @jsonly
     */
    function last_error(): string

    /**
     * Block until an event arrives or `wait` seconds pass.
     * Returns an event object with at least an `event` field.
     */
    function wait_event(wait: number): MPVBaseEvent & Record<string, unknown>

    /**
     * Return the time in seconds until the next scheduled timer fires,
     * or undefined if there are no pending timers.
     * @luaonly
     */
    function get_next_timeout(): number | undefined

    /**
     * Process pending events. If allow_wait is true, block until at least
     * one event is processed.
     * @luaonly
     */
    function dispatch_events(allow_wait?: boolean): void

    /**
     * Return a file descriptor that becomes readable when mpv has events pending.
     * @deprecated Use wait_event() instead.
     */
    function get_wakeup_pipe(): number

    /**
     * Dispatch a single event object to all registered handlers.
     * Used internally by the JS event loop.
     * @jsonly
     */
    function dispatch_event(event: MPVBaseEvent & Record<string, unknown>): void

    /**
     * Process all due timers immediately.
     * @returns Milliseconds until the next timer fires, or -1 if there are no pending timers.
     * @jsonly
     */
    function process_timers(): number

    /**
     * Call all registered idle observers.
     * @jsonly
     */
    function notify_idle_observers(): void

    /**
     * Return milliseconds until the next timer fires without processing timers.
     * Returns -1 if there are no pending timers. Invalid if called from a timer callback.
     * @jsonly
     */
    function peek_timers_wait(): number

    /**
     * Controls whether the event loop continues running.
     * Set to false to stop the script's event loop.
     * @jsonly
     */
    let keep_running: boolean

    /**
     * Array of paths searched by `require()` for CommonJS modules.
     * @jsonly
     */
    let module_paths: string[]
}

declare namespace mp.msg
{
    /** Log a message at the given level. */
    function log(level: "fatal" | "error" | "warn" | "info" | "v" | "debug" | "trace", ...args: any[]): void
    function fatal(...args: any[]): void
    function error(...args: any[]): void
    function warn(...args: any[]): void
    function info(...args: any[]): void
    /** Verbose level log. */
    function verbose(...args: any[]): void
    /** Alias for verbose. */
    function v(...args: any[]): void
    function debug(...args: any[]): void
    function trace(...args: any[]): void
}

declare namespace mp.utils
{
    /**
     * Write text content to a file (overwrite). `fname` must be prefixed with `file://`,
     * e.g. `mp.utils.write_file("file://~/foo.txt", "hello")`.
     * @jsonly
     */
    function write_file(file: string, content: string): void
    /**
     * Return the content of file `fname` as a string. If `max` is provided and
     * not negative, limit the read to `max` bytes.
     * @jsonly
     */
    function read_file(file: string, max?: number): string

    /** Return the current working directory, or undefined on error. */
    function getcwd(): string | undefined

    /**
     * List directory contents.
     * @param filter "files" | "dirs" | "normal" | "all" (default "normal")
     * @returns Array of entry names, or undefined on error.
     */
    function readdir(path: string, filter?: "files" | "dirs" | "normal" | "all"): string[] | undefined

    /** Return file metadata for path, or undefined on error. */
    function file_info(path: string): MPVFileInfo | undefined

    /**
     * Split a path into [directory, filename].
     * @returns Tuple of [directory, filename]
     */
    function split_path(path: string): [string, string]

    /** Join two path components. */
    function join_path(p1: string, p2: string): string

    /**
     * Run a subprocess synchronously.
     * @param t.args Array of command + arguments
     * @param t.stdin Optional string piped to stdin
     * @param t.playback_only If true, abort when playback stops (default false)
     * @param t.capture_stdout If true, capture stdout (default false)
     * @param t.capture_stderr If true, capture stderr (default false)
     * @param t.env Optional environment variables array ["KEY=VALUE", ...]
     */
    function subprocess(t: {
        args: string[]
        stdin?: string
        playback_only?: boolean
        capture_stdout?: boolean
        capture_stderr?: boolean
        env?: string[]
        [key: string]: any
    }): MPVSubprocessResult

    /**
     * Run a subprocess detached (fire-and-forget). Returns void.
     */
    function subprocess_detached(t: {
        args: string[]
        env?: string[]
        [key: string]: any
    }): void

    /** Return the PID of the mpv process. */
    function getpid(): number

    /** Return the current process environment as ["KEY=VALUE", ...]. */
    function get_env_list(): string[]

    /**
     * Parse a JSON string. Returns the parsed value, or undefined on error.
     * @param trail If true, trailing non-JSON content is allowed.
     * @luaonly In JavaScript, prefer `JSON.parse()` instead.
     */
    function parse_json(str: string, trail?: boolean): unknown

    /**
     * Serialize a value to a JSON string.
     * @luaonly Use JSON.stringify() instead in JavaScript.
     * @returns JSON string, or undefined on error.
     */
    function format_json(v: unknown): string | undefined

    /**
     * Convert any value to a human-readable string. Formats tables and their contents.
     * @luaonly In JavaScript, use `dump()` instead.
     */
    function to_string(v: unknown): string

    /**
     * Get an environment variable value.
     * @jsonly
     */
    function getenv(name: string): string | undefined

    /**
     * Expand a path that may start with ~/ or ~~/.
     * @jsonly
     */
    function get_user_path(path: string): string

    /**
     * Append text content to a file (create if not exists). `fname` must be prefixed with `file://`,
     * e.g. `mp.utils.append_file("file://~/foo.txt", "hello")`.
     * @jsonly
     */
    function append_file(fname: string, str: string): void

    /**
     * Compile and return a JavaScript function from source.
     * @jsonly
     */
    function compile_js(fname: string, content: string): Function
}

declare namespace mp.options
{
    /**
     * Read script options from mpv's `--script-opts` or a config file.
     * Mutates `table` in place with the parsed values.
     * @param table Object whose keys are option names and values are defaults.
     * @param identifier Script name used to look up options (defaults to script name).
     * @param on_update Callback called with changed keys when options are updated at runtime.
     */
    function read_options(
        table: Record<string, string | number | boolean>,
        identifier?: string,
        on_update?: (changed: Record<string, boolean>) => void
    ): void
}

declare namespace mp.input
{
    /**
     * Open a text input prompt.
     * @param t.prompt Prompt string shown to the user.
     * @param t.submit Called with the entered text when the user submits.
     * @param t.closed Called when the input box is closed without submitting.
     * @param t.default_text Pre-filled text.
     * @param t.cursor_position Initial cursor position (1-based).
     * @param t.keep_open If true, keep the input open after submit.
     * @param t.opened Called when the input box is opened.
     * @param t.edited Called on every keystroke with current text and cursor position.
     * @param t.complete Called when the user presses Tab to request completion.
     * @param t.autoselect_completion If true, auto-selects single completion results.
     * @param t.history_path Path to a file for persistent input history.
     * @param t.id Unique id to reuse an existing input box.
     */
    function get(t: {
        prompt?: string
        submit?: (text: string) => void
        closed?: (text: string, cursor_position: number) => void
        default_text?: string
        cursor_position?: number
        keep_open?: boolean
        opened?: () => void
        edited?: (text: string) => void
        complete?: (text: string, response: (completions: string[], start_pos: number, append?: string) => void) => void
        autoselect_completion?: boolean
        history_path?: string
        id?: string
        [key: string]: any
    }): void

    /**
     * Open a selection list.
     * @param t.items Array of strings to display.
     * @param t.submit Called with the selected index (1-based).
     * @param t.closed Called when the list is closed without selection.
     * @param t.default_item Index of the initially selected item (1-based).
     * @param t.prompt Prompt string shown above the list.
     * @param t.keep_open If true, keep the list open after selection.
     * @param t.opened Called when the list is opened.
     * @param t.default_text Pre-filled filter/search text.
     * @param t.cursor_position Initial cursor position in filter text (1-based).
     */
    function select(t: {
        items: string[]
        submit?: (index: number) => void
        closed?: (text: string, cursor_position: number) => void
        default_item?: number
        prompt?: string
        keep_open?: boolean
        opened?: () => void
        default_text?: string
        cursor_position?: number
        [key: string]: any
    }): void

    /** Close the active input box or selection list. */
    function terminate(): void

    /**
     * Log a message in the input overlay area.
     * @param style ASS style override.
     * @param terminal_style ANSI terminal style string.
     */
    function log(message: string, style?: string, terminal_style?: string): void

    /**
     * Set the log entries displayed in the input overlay.
     * Each entry is either a plain string or an object with text and optional style.
     */
    function set_log(log: Array<string | { text: string; style?: string; terminal_style?: string }>): void
}

declare function print(...args: any[]): void
/**
 * Print a human-readable representation of obj to the console.
 * @jsonly
 */
declare function dump(obj: Object): void

/**
 * Schedule fn to run after `duration` milliseconds.
 * @jsonly
 */
declare function setTimeout(fn: (...args: any[]) => void, duration?: number, ...args: any[]): number

/**
 * Schedule fn to run repeatedly every `duration` milliseconds.
 * @jsonly
 */
declare function setInterval(fn: (...args: any[]) => void, duration?: number, ...args: any[]): number

/**
 * Cancel a timeout created with setTimeout.
 * @jsonly
 */
declare function clearTimeout(id: number): void

/**
 * Cancel an interval created with setInterval.
 * @jsonly
 */
declare function clearInterval(id: number): void

/**
 * Terminate the script.
 * Available in both Lua (since mpv 0.40) and JavaScript.
 */
declare function exit(): void