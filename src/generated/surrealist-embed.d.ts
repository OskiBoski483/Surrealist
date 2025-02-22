/* tslint:disable */
/* eslint-disable */
/**
* @param {any} details
* @returns {Promise<void>}
*/
export function open_connection(details: any): Promise<void>;
/**
* @returns {Promise<void>}
*/
export function close_connection(): Promise<void>;
/**
* @returns {Promise<any | undefined>}
*/
export function query_version(): Promise<any | undefined>;
/**
* @param {string} query
* @param {string} params
* @returns {Promise<string>}
*/
export function execute_remote_query(query: string, params: string): Promise<string>;
/**
* @param {any} details
* @param {string} query
* @param {string} params
* @returns {Promise<string>}
*/
export function execute_local_query(details: any, query: string, params: string): Promise<string>;
/**
* @param {string} definition
* @returns {any}
*/
export function extract_scope_definition(definition: string): any;
/**
* @param {string} definition
* @returns {any}
*/
export function extract_table_definition(definition: string): any;
/**
* @param {string} definition
* @returns {any}
*/
export function extract_field_definition(definition: string): any;
/**
* @param {string} definition
* @returns {any}
*/
export function extract_analyzer_definition(definition: string): any;
/**
* @param {string} definition
* @returns {any}
*/
export function extract_index_definition(definition: string): any;
/**
* @param {string} definition
* @returns {any}
*/
export function extract_event_definition(definition: string): any;
/**
* @param {string} definition
* @returns {any}
*/
export function extract_user_definition(definition: string): any;
/**
* @param {string} query
* @returns {string | undefined}
*/
export function validate_query(query: string): string | undefined;
/**
* @param {string} clause
* @returns {boolean}
*/
export function validate_where_clause(clause: string): boolean;
/**
* @param {string} query
* @returns {string | undefined}
*/
export function validate_live_query(query: string): string | undefined;
/**
*/
export function initialize_embed(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly open_connection: (a: number) => number;
  readonly close_connection: () => number;
  readonly query_version: () => number;
  readonly execute_remote_query: (a: number, b: number, c: number, d: number) => number;
  readonly execute_local_query: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly extract_scope_definition: (a: number, b: number, c: number) => void;
  readonly extract_table_definition: (a: number, b: number, c: number) => void;
  readonly extract_field_definition: (a: number, b: number, c: number) => void;
  readonly extract_analyzer_definition: (a: number, b: number, c: number) => void;
  readonly extract_index_definition: (a: number, b: number, c: number) => void;
  readonly extract_event_definition: (a: number, b: number, c: number) => void;
  readonly extract_user_definition: (a: number, b: number, c: number) => void;
  readonly validate_query: (a: number, b: number, c: number) => void;
  readonly validate_where_clause: (a: number, b: number) => number;
  readonly validate_live_query: (a: number, b: number, c: number) => void;
  readonly initialize_embed: () => void;
  readonly ring_core_0_17_5_bn_mul_mont: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly wasm_bindgen__convert__closures__invoke1_mut__h71dccea636298a34: (a: number, b: number, c: number) => void;
  readonly wasm_bindgen__convert__closures__invoke1_mut__ha14eccfabdcf55cc: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h3c0bb2d98c1bdc61: (a: number, b: number) => void;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h362688a5e9153ef2: (a: number, b: number, c: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h522e75888bc4761a: (a: number, b: number, c: number, d: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
