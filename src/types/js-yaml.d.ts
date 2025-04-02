declare module 'js-yaml' {
  export function load(str: string, opts?: any): any;
  export function dump(obj: any, opts?: any): string;
  export function parse(str: string, opts?: any): any;
  export function stringify(obj: any, opts?: any): string;
} 