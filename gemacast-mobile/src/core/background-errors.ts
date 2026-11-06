/**
 * Report a background failure without turning it into a user-visible error.
 *
 * `.catch(console.warn)` reads the same but passes `warn` as an unbound function
 * and loses the stack; a dedicated helper keeps the reporting inside one place
 * and gives the production minifier a normal call to drop.
 */
export function swallow(error: unknown): void {
  console.warn(error);
}
