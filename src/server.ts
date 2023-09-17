import { app } from './app'
import { env } from './env'

app
  .listen({
    port: parseFloat(env.PORT),
  })
  .then(() => {
    console.log('Server runnig in port ' + env.PORT)
  })
