import { Context, Next, Middleware } from 'hookstore';

interface Option {
  error?: (this: { ctx: Context }, err: Error) => any
}

export default (options: Option = {}): Middleware => {
  return async (ctx: Context, next: Next) => {
    let result: any;

    try {
      result = await next();
    } catch(e) {
      // const { name, action } = ctx;
      
      if (options.error) {
        options.error.call({ ctx, options }, e);
      } else {
        // console.error(`[hookstore-error] ${name}/${action}\n`, e);
        throw e;
      }
    }

    return result;
  }
}
