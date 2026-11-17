// The only place that reads the clock.

import { handle } from './handle.ts';

export default {
  fetch(request, env): Promise<Response> {
    return handle(request, env, Date.now());
  },
} satisfies ExportedHandler<Env>;
