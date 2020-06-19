type TypesInString = "none" | "native" | "bool" | "number" | "string" | null | undefined
type ActualType<T extends TypesInString>
    = T extends null | undefined | "none" ? null
    : T extends "native" ? unknown
    : T extends "bool" ? boolean
    : T extends "number" ? number
    : T extends "string" ? string : never

type MPVEvent 
    = "event"
    | "start-file"
    | "end-file"
    | "file-loaded"

type MPVProperty
    = "time-pos"
    | "fullscreen"
    | "filename"
    | "filename/no-ext"

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

    Script initialization and lifecycle is the same as with Lua, and most of the Lua functions at the modules mp, mp.utils, mp.msg and mp.options are available to JavaScript with identical APIs - including running commands, getting/setting properties, registering events/key-bindings/hooks, etc.

    ### Differences from Lua

    No need to load modules. mp, mp.utils, mp.msg and mp.options are preloaded, and you can use e.g. var cwd = mp.utils.getcwd(); without prior setup.

    Errors are slightly different. Where the Lua APIs return nil for error, the JavaScript ones return undefined. Where Lua returns something, error JavaScript returns only something - and makes error available via mp.last_error(). Note that only some of the functions have this additional error value - typically the same ones which have it in Lua.

    Standard APIs are preferred. For instance setTimeout and JSON.stringify are available, but mp.add_timeout and mp.utils.format_json are not.

    No standard library. This means that interaction with anything outside of mpv is limited to the available APIs, typically via mp.utils. However, some file functions were added, and CommonJS require is available too - where the loaded modules have the same privileges as normal scripts.

    ### Language features - ECMAScript 5

    The scripting backend which mpv currently uses is MuJS - a compatible minimal ES5 interpreter. As such, String.substring is implemented for instance, while the common but non-standard String.substr is not. Please consult the MuJS pages on language features and platform support - http://mujs.com .

 */
declare module mp
{
    /**
        Call a specific function when an event happens. The event name is a string, and the function fn is a Lua function value.

        Some events have associated data. This is put into a Lua table and passed as argument to fn. The Lua table by default contains a name field, which is a string containing the event name. If the event has an error associated, the error field is set to a string describing the error, on success it's not set.

        If multiple functions are registered for the same event, they are run in registration order, which the first registered function running before all the other ones.
     * @param event name of the event. See https://mpv.io/manual/master/#list-of-events
     * @param fn 
     * @returns Returns true if such an event exists, false otherwise.
    */
    function register_event<T extends MPVEvent>(event: T, fn: (event: T) => void): boolean

    /**
     * Undo mp.register_event(..., fn). This removes all event handlers that are equal to the fn parameter. This uses normal Lua == comparison, so be careful when dealing with closures.
     * @param fn 
     */
    function unregister_event(fn: (event: MPVEvent) => void): void

    function get_property(name: MPVProperty): any
    function get_property_number(name: MPVProperty): number


    function register_script_message(name: string, fn: (value: any) => void): void
    function observe_property<P extends MPVProperty, T extends TypesInString>(name: P, type: T, fn: (name: P, value: ActualType<T>) => void): void

    function osd_message(text: any, duration?: number): void
    function commandv(command: string, ...args: any[]): void
}

declare module mp.utils
{
    function write_file(file: string, content: any): void
    function read_file(file: string): string
}

declare function print(text: string): void
declare function dump(obj: Object): void